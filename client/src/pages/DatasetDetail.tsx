import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Flex,
  Heading,
  Text,
  Card,
  Badge,
  Grid,
  Button,
  Avatar,
  Dialog,
  Tooltip,
  Separator,
} from "@radix-ui/themes";
import { Database, ImageSquare, FileDoc, FileZip, FileText, Tag, CaretLeft, CaretRight, CheckCircle, Users } from "phosphor-react";
import { ExternalLinkIcon } from "@radix-ui/react-icons";
import {DataObject, datasetGraphQLService, DatasetObject, AnnotationObject, PaginationOptions} from "../services/datasetGraphQLService";
import {WALRUS_AGGREGATOR_URL} from "../services/walrusService";
import { SUI_ADDRESS_DISPLAY_LENGTH } from "../constants/suiConfig";
import { getSuiScanUrl, getWalruScanUrl } from "../utils/sui";
import {useDatasetSuiService} from "../services/datasetSuiService.ts";

// 데이터 타입에 따른 아이콘 매핑
const DATA_TYPE_ICONS: Record<string, any> = {
  "image/png": <ImageSquare size={24} />,
  "image/jpeg": <ImageSquare size={24} />,
  "text/plain": <FileText size={24} />,
  "text/csv": <FileDoc size={24} />,
  "application/zip": <FileZip size={24} />,
  default: <Database size={24} />,
};

// 데이터 타입에 따른 색상 매핑
const DATA_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  "image/png": { bg: "#E8F5E9", text: "#2E7D32" },
  "image/jpeg": { bg: "#E8F5E9", text: "#2E7D32" },
  "text/plain": { bg: "#E3F2FD", text: "#1565C0" },
  "text/csv": { bg: "#E0F7FA", text: "#00838F" },
  "application/zip": { bg: "#FFF3E0", text: "#E65100" },
  default: { bg: "#F3E8FD", text: "#7E22CE" },
};

// Annotation 색상 팔레트
const ANNOTATION_COLORS = [
  { bg: "#E3F2FD", text: "#1565C0", border: "#BBDEFB" },
  { bg: "#E8F5E9", text: "#2E7D32", border: "#C8E6C9" },
  { bg: "#FFF3E0", text: "#E65100", border: "#FFCC02" },
  { bg: "#F3E5F5", text: "#7B1FA2", border: "#CE93D8" },
  { bg: "#E0F2F1", text: "#00695C", border: "#80CBC4" },
  { bg: "#FFF8E1", text: "#F57F17", border: "#FFF176" },
  { bg: "#FCE4EC", text: "#C2185B", border: "#F8BBD9" },
  { bg: "#E1F5FE", text: "#0277BD", border: "#81D4FA" },
];

export function DatasetDetail() {
  const { addConfirmedAnnotationLabels } = useDatasetSuiService();

  const { id } = useParams<{ id: string }>();
  const [dataset, setDataset] = useState<DatasetObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedAnnotations, setSelectedAnnotations] = useState<AnnotationObject[]>([]);
  const [selectedImageData, setSelectedImageData] = useState<DataObject | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(-1);
  const [selectedPendingLabels, setSelectedPendingLabels] = useState<Set<string>>(new Set());
  
  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [paginationLoading, setPaginationLoading] = useState(false);
  const [currentCursors, setCurrentCursors] = useState<{
    startCursor?: string;
    endCursor?: string;
  }>({});
  
  // 전체 Blob 데이터 캐시 및 URL 관리
  const [blobCache, setBlobCache] = useState<Record<string, ArrayBuffer>>({});
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [blobLoading, setBlobLoading] = useState<Record<string, boolean>>({});

  // 트랜잭션 상태 관리
  const [confirmationStatus, setConfirmationStatus] = useState<{
    status: 'idle' | 'pending' | 'success' | 'failed';
    message: string;
    txHash?: string;
    confirmedLabels?: string[];
  }>({
    status: 'idle',
    message: '',
  });

  // Add new state for bounding box
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [boundingBoxes, setBoundingBoxes] = useState<BoundingBox[]>([]);
  const [currentBoundingBox, setCurrentBoundingBox] = useState<BoundingBox | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Add new state for bounding box mode
  const [isDrawingMode, setIsDrawingMode] = useState<boolean>(false);

  // Add interface for BoundingBox
  interface BoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
  }

  useEffect(() => {
    fetchDataset();
  }, [id]);

  // 데이터셋이 로드되면 필요한 Blob 데이터 가져오기
  useEffect(() => {
    if (dataset && isImageType(dataset.dataType)) {
      loadBlobData();
    }
    
    // 컴포넌트 언마운트 시 URL 정리
    return () => {
      Object.values(imageUrls).forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [dataset]);

  const fetchDataset = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!id) throw new Error("Dataset ID is required");

      const result = await datasetGraphQLService.getDatasetById(id, {
        first: pageSize
      });
      console.log("Fetched dataset:", result);
      setDataset(result);
      
      if (result?.pageInfo) {
        setCurrentCursors({
          startCursor: result.pageInfo.startCursor,
          endCursor: result.pageInfo.endCursor,
        });
      }
    } catch (error) {
      console.error("Error fetching dataset:", error);
      setError(error instanceof Error ? error.message : "Failed to load dataset");
    } finally {
      setLoading(false);
    }
  };

  const loadPage = async (direction: 'next' | 'prev') => {
    if (!id || !dataset) {
      console.warn('[Pagination] Cannot load page: missing id or dataset');
      return;
    }
    
    try {
      setPaginationLoading(true);
      console.log(`[Pagination] Loading ${direction} page, current page: ${currentPage}`);
      console.log(`[Pagination] Current cursors:`, {
        startCursor: currentCursors.startCursor ? `${currentCursors.startCursor.substring(0, 20)}...` : null,
        endCursor: currentCursors.endCursor ? `${currentCursors.endCursor.substring(0, 20)}...` : null,
      });
      
      const paginationOptions: PaginationOptions = {};
      let targetPage = currentPage;
      
      if (direction === 'next') {
        if (!dataset.pageInfo?.hasNextPage) {
          console.warn('[Pagination] No next page available');
          return;
        }
        if (!currentCursors.endCursor) {
          console.warn('[Pagination] No endCursor available for next page');
          return;
        }
        paginationOptions.first = pageSize;
        paginationOptions.after = currentCursors.endCursor;
        targetPage = currentPage + 1;
      } else if (direction === 'prev') {
        if (!dataset.pageInfo?.hasPreviousPage) {
          console.warn('[Pagination] No previous page available');
          return;
        }
        if (!currentCursors.startCursor) {
          console.warn('[Pagination] No startCursor available for previous page');
          return;
        }
        paginationOptions.last = pageSize;
        paginationOptions.before = currentCursors.startCursor;
        targetPage = Math.max(1, currentPage - 1);
      }

      console.log(`[Pagination] Requesting page ${targetPage} with options:`, {
        ...paginationOptions,
        after: paginationOptions.after ? `${paginationOptions.after.substring(0, 20)}...` : undefined,
        before: paginationOptions.before ? `${paginationOptions.before.substring(0, 20)}...` : undefined,
      });

      const paginatedData = await datasetGraphQLService.getDatasetData(id, paginationOptions);
      
      if (!paginatedData || !paginatedData.data) {
        throw new Error('No data received from pagination request');
      }
      
      console.log(`[Pagination] Successfully loaded ${paginatedData.data.length} items`);
      console.log(`[Pagination] New pageInfo:`, {
        hasNextPage: paginatedData.pageInfo.hasNextPage,
        hasPreviousPage: paginatedData.pageInfo.hasPreviousPage,
        startCursor: paginatedData.pageInfo.startCursor ? `${paginatedData.pageInfo.startCursor.substring(0, 20)}...` : null,
        endCursor: paginatedData.pageInfo.endCursor ? `${paginatedData.pageInfo.endCursor.substring(0, 20)}...` : null,
      });
      
      if (dataset && paginatedData) {
        // 이미지 URL 초기화 (새 페이지 데이터이므로)
        Object.values(imageUrls).forEach(url => {
          if (url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
          }
        });
        setImageUrls({});
        
        // 데이터셋 객체 업데이트
        const updatedDataset = {
          ...dataset,
          data: paginatedData.data,
          pageInfo: paginatedData.pageInfo,
        };
        setDataset(updatedDataset);
        
        // 커서 및 페이지 상태 업데이트
        setCurrentCursors({
          startCursor: paginatedData.pageInfo.startCursor,
          endCursor: paginatedData.pageInfo.endCursor,
        });
        setCurrentPage(targetPage);
        
        console.log(`[Pagination] Page ${targetPage} loaded successfully`);
      }
    } catch (error) {
      console.error(`[Pagination] Error loading ${direction} page:`, error);
      
      // 특정 에러의 경우 첫 페이지로 fallback
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('outside the available range') || 
          errorMessage.includes('invalid cursor') ||
          errorMessage.includes('GraphQL error')) {
        console.warn('[Pagination] Cursor error detected, falling back to first page');
        
        try {
          // 첫 페이지로 fallback
          const firstPageData = await datasetGraphQLService.getDatasetData(id, { first: pageSize });
          
          if (firstPageData && dataset) {
            // 이미지 URL 초기화
            Object.values(imageUrls).forEach(url => {
              if (url.startsWith('blob:')) {
                URL.revokeObjectURL(url);
              }
            });
            setImageUrls({});
            
            const updatedDataset = {
              ...dataset,
              data: firstPageData.data,
              pageInfo: firstPageData.pageInfo,
            };
            setDataset(updatedDataset);
            
            setCurrentCursors({
              startCursor: firstPageData.pageInfo.startCursor,
              endCursor: firstPageData.pageInfo.endCursor,
            });
            setCurrentPage(1);
            
            console.log('[Pagination] Successfully reset to first page');
            setError("Pagination error occurred. Returned to first page.");
          }
        } catch (fallbackError) {
          console.error('[Pagination] Fallback to first page failed:', fallbackError);
          setError("Failed to load page data. Please refresh the page.");
        }
      } else {
        setError(errorMessage);
      }
    } finally {
      setPaginationLoading(false);
    }
  };

  // 각 고유한 blobId에 대해 전체 Blob 데이터를 한 번만 가져오기
  const loadBlobData = async () => {
    if (!dataset || !dataset.data.length) return;

    // 고유한 blobId 추출
    const uniqueBlobIds = Array.from(new Set(dataset.data.map(item => item.blobId)));
    console.log(`Unique blob IDs: ${uniqueBlobIds.join(", ")}`);
    
    // 로딩 상태 초기화
    const newLoadingState: Record<string, boolean> = {};
    uniqueBlobIds.forEach(blobId => {
      newLoadingState[blobId] = true;
    });
    setBlobLoading(newLoadingState);

    // 각 고유한 blobId에 대해 한 번만 전체 데이터 가져오기
    for (const blobId of uniqueBlobIds) {
      try {
        // 이미 캐시되어 있는지 확인
        if (blobCache[blobId]) {
          processBlob(blobId, blobCache[blobId]);
          continue;
        }

        console.log(`Loading blob data for ${blobId}...`);
        const response = await fetch(`${WALRUS_AGGREGATOR_URL}/v1/blobs/${blobId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch blob: ${response.status} ${response.statusText}`);
        }
        
        // 전체 Blob 데이터를 ArrayBuffer로 변환
        const blob = await response.blob();
        const buffer = await blob.arrayBuffer();

        // // walrusClient API를 사용하여 Blob 데이터 가져오기
        // const uint8Array = await walrusClient.readBlob({ blobId });
        
        // // Uint8Array에서 ArrayBuffer 추출
        // const buffer = uint8Array.buffer;
        
        // 캐시에 저장
        setBlobCache(prev => ({
          ...prev, 
          [blobId]: buffer
        }));
        
        console.log(`Blob ${blobId} loaded (${buffer.byteLength} bytes)`);
        
        // 이 Blob을 참조하는 모든 이미지 처리
        processBlob(blobId, buffer);
      } catch (error) {
        console.error(`Error loading blob ${blobId}:`, error);
      } finally {
        // 로딩 상태 업데이트
        setBlobLoading(prev => ({
          ...prev,
          [blobId]: false
        }));
      }
    }
  };

  // 가져온 Blob 데이터를 처리하여 개별 이미지 URL 생성
  const processBlob = (blobId: string, buffer: ArrayBuffer) => {
    if (!dataset) return;
    
    const newImageUrls = {...imageUrls};
    
    // 같은 blobId를 참조하는 모든 항목 처리
    dataset.data.forEach((item: DataObject, index: number) => {
      if (item.blobId !== blobId) return;
      
      try {
        // range 정보가 있으면 해당 부분만 추출
        let imageBlob: Blob;
        const itemType = item.dataType || 'image/jpeg';

        if (item.range && item.range.start && item.range.end) {
          const start = parseInt(String(item.range.start), 10);
          const end = parseInt(String(item.range.end), 10) + 1; // end는 포함되므로 +1

          // NaN 체크를 통한 유효성 검증
          if (!isNaN(start) && !isNaN(end)) {
            console.log("bytes buffer length: ", buffer.byteLength);
            if (start >= 0 && end <= buffer.byteLength && start < end) {
              // 범위 내 데이터만 추출
              const slice = buffer.slice(start, end);
              imageBlob = new Blob([slice], { type: itemType });
              console.log(`Blob ${blobId} sliced from ${start} to ${end} (${slice.byteLength} bytes)`);
            } else {
              console.warn(`Invalid range for item ${index}: [${start}, ${end}] (buffer size: ${buffer.byteLength})`);
              imageBlob = new Blob([buffer], { type: itemType });
            }
          } else {
            console.warn(`Invalid number format for range values: start=${item.range.start}, end=${item.range.end}`);
            imageBlob = new Blob([buffer], { type: itemType });
          }
        } else {
          // range 정보가 없으면 전체 사용
          imageBlob = new Blob([buffer], { type: itemType });
        }
        
        // URL 생성
        const url = URL.createObjectURL(imageBlob);
        console.log(`Created URL for item ${index}: ${url}`);
        newImageUrls[`${blobId}_${index}`] = url;
      } catch (error) {
        console.error(`Error creating image URL for item ${index}:`, error);
      }
    });
    
    setImageUrls(newImageUrls);
  };

  // 이미지 URL 가져오기
  const getImageUrl = (item: DataObject, index: number) => {
    const cacheKey = `${item.blobId}_${index}`;
    if (imageUrls[cacheKey]) {
      return imageUrls[cacheKey];
    }
    // 캐시된 URL이 없으면 기본 URL 반환
    return `${WALRUS_AGGREGATOR_URL}/v1/blobs/${item.blobId}`;
  };

  // 로딩 상태 확인
  const isItemLoading = (item: DataObject) => {
    return blobLoading[item.blobId];
  };

  // Annotation 색상 가져오기
  const getAnnotationColor = (index: number) => {
    return ANNOTATION_COLORS[index % ANNOTATION_COLORS.length];
  };

  // 이미지 클릭 시 상세보기
  const handleImageClick = (item: DataObject, index: number) => {
    setSelectedImage(getImageUrl(item, index));
    setSelectedAnnotations(item.annotations);
    setSelectedImageData(item);
    setSelectedImageIndex(index);
  };

  // 확정된 annotation 라벨 목록 가져오기
  const getConfirmedLabels = (): Set<string> => {
    return new Set(selectedAnnotations.map(annotation => annotation.label));
  };

  // Annotation 선택/해제 핸들러
  const handleTogglePendingAnnotation = (label: string) => {
    const confirmedLabels = getConfirmedLabels();
    
    // 이미 확정된 라벨인지 체크
    if (confirmedLabels.has(label)) {
      alert(`"${label}" is already confirmed and cannot be selected again.`);
      return;
    }

    setSelectedPendingLabels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(label)) {
        newSet.delete(label);
      } else {
        newSet.add(label);
      }
      return newSet;
    });
  };

  // 선택된 Annotation들 승인 핸들러
  const handleConfirmSelectedAnnotations = async () => {
    if (selectedPendingLabels.size === 0) {
      setConfirmationStatus({
        status: 'failed',
        message: 'Please select annotations to confirm',
      });
      return;
    }

    if (!dataset || !selectedImageData) {
      setConfirmationStatus({
        status: 'failed',
        message: 'Dataset or image data not found',
      });
      return;
    }

    const labels = Array.from(selectedPendingLabels);
    console.log(`Confirming annotations: ${labels.join(', ')} for image ${selectedImageIndex}`);

    try {
      setConfirmationStatus({
        status: 'pending',
        message: `Confirming ${labels.length} annotation(s) on blockchain...`,
      });

      const result = await addConfirmedAnnotationLabels(dataset, {
        path: selectedImageData.path,
        label: labels,
      });
      
      // 성공 처리
      setConfirmationStatus({
        status: 'success',
        message: `Successfully confirmed ${labels.length} annotation(s)!`,
        txHash: (result as any)?.digest || undefined,
        confirmedLabels: labels,
      });
      
      console.log("Annotations confirmed successfully:", result);
      
      // 선택 상태 초기화
      setSelectedPendingLabels(new Set());
      
      // 3초 후 상태 초기화
      setTimeout(() => {
        setConfirmationStatus({
          status: 'idle',
          message: '',
        });
      }, 3000);
      
    } catch (error) {
      console.error("Error confirming annotations:", error);
      setConfirmationStatus({
        status: 'failed',
        message: error instanceof Error ? error.message : "Failed to confirm annotations",
      });
    }
  };

  // 모달 닫기 핸들러
  const handleCloseModal = () => {
    console.log("Closing modal");
    setSelectedImage(null);
    setSelectedAnnotations([]);
    setSelectedImageData(null);
    setSelectedImageIndex(-1);
    setSelectedPendingLabels(new Set());
    setIsDrawingMode(false);
    setBoundingBoxes([]);
    // 확인 상태도 초기화
    setConfirmationStatus({
      status: 'idle',
      message: '',
    });
  };

  // Add function to check if image has confirmed annotations
  const hasConfirmedAnnotations = (item: DataObject): boolean => {
    console.log("Checking if image has confirmed annotations:", item);
    const confirmedCount = item.annotations.length;
    console.log("Confirmed annotations count:", confirmedCount);
    return confirmedCount > 0;
  };

  // Add function to handle drawing mode toggle
  const handleDrawingModeToggle = (enabled: boolean) => {
    console.log("Toggling drawing mode:", enabled);
    if (!selectedImageData) {
      console.log("No image selected");
      return;
    }

    const isConfirmed = hasConfirmedAnnotations(selectedImageData);
    console.log("Has confirmed annotations:", isConfirmed);
    
    if (!isConfirmed) {
      console.log("Cannot enter drawing mode: no confirmed annotations");
      return;
    }
    
    setIsDrawingMode(enabled);
    if (!enabled) {
      setBoundingBoxes([]);
    }
  };

  // Add effect to monitor state changes
  useEffect(() => {
    console.log("State changed - isDrawingMode:", isDrawingMode);
    console.log("State changed - boundingBoxes:", boundingBoxes);
  }, [isDrawingMode, boundingBoxes]);

  // Add function to draw bounding box on canvas
  const drawBoundingBox = (ctx: CanvasRenderingContext2D, box: BoundingBox, isTemp: boolean = false) => {
    ctx.strokeStyle = isTemp ? 'rgba(255, 87, 51, 0.8)' : 'rgb(255, 87, 51)';
    ctx.lineWidth = 2;
    ctx.strokeRect(box.x, box.y, box.width, box.height);
  };

  // Add function to handle mouse events for drawing
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDrawing(true);
    setStartPoint({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const width = x - startPoint.x;
    const height = y - startPoint.y;

    const box = {
      x: width > 0 ? startPoint.x : x,
      y: height > 0 ? startPoint.y : y,
      width: Math.abs(width),
      height: Math.abs(height)
    };

    setCurrentBoundingBox(box);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Redraw image
    const img = new Image();
    img.src = selectedImage || '';
    ctx.drawImage(img, 0, 0);
    
    // Draw all existing boxes
    boundingBoxes.forEach(existingBox => drawBoundingBox(ctx, existingBox));
    
    // Draw current box
    drawBoundingBox(ctx, box, true);
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentBoundingBox || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    setBoundingBoxes([...boundingBoxes, currentBoundingBox]);
    setIsDrawing(false);
    setStartPoint(null);
    setCurrentBoundingBox(null);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Redraw image
    const img = new Image();
    img.src = selectedImage || '';
    ctx.drawImage(img, 0, 0);
    
    // Draw all boxes including the new one
    [...boundingBoxes, currentBoundingBox].forEach(box => drawBoundingBox(ctx, box));
  };

  // Add effect to initialize canvas when drawing mode changes
  useEffect(() => {
    if (selectedImage && canvasRef.current && isDrawingMode) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.src = selectedImage;
      
      img.onload = () => {
        // Set canvas dimensions to match image dimensions
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Clear canvas and draw image
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        // Draw existing bounding boxes
        boundingBoxes.forEach(box => drawBoundingBox(ctx, box));
      };
    }
  }, [selectedImage, isDrawingMode]);

  // 고유한 Blob ID 가져오기 (WalrusScan 링크용)
  const getUniqueBlobId = () => {
    if (!dataset || !dataset.data.length) return null;
    return dataset.data[0].blobId; // 모든 데이터가 같은 Blob에 저장되므로 첫 번째 것 사용
  };

  const formatDataSize = (size: string | number): { value: string; unit: string } => {
    const numSize = typeof size === "string" ? parseInt(size) : Number(size);

    if (numSize < 1024) {
      return {
        value: numSize.toString(),
        unit: "bytes",
      };
    }
    if (numSize < 1024 * 1024) {
      return {
        value: (numSize / 1024).toFixed(1),
        unit: "KB",
      };
    }
    if (numSize < 1024 * 1024 * 1024) {
      return {
        value: (numSize / (1024 * 1024)).toFixed(1),
        unit: "MB",
      };
    }
    return {
      value: (numSize / (1024 * 1024 * 1024)).toFixed(1),
      unit: "GB",
    };
  };

  const getDataTypeIcon = (dataType: string) => {
    const key = Object.keys(DATA_TYPE_ICONS).find(type => dataType.includes(type)) || "default";
    return DATA_TYPE_ICONS[key];
  };

  const getDataTypeColor = (dataType: string) => {
    const key = Object.keys(DATA_TYPE_COLORS).find(type => dataType.includes(type)) || "default";
    return DATA_TYPE_COLORS[key];
  };

  const isImageType = (dataType: string) => {
    return dataType.startsWith("image/");
  };

  const isAnyBlobLoading = () => {
    if (!dataset) return false;
    return Object.values(blobLoading).some(loading => loading === true);
  };

  // 페이지네이션 컴포넌트
  const PaginationControls = () => {
    if (!dataset?.pageInfo) return null;

    const hasNextPage = dataset.pageInfo.hasNextPage;
    const hasPreviousPage = dataset.pageInfo.hasPreviousPage;
    const hasValidNextCursor = hasNextPage && currentCursors.endCursor;
    const hasValidPrevCursor = hasPreviousPage && currentCursors.startCursor;

    return (
      <Card
        style={{
          padding: "20px",
          borderRadius: "12px",
          border: "1px solid var(--gray-4)",
          background: "white",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
          marginTop: "24px",
        }}
      >
        <Flex align="center" justify="between">
          <Flex align="center" gap="3">
            <Text size="2" style={{ color: "var(--gray-11)", fontWeight: 500 }}>
              Page {currentPage}
            </Text>
            <Badge
              style={{
                background: "var(--blue-3)",
                color: "var(--blue-11)",
                padding: "4px 8px",
                borderRadius: "6px",
                fontSize: "11px",
                fontWeight: "500",
              }}
            >
              {dataset.data.length} items
            </Badge>
            {/* 페이지네이션 상태 표시 */}
            <Badge
              style={{
                background: "var(--green-3)",
                color: "var(--green-11)",
                padding: "4px 8px",
                borderRadius: "6px",
                fontSize: "11px",
                fontWeight: "500",
              }}
            >
              Paginated View
            </Badge>
          </Flex>

          <Flex align="center" gap="2">
            <Button
              variant="soft"
              size="2"
              disabled={!hasValidPrevCursor || paginationLoading}
              onClick={() => {
                console.log('[UI] Previous button clicked');
                if (hasValidPrevCursor && !paginationLoading) {
                  loadPage('prev');
                } else {
                  console.warn('[UI] Cannot go to previous page:', {
                    hasValidPrevCursor,
                    paginationLoading,
                    hasPreviousPage,
                    startCursor: currentCursors.startCursor ? 'present' : 'missing'
                  });
                }
              }}
              style={{
                background: hasValidPrevCursor ? "var(--gray-3)" : "var(--gray-2)",
                color: hasValidPrevCursor ? "var(--gray-12)" : "var(--gray-8)",
                borderRadius: "8px",
                cursor: hasValidPrevCursor && !paginationLoading ? "pointer" : "not-allowed",
                opacity: hasValidPrevCursor && !paginationLoading ? 1 : 0.5,
              }}
            >
              <CaretLeft size={16} />
              Previous
            </Button>

            <Box
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                borderRadius: "8px",
                padding: "8px 12px",
                color: "white",
                fontWeight: "600",
                fontSize: "14px",
                minWidth: "40px",
                textAlign: "center",
              }}
            >
              {currentPage}
            </Box>

            <Button
              variant="soft"
              size="2"
              disabled={!hasValidNextCursor || paginationLoading}
              onClick={() => {
                console.log('[UI] Next button clicked');
                if (hasValidNextCursor && !paginationLoading) {
                  loadPage('next');
                } else {
                  console.warn('[UI] Cannot go to next page:', {
                    hasValidNextCursor,
                    paginationLoading,
                    hasNextPage,
                    endCursor: currentCursors.endCursor ? 'present' : 'missing'
                  });
                }
              }}
              style={{
                background: hasValidNextCursor ? "var(--gray-3)" : "var(--gray-2)",
                color: hasValidNextCursor ? "var(--gray-12)" : "var(--gray-8)",
                borderRadius: "8px",
                cursor: hasValidNextCursor && !paginationLoading ? "pointer" : "not-allowed",
                opacity: hasValidNextCursor && !paginationLoading ? 1 : 0.5,
              }}
            >
              Next
              <CaretRight size={16} />
            </Button>
          </Flex>

          <Flex align="center" gap="2">
            {paginationLoading && (
              <Flex align="center" gap="2">
                <Box
                  style={{
                    width: "16px",
                    height: "16px",
                    border: "2px solid var(--gray-4)",
                    borderTop: "2px solid var(--blue-9)",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                />
                <Text size="2" style={{ color: "var(--gray-11)" }}>
                  Loading...
                </Text>
              </Flex>
            )}
            {/* 디버그 정보 (개발 환경에서만) */}
            {process.env.NODE_ENV === 'development' && (
              <Text size="1" style={{ color: "var(--gray-10)", fontSize: "10px" }}>
                Next: {hasNextPage ? '✓' : '✗'} |
                Prev: {hasPreviousPage ? '✓' : '✗'} |
                Cursors: {currentCursors.endCursor ? 'E✓' : 'E✗'}{currentCursors.startCursor ? 'S✓' : 'S✗'}
              </Text>
            )}
          </Flex>
        </Flex>
      </Card>
    );
  };

  // 확인 상태 표시 컴포넌트
  const ConfirmationStatusDisplay = () => {
    if (confirmationStatus.status === 'idle') return null;

    const getStatusConfig = () => {
      switch (confirmationStatus.status) {
        case 'pending':
          return {
            bg: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
            border: 'var(--blue-6)',
            text: 'var(--blue-11)',
            icon: '⏳',
            title: 'Confirming Annotations'
          };
        case 'success':
          return {
            bg: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
            border: 'var(--green-6)',
            text: 'var(--green-11)',
            icon: '✅',
            title: 'Confirmation Successful'
          };
        case 'failed':
          return {
            bg: 'linear-gradient(135deg, #FEF2F2 0%, #FECACA 100%)',
            border: 'var(--red-6)',
            text: 'var(--red-11)',
            icon: '❌',
            title: 'Confirmation Failed'
          };
        default:
          return {
            bg: 'var(--gray-2)',
            border: 'var(--gray-6)',
            text: 'var(--gray-11)',
            icon: 'ℹ️',
            title: 'Status'
          };
      }
    };

    const config = getStatusConfig();

    return (
      <Card
        style={{
          background: config.bg,
          border: `2px solid ${config.border}`,
          padding: "20px",
          borderRadius: "16px",
          marginBottom: "20px",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
          animation: confirmationStatus.status === 'pending' ? 'pulse 2s ease-in-out infinite' : 'none',
        }}
      >
        <Flex align="center" gap="4" justify="between">
          <Flex align="center" gap="4">
            {/* 상태 아이콘 */}
            <Box
              style={{
                fontSize: "24px",
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                animation: confirmationStatus.status === 'pending' ? 'spin 2s linear infinite' : 'none',
              }}
            >
              {confirmationStatus.status === 'pending' ? (
                <Box
                  style={{
                    width: "20px",
                    height: "20px",
                    border: `3px solid ${config.text}`,
                    borderTop: "3px solid transparent",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                />
              ) : (
                config.icon
              )}
            </Box>
            
            <Flex direction="column" gap="2">
              <Heading size="4" style={{ color: config.text, fontWeight: 700 }}>
                {config.title}
              </Heading>
              <Text size="3" style={{ color: config.text, opacity: 0.9 }}>
                {confirmationStatus.message}
              </Text>
              
              {/* 확인된 라벨 표시 */}
              {confirmationStatus.status === 'success' && confirmationStatus.confirmedLabels && (
                <Flex gap="2" wrap="wrap" style={{ marginTop: "8px" }}>
                  {confirmationStatus.confirmedLabels.map((label, index) => (
                    <Badge
                      key={index}
                      style={{
                        background: "var(--green-9)",
                        color: "white",
                        padding: "4px 8px",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: "600",
                      }}
                    >
                      ✓ {label}
                    </Badge>
                  ))}
                </Flex>
              )}
              
              {/* 트랜잭션 해시 */}
              {confirmationStatus.txHash && (
                <Text 
                  size="1" 
                  style={{ 
                    color: config.text, 
                    opacity: 0.7, 
                    fontFamily: 'monospace',
                    fontSize: "10px",
                    marginTop: "4px"
                  }}
                >
                  TX: {confirmationStatus.txHash.substring(0, 24)}...
                </Text>
              )}
            </Flex>
          </Flex>

          {/* 액션 버튼들 */}
          <Flex gap="2">
            {/* 재시도 버튼 (실패 시에만) */}
            {confirmationStatus.status === 'failed' && (
              <Button
                size="2"
                variant="soft"
                onClick={() => {
                  setConfirmationStatus({ status: 'idle', message: '' });
                  handleConfirmSelectedAnnotations();
                }}
                style={{
                  background: config.text,
                  color: 'white',
                  borderRadius: "8px",
                  padding: "0 16px",
                }}
              >
                Retry
              </Button>
            )}

            {/* 닫기 버튼 */}
            {(confirmationStatus.status === 'success' || confirmationStatus.status === 'failed') && (
              <Button
                size="1"
                variant="ghost"
                onClick={() => setConfirmationStatus({ status: 'idle', message: '' })}
                style={{
                  color: config.text,
                  opacity: 0.7,
                  padding: "4px",
                }}
              >
                ✕
              </Button>
            )}
          </Flex>
        </Flex>
      </Card>
    );
  };

  // Add clearBoundingBoxes function
  const clearBoundingBoxes = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear all bounding boxes from state
    setBoundingBoxes([]);
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Redraw only the image
    const img = new Image();
    img.src = selectedImage || '';
    ctx.drawImage(img, 0, 0);
  };

  if (loading) {
    return (
      <Flex align="center" justify="center" style={{ height: "80vh" }}>
        <Text size="3">Loading dataset...</Text>
      </Flex>
    );
  }

  if (error || !dataset) {
    return (
      <Flex align="center" justify="center" style={{ height: "80vh" }}>
        <Text size="3" color="red">
          {error || "Dataset not found"}
        </Text>
      </Flex>
    );
  }

  return (
    <Box style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 32px" }}>
      {/* 데이터셋 헤더 */}
      <Card
        style={{
          padding: "32px",
          borderRadius: "16px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
          marginBottom: "32px",
          border: "1px solid var(--gray-4)",
          background: "linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)",
        }}
      >
        <Flex direction="column" gap="6">
          <Flex align="center" gap="4">
            <Box
              style={{
                background: getDataTypeColor(dataset.dataType).bg,
                color: getDataTypeColor(dataset.dataType).text,
                borderRadius: "12px",
                width: "56px",
                height: "56px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              }}
            >
              {getDataTypeIcon(dataset.dataType)}
            </Box>
            <Box style={{ flex: 1 }}>
              <Heading size="7" mb="2" style={{ fontWeight: 700 }}>
                {dataset.name}
              </Heading>
              <Flex align="center" gap="3">
                <Badge
                  style={{
                    background: getDataTypeColor(dataset.dataType).bg,
                    color: getDataTypeColor(dataset.dataType).text,
                    padding: "6px 12px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                >
                  {dataset.dataType}
                </Badge>
                <Badge
                  style={{
                    background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)",
                    color: "white",
                    padding: "6px 12px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                >
                  On-Chain Dataset
                </Badge>
              </Flex>
            </Box>
            <Flex gap="3">
              {getUniqueBlobId() && (
                <Tooltip content="View dataset blob on WalrusScan">
                  <Button
                    variant="soft"
                    style={{
                      borderRadius: "12px",
                      background: "#E0F7FA",
                      color: "#00838F",
                      border: "1px solid #B2EBF2",
                      padding: "0 20px",
                      height: "40px",
                    }}
                    onClick={() => window.open(getWalruScanUrl(getUniqueBlobId()!), "_blank")}
                  >
                    <Flex align="center" gap="2">
                      <Database size={16} />
                      <Text size="2" weight="medium">WalrusScan</Text>
                      <ExternalLinkIcon />
                    </Flex>
                  </Button>
                </Tooltip>
              )}
              <Tooltip content="View dataset on Sui Explorer">
                <Button
                  variant="soft"
                  style={{
                    borderRadius: "12px",
                    background: "#FFF4F2",
                    color: "#FF5733",
                    border: "1px solid #FFE8E2",
                    padding: "0 20px",
                    height: "40px",
                  }}
                  onClick={() => window.open(getSuiScanUrl("object", dataset.id), "_blank")}
                >
                  <Flex align="center" gap="2">
                    <Text size="2" weight="medium">Sui Explorer</Text>
                    <ExternalLinkIcon />
                  </Flex>
                </Button>
              </Tooltip>
            </Flex>
          </Flex>

          <Text size="4" style={{ color: "var(--gray-11)", lineHeight: "1.6" }}>
            {dataset.description || "No description provided"}
          </Text>

          <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="4">
            <Card
              style={{
                padding: "20px",
                background: "linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)",
                border: "1px solid #90CAF9",
                borderRadius: "12px",
              }}
            >
              <Flex align="center" gap="3">
                <Box
                  style={{
                    background: "white",
                    borderRadius: "10px",
                    padding: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <Database size={20} style={{ color: "#1565C0" }} />
                </Box>
                <Flex direction="column" gap="1">
                  <Text size="2" style={{ color: "#0D47A1", fontWeight: 600, opacity: 0.8 }}>
                    Total Size
                  </Text>
                  <Text size="5" style={{ fontWeight: 700, color: "#0D47A1" }}>
                    {formatDataSize(dataset.dataSize).value}
                    <Text size="2" style={{ marginLeft: "4px", fontWeight: 500, opacity: 0.8 }}>
                      {formatDataSize(dataset.dataSize).unit}
                    </Text>
                  </Text>
                </Flex>
              </Flex>
            </Card>

            <Card
              style={{
                padding: "20px",
                background: "linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)",
                border: "1px solid #A5D6A7",
                borderRadius: "12px",
              }}
            >
              <Flex align="center" gap="3">
                <Box
                  style={{
                    background: "white",
                    borderRadius: "10px",
                    padding: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <ImageSquare size={20} style={{ color: "#2E7D32" }} />
                </Box>
                <Flex direction="column" gap="1">
                  <Text size="2" style={{ color: "#1B5E20", fontWeight: 600, opacity: 0.8 }}>
                    Total Items
                  </Text>
                  <Text size="5" style={{ fontWeight: 700, color: "#1B5E20" }}>
                    {dataset.dataCount}
                    <Text size="2" style={{ marginLeft: "4px", fontWeight: 500, opacity: 0.8 }}>
                      files
                    </Text>
                  </Text>
                </Flex>
              </Flex>
            </Card>

            <Card
              style={{
                padding: "20px",
                background: "linear-gradient(135deg, #F3E5F5 0%, #CE93D8 100%)",
                border: "1px solid #BA68C8",
                borderRadius: "12px",
              }}
            >
              <Flex align="center" gap="3">
                <Box
                  style={{
                    background: "white",
                    borderRadius: "10px",
                    padding: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <Tag size={20} style={{ color: "#7B1FA2" }} />
                </Box>
                <Flex direction="column" gap="1">
                  <Text size="2" style={{ color: "#4A148C", fontWeight: 600, opacity: 0.8 }}>
                    Annotations
                  </Text>
                  <Text size="5" style={{ fontWeight: 700, color: "#4A148C" }}>
                    {dataset.data.reduce((sum, item) => sum + item.annotations.length, 0)}
                    <Text size="2" style={{ marginLeft: "4px", fontWeight: 500, opacity: 0.8 }}>
                      total
                    </Text>
                  </Text>
                </Flex>
              </Flex>
            </Card>
          </Grid>

          {dataset.tags && dataset.tags.length > 0 && (
            <Flex gap="2" wrap="wrap">
              {dataset.tags.map((tag, index) => (
                <Badge
                  key={index}
                  style={{
                    background: "var(--gray-3)",
                    color: "var(--gray-11)",
                    padding: "6px 12px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: "500",
                  }}
                >
                  {tag}
                </Badge>
              ))}
            </Flex>
          )}

          <Flex align="center" gap="3">
            <Avatar
              size="3"
              src=""
              fallback={dataset.creator ? dataset.creator[0] : "U"}
              radius="full"
              style={{
                background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)",
                boxShadow: "0 4px 12px rgba(255, 107, 107, 0.3)",
              }}
            />
            <Tooltip content="View creator on Sui Explorer">
              <Text
                size="3"
                style={{
                  color: "var(--gray-11)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "color 0.2s ease",
                  fontWeight: 500,
                }}
                className="hover-effect"
                onClick={() =>
                  window.open(getSuiScanUrl("account", dataset.creator || ""), "_blank")
                }
              >
                Created by {dataset.creator
                  ? `${dataset.creator.substring(0, SUI_ADDRESS_DISPLAY_LENGTH)}...`
                  : "Unknown"}
                <ExternalLinkIcon style={{ width: "14px", height: "14px", opacity: 0.7 }} />
              </Text>
            </Tooltip>
          </Flex>
        </Flex>
      </Card>

      {/* 데이터셋 콘텐츠 */}
      <Card
        style={{
          padding: "32px",
          borderRadius: "16px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
          border: "1px solid var(--gray-4)",
          background: "linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)",
        }}
      >
        <Flex direction="column" gap="6">
          <Flex align="center" justify="between">
            <Flex direction="column" gap="2">
              <Heading size="5" style={{ fontWeight: 600 }}>Dataset Contents</Heading>
              
              {/* 심플한 로딩 상태 표시 */}
              {isAnyBlobLoading() && isImageType(dataset.dataType) && (
                <Flex align="center" gap="2">
                  <Box
                    style={{
                      width: "16px",
                      height: "16px",
                      border: "2px solid var(--gray-4)",
                      borderTop: "2px solid var(--blue-9)",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                  <Text size="2" style={{ color: "var(--gray-11)" }}>
                    Loading images...
                  </Text>
                </Flex>
              )}
            </Flex>
          </Flex>

          <Grid columns={{ initial: "2", sm: "3", md: "4", lg: "5" }} gap="4">
            {dataset.data.map((item: DataObject, index: number) => (
              <Card
                key={index}
                style={{
                  padding: "16px",
                  border: "1px solid var(--gray-4)",
                  borderRadius: "12px",
                  background: "white",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
                className="item-card-hover"
              >
                {isImageType(dataset.dataType) ? (
                  <Box>
                    <Box
                      style={{
                        width: "100%",
                        paddingBottom: "100%",
                        position: "relative",
                        marginBottom: "12px",
                        background: "var(--gray-3)",
                        borderRadius: "8px",
                        overflow: "hidden",
                      }}
                      onClick={() => !isItemLoading(item) && handleImageClick(item, index)}
                    >
                      {/* Blob 로딩 상태 표시 */}
                      {isItemLoading(item) ? (
                        <Box
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            background: "linear-gradient(90deg, var(--gray-3) 25%, var(--gray-4) 50%, var(--gray-3) 75%)",
                            backgroundSize: "200% 100%",
                            animation: "shimmer 1.5s infinite ease-in-out",
                          }}
                        />
                      ) : (
                        <img
                          src={getImageUrl(item, index)}
                          alt={`Dataset item ${index + 1}`}
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                          onError={(e) => {
                            console.error(`Error loading image ${index}:`, e);
                            (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpolyline points='21 15 16 10 5 21'/%3E%3C/svg%3E";
                          }}
                        />
                      )}
                      
                      {/* Annotation 표시 */}
                      {!isItemLoading(item) && item.annotations.length > 0 && (
                        <Box
                          style={{
                            position: "absolute",
                            top: "8px",
                            right: "8px",
                            background: "rgba(255, 255, 255, 0.95)",
                            backdropFilter: "blur(8px)",
                            borderRadius: "8px",
                            padding: "4px",
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                          }}
                        >
                          <Flex align="center" gap="1">
                            <Tag size={12} style={{ color: "var(--violet-9)" }} />
                            <Text size="1" style={{ fontWeight: 600, color: "var(--gray-12)" }}>
                              {item.annotations.length}
                            </Text>
                          </Flex>
                        </Box>
                      )}
                    </Box>

                    {/* Annotation 목록 - 향상된 UI */}
                    {item.annotations.length > 0 && (
                      <Flex direction="column" gap="2">
                        <Text size="1" style={{ color: "var(--gray-10)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          Annotations ({item.annotations.length})
                        </Text>
                        <Flex direction="column" gap="1" style={{ maxHeight: "80px", overflowY: "auto" }}>
                          {item.annotations.map((annotation: AnnotationObject, annotationIndex: number) => {
                            const colorScheme = getAnnotationColor(annotationIndex);
                            return (
                              <Badge
                                key={annotationIndex}
                                style={{
                                  background: colorScheme.bg,
                                  color: colorScheme.text,
                                  border: `1px solid ${colorScheme.border}`,
                                  padding: "4px 8px",
                                  borderRadius: "6px",
                                  fontSize: "11px",
                                  fontWeight: "500",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  transition: "all 0.2s ease",
                                }}
                                className="annotation-badge-hover"
                              >
                                {annotation.label}
                              </Badge>
                            );
                          })}
                        </Flex>
                      </Flex>
                    )}
                  </Box>
                ) : (
                  <Flex direction="column" gap="3">
                    <Box
                      style={{
                        background: getDataTypeColor(dataset.dataType).bg,
                        color: getDataTypeColor(dataset.dataType).text,
                        borderRadius: "8px",
                        padding: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {getDataTypeIcon(dataset.dataType)}
                    </Box>
                    
                    {/* 파일 타입 데이터의 Annotation 표시 */}
                    {item.annotations.length > 0 && (
                      <Flex direction="column" gap="2">
                        <Text size="1" style={{ color: "var(--gray-10)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          Annotations ({item.annotations.length})
                        </Text>
                        <Flex direction="column" gap="1" style={{ maxHeight: "80px", overflowY: "auto" }}>
                          {item.annotations.map((annotation: AnnotationObject, annotationIndex: number) => {
                            const colorScheme = getAnnotationColor(annotationIndex);
                            return (
                              <Badge
                                key={annotationIndex}
                                style={{
                                  background: colorScheme.bg,
                                  color: colorScheme.text,
                                  border: `1px solid ${colorScheme.border}`,
                                  padding: "4px 8px",
                                  borderRadius: "6px",
                                  fontSize: "11px",
                                  fontWeight: "500",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  transition: "all 0.2s ease",
                                }}
                                className="annotation-badge-hover"
                              >
                                {annotation.label}
                              </Badge>
                            );
                          })}
                        </Flex>
                      </Flex>
                    )}
                  </Flex>
                )}
              </Card>
            ))}
          </Grid>

          {/* 페이지네이션 컨트롤 */}
          <PaginationControls />
        </Flex>
      </Card>

      {/* 풍부한 이미지 분석 모달 */}
      <Dialog.Root 
        open={!!selectedImage} 
        onOpenChange={(open) => {
          console.log("Dialog open state changed:", open);
          if (!open) handleCloseModal();
        }}
      >
        <Dialog.Content style={{ 
          maxWidth: "1200px", 
          maxHeight: "95vh", 
          padding: "0",
          borderRadius: "16px",
          overflow: "hidden",
          background: "white",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
        }}>
          <Dialog.Title className="visually-hidden">
            Image Analysis
          </Dialog.Title>
          <Dialog.Description className="visually-hidden">
            Analyze and annotate dataset images. For verified images, you can draw bounding boxes.
          </Dialog.Description>
          {selectedImage && selectedImageData && (
            <Grid columns="2" style={{ height: "90vh" }}>
              {/* 왼쪽: 이미지 뷰 */}
              <Box 
                className={hasConfirmedAnnotations(selectedImageData) ? "image-container verified" : "image-container"}
                style={{ 
                  background: "var(--gray-2)", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  position: "relative",
                  cursor: hasConfirmedAnnotations(selectedImageData) ? "pointer" : "default",
                }}
              >
                {!isDrawingMode ? (
                  <Box 
                    style={{ 
                      width: "100%", 
                      height: "100%", 
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center" 
                    }}
                  >
                    <img
                      src={selectedImage}
                      alt="Dataset Image Analysis"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "contain",
                        borderRadius: "0",
                        position: "relative",
                        zIndex: 1
                      }}
                    />
                    {hasConfirmedAnnotations(selectedImageData) && (
                      <Box 
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          zIndex: 2,
                          cursor: "pointer",
                          background: "transparent"
                        }}
                        onClick={(e) => {
                          console.log("Overlay clicked");
                          e.stopPropagation();
                          e.preventDefault();
                          handleDrawingModeToggle(true);
                        }}
                      />
                    )}
                  </Box>
                ) : (
                  <Box style={{ 
                    position: "relative", 
                    width: "100%", 
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <canvas
                      ref={canvasRef}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        width: "auto",
                        height: "auto",
                        objectFit: "contain"
                      }}
                    />
                  </Box>
                )}

                {/* 이미지 정보 오버레이 */}
                <Box style={{
                  position: "absolute",
                  top: "16px",
                  left: "16px",
                  background: "rgba(0, 0, 0, 0.8)",
                  backdropFilter: "blur(8px)",
                  color: "white",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: "500",
                  zIndex: 3
                }}>
                  {isDrawingMode ? "Drawing Mode - Click and drag to draw boxes" : `Image #${selectedImageIndex + 1}`}
                </Box>
                {hasConfirmedAnnotations(selectedImageData) && !isDrawingMode && (
                  <Box 
                    className="click-overlay"
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      background: "rgba(0, 0, 0, 0.8)",
                      backdropFilter: "blur(8px)",
                      color: "white",
                      padding: "16px 24px",
                      borderRadius: "12px",
                      fontSize: "14px",
                      fontWeight: "500",
                      textAlign: "center",
                      opacity: 0,
                      transition: "opacity 0.2s ease",
                      pointerEvents: "none",
                      zIndex: 3
                    }}
                  >
                    Click to Draw Bounding Boxes
                  </Box>
                )}
              </Box>

              {/* 오른쪽: Annotation 분석 및 관리 패널 */}
              <Box style={{ 
                background: "white",
                display: "flex",
                flexDirection: "column",
                height: "90vh",
                minHeight: 0,
              }}>
                {/* 상단 스크롤 가능한 콘텐츠 영역 */}
                <Box style={{ 
                  flex: 1,
                  minHeight: 0,
                  display: "flex",
                  flexDirection: "column",
                }}>
                  <Box style={{
                    flex: 1,
                    padding: "24px 24px 0 24px",
                    overflowY: "auto",
                    overflowX: "hidden",
                  }}>
                    <Flex direction="column" gap="6">
                      {/* 헤더 */}
                      <Flex direction="column" gap="3">
                        <Flex align="center" justify="between">
                          <Heading size="6" style={{ fontWeight: 700 }}>
                            Image Analysis
                          </Heading>
                          <Button
                            variant="ghost"
                            size="2"
                            onClick={handleCloseModal}
                            style={{
                              borderRadius: "8px",
                              color: "var(--gray-11)",
                            }}
                          >
                            ✕
                          </Button>
                        </Flex>
                        <Text size="3" style={{ color: "var(--gray-11)", lineHeight: "1.5" }}>
                          Pending annotations and administrative controls for this image
                        </Text>
                      </Flex>

                      <Separator size="4" />

                      {/* 확정된 Annotations */}
                      <Flex direction="column" gap="4">
                        <Flex align="center" gap="2">
                          <CheckCircle size={20} style={{ color: "var(--green-9)" }} weight="fill" />
                          <Heading size="4" style={{ fontWeight: 600, color: "var(--green-11)" }}>
                            Confirmed Annotations
                          </Heading>
                          <Badge style={{
                            background: "var(--green-3)",
                            color: "var(--green-11)",
                            fontSize: "11px",
                            fontWeight: "600"
                          }}>
                            {selectedAnnotations.length} confirmed
                          </Badge>
                        </Flex>

                        {selectedAnnotations.length > 0 ? (
                          <Grid columns="2" gap="2">
                            {selectedAnnotations.map((annotation, index) => {
                              return (
                                <Card key={index} style={{
                                  background: "linear-gradient(135deg, var(--green-2) 0%, var(--green-3) 100%)",
                                  border: "2px solid var(--green-6)",
                                  padding: "12px",
                                  borderRadius: "8px",
                                  transition: "all 0.2s ease",
                                }}>
                                  <Flex align="center" gap="2">
                                    <CheckCircle size={16} style={{ color: "var(--green-9)" }} weight="fill" />
                                    <Text size="2" style={{ 
                                      color: "var(--green-11)", 
                                      fontWeight: 600 
                                    }}>
                                      {annotation.label}
                                    </Text>
                                    <Badge style={{
                                      background: "var(--green-9)",
                                      color: "white",
                                      fontSize: "9px",
                                      fontWeight: "600",
                                      padding: "2px 4px",
                                      marginLeft: "auto"
                                    }}>
                                      VERIFIED
                                    </Badge>
                                  </Flex>
                                </Card>
                              );
                            })}
                          </Grid>
                        ) : (
                          <Card style={{
                            padding: "20px",
                            background: "var(--gray-2)",
                            border: "1px dashed var(--gray-6)",
                            borderRadius: "12px",
                            textAlign: "center"
                          }}>
                            <Flex direction="column" align="center" gap="2">
                              <CheckCircle size={28} style={{ color: "var(--gray-8)" }} weight="thin" />
                              <Text size="2" style={{ color: "var(--gray-11)", fontWeight: 500 }}>
                                No confirmed annotations yet
                              </Text>
                              <Text size="1" style={{ color: "var(--gray-10)" }}>
                                Promote pending annotations to confirmed annotations
                              </Text>
                            </Flex>
                          </Card>
                        )}
                      </Flex>

                      <Separator size="4" />

                      {/* Pending Annotations 통계 */}
                      <Flex direction="column" gap="4">
                        <Flex align="center" justify="between">
                          <Flex align="center" gap="2">
                            <Users size={20} style={{ color: "var(--blue-9)" }} weight="fill" />
                            <Heading size="4" style={{ fontWeight: 600, color: "var(--blue-11)" }}>
                              Pending Annotations
                            </Heading>
                            <Badge style={{
                              background: "var(--blue-3)",
                              color: "var(--blue-11)",
                              fontSize: "11px",
                              fontWeight: "600"
                            }}>
                              {selectedImageData?.pendingAnnotationStats?.length || 0} labels
                            </Badge>
                          </Flex>
                          {selectedImageData?.pendingAnnotationStats && selectedImageData.pendingAnnotationStats.length > 0 && (
                            <Text size="1" style={{ color: "var(--gray-10)", fontStyle: "italic" }}>
                              Sorted by annotation count (highest first)
                            </Text>
                          )}
                        </Flex>

                        {selectedImageData?.pendingAnnotationStats && selectedImageData.pendingAnnotationStats.length > 0 ? (
                          <Flex direction="column" gap="3">
                            {/* 통계 정렬 (투표 수 기준 내림차순) */}
                            {selectedImageData.pendingAnnotationStats
                              .sort((a, b) => b.count - a.count)
                              .map((stat, index) => {
                                const maxAnnotations = Math.max(...(selectedImageData?.pendingAnnotationStats?.map(s => s.count) || [1]));
                                const percentage = maxAnnotations > 0 ? (stat.count / maxAnnotations) * 100 : 0;
                                const isPopular = stat.count >= 3; // 3표 이상이면 인기 annotation
                                const rank = index + 1;
                                const isSelected = selectedPendingLabels.has(stat.label);
                                const confirmedLabels = getConfirmedLabels();
                                const isAlreadyConfirmed = confirmedLabels.has(stat.label);
                                
                                return (
                                  <Card 
                                    key={stat.label} 
                                    style={{
                                      padding: "16px",
                                      border: isAlreadyConfirmed
                                        ? "2px solid var(--gray-4)"
                                        : isSelected
                                          ? "2px solid var(--green-6)"
                                          : isPopular 
                                            ? "2px solid var(--orange-6)" 
                                            : rank === 1 
                                              ? "2px solid var(--blue-6)"
                                              : "1px solid var(--gray-4)",
                                      borderRadius: "12px",
                                      background: isAlreadyConfirmed
                                        ? "var(--gray-2)"
                                        : isSelected
                                          ? "linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)"
                                          : isPopular 
                                            ? "linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)" 
                                            : rank === 1
                                              ? "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)"
                                              : "white",
                                      transition: "all 0.2s ease",
                                      position: "relative",
                                      cursor: isAlreadyConfirmed ? "not-allowed" : "pointer",
                                      minHeight: "100px",
                                      opacity: isAlreadyConfirmed ? 0.6 : 1,
                                    }}
                                    onClick={() => !isAlreadyConfirmed && handleTogglePendingAnnotation(stat.label)}
                                  >
                                    {/* 순위 표시 - 박스 안쪽 좌상단 */}
                                    <Box style={{
                                      position: "absolute",
                                      top: "8px",
                                      left: "12px",
                                      background: isAlreadyConfirmed
                                        ? "var(--gray-7)"
                                        : isSelected 
                                          ? "var(--green-9)"
                                          : rank === 1 ? "var(--blue-9)" : rank <= 3 ? "var(--orange-9)" : "var(--gray-8)",
                                      color: "white",
                                      borderRadius: "8px",
                                      padding: "4px 6px",
                                      fontSize: "10px",
                                      fontWeight: "700",
                                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                      zIndex: 1,
                                      minWidth: "20px",
                                      textAlign: "center",
                                    }}>
                                      #{rank}
                                    </Box>

                                    {/* 확정 상태 또는 선택 체크박스 */}
                                    <Box style={{
                                      position: "absolute",
                                      top: "8px",
                                      right: "12px",
                                      width: "18px",
                                      height: "18px",
                                      borderRadius: "4px",
                                      border: isAlreadyConfirmed
                                        ? "2px solid var(--gray-7)"
                                        : isSelected 
                                          ? "2px solid var(--green-9)" 
                                          : "2px solid var(--gray-6)",
                                      background: isAlreadyConfirmed
                                        ? "var(--gray-7)"
                                        : isSelected ? "var(--green-9)" : "white",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      transition: "all 0.2s ease",
                                    }}>
                                      {(isSelected || isAlreadyConfirmed) && (
                                        <CheckCircle size={12} style={{ color: "white" }} weight="fill" />
                                      )}
                                    </Box>

                                    <Flex direction="column" gap="2" style={{ marginTop: "28px", height: "calc(100% - 28px)" }}>
                                      {/* 라벨과 배지 */}
                                      <Flex align="center" justify="between" style={{ minHeight: "24px" }}>
                                        <Flex align="center" gap="2" style={{ flex: 1 }}>
                                          <Text size="3" style={{ 
                                            fontWeight: 700,
                                            color: isAlreadyConfirmed
                                              ? "var(--gray-8)"
                                              : isSelected 
                                                ? "var(--green-11)"
                                                : isPopular ? "var(--orange-11)" : rank === 1 ? "var(--blue-11)" : "var(--gray-12)",
                                            lineHeight: "1.2",
                                            wordBreak: "break-word",
                                          }}>
                                            {stat.label}
                                          </Text>
                                          {/* 배지들 */}
                                          {isAlreadyConfirmed && (
                                            <Badge style={{
                                              background: "var(--gray-7)",
                                              color: "white",
                                              fontSize: "9px",
                                              fontWeight: "600",
                                              padding: "2px 4px"
                                            }}>
                                              CONFIRMED
                                            </Badge>
                                          )}
                                          {isSelected && !isAlreadyConfirmed && (
                                            <Badge style={{
                                              background: "var(--green-9)",
                                              color: "white",
                                              fontSize: "9px",
                                              fontWeight: "600",
                                              padding: "2px 4px"
                                            }}>
                                              SELECTED
                                            </Badge>
                                          )}
                                          {isPopular && !isSelected && !isAlreadyConfirmed && (
                                            <Badge style={{
                                              background: "var(--orange-9)",
                                              color: "white",
                                              fontSize: "9px",
                                              fontWeight: "600",
                                              padding: "2px 4px"
                                            }}>
                                              HOT
                                            </Badge>
                                          )}
                                          {rank === 1 && !isPopular && !isSelected && !isAlreadyConfirmed && (
                                            <Badge style={{
                                              background: "var(--blue-9)",
                                              color: "white",
                                              fontSize: "9px",
                                              fontWeight: "600",
                                              padding: "2px 4px"
                                            }}>
                                              TOP
                                            </Badge>
                                          )}
                                        </Flex>
                                      </Flex>

                                      {/* 투표 수와 진행률 */}
                                      <Flex align="center" justify="between" gap="3">
                                        {/* 투표 수 */}
                                        <Flex align="center" gap="2">
                                          <Text size="4" style={{ 
                                            color: isAlreadyConfirmed
                                              ? "var(--gray-8)"
                                              : isSelected 
                                                ? "var(--green-11)"
                                                : rank === 1 ? "var(--blue-11)" : "var(--gray-11)",
                                            fontWeight: 800,
                                            lineHeight: "1"
                                          }}>
                                            {stat.count}
                                          </Text>
                                          <Text size="1" style={{ 
                                            color: isAlreadyConfirmed ? "var(--gray-8)" : "var(--gray-10)",
                                            fontWeight: 500,
                                            textTransform: "uppercase",
                                            letterSpacing: "0.5px"
                                          }}>
                                            {stat.count === 1 ? 'annotation' : 'annotations'}
                                          </Text>
                                        </Flex>
                                        
                                        {/* 퍼센트 */}
                                        <Text size="1" style={{
                                          color: isAlreadyConfirmed ? "var(--gray-8)" : "var(--gray-10)",
                                          fontSize: "10px",
                                          fontWeight: "500"
                                        }}>
                                          {Math.round(percentage)}%
                                        </Text>
                                      </Flex>
                                      
                                      {/* 시각적 진행률 바 */}
                                      <Box style={{ position: "relative" }}>
                                        <Box
                                          style={{
                                            width: "100%",
                                            height: "6px",
                                            background: "var(--gray-4)",
                                            borderRadius: "3px",
                                            overflow: "hidden",
                                          }}
                                        >
                                          <Box style={{
                                            width: `${percentage}%`,
                                            height: "100%",
                                            background: isAlreadyConfirmed
                                              ? "var(--gray-6)"
                                              : isSelected
                                                ? "linear-gradient(90deg, var(--green-9) 0%, var(--green-10) 100%)"
                                                : isPopular 
                                                  ? "linear-gradient(90deg, var(--orange-9) 0%, var(--orange-10) 100%)"
                                                  : rank === 1
                                                    ? "linear-gradient(90deg, var(--blue-9) 0%, var(--blue-10) 100%)"
                                                    : "linear-gradient(90deg, var(--gray-7) 0%, var(--gray-8) 100%)",
                                            borderRadius: "3px",
                                            transition: "width 0.3s ease",
                                          }} />
                                        </Box>
                                      </Box>
                                    </Flex>
                                  </Card>
                                );
                              })}
                          </Flex>
                        ) : (
                          <Card style={{
                            padding: "24px",
                            background: "var(--gray-2)",
                            border: "1px dashed var(--gray-6)",
                            borderRadius: "12px",
                            textAlign: "center"
                          }}>
                            <Flex direction="column" align="center" gap="2">
                              <Users size={32} style={{ color: "var(--gray-8)" }} weight="thin" />
                              <Text size="3" style={{ color: "var(--gray-11)", fontWeight: 500 }}>
                                No community annotations yet
                              </Text>
                              <Text size="2" style={{ color: "var(--gray-10)" }}>
                                Be the first to annotate this image
                              </Text>
                            </Flex>
                          </Card>
                        )}
                      </Flex>
                    </Flex>
                  </Box>
                </Box>

                {/* 하단 고정 액션 버튼 영역 */}
                <Box style={{ 
                  flexShrink: 0,
                  borderTop: "1px solid var(--gray-6)",
                  background: "linear-gradient(to bottom, rgba(249, 250, 251, 0.8), rgba(249, 250, 251, 1))",
                  padding: "20px 24px",
                  backdropFilter: "blur(8px)",
                }}>
                  {/* 확인 상태 표시 */}
                  <ConfirmationStatusDisplay />
                  
                  {/* 선택된 annotation 정보 */}
                  {selectedPendingLabels.size > 0 && confirmationStatus.status === 'idle' && (
                    <Card style={{
                      padding: "12px 16px",
                      background: "var(--green-2)",
                      border: "1px solid var(--green-6)",
                      borderRadius: "8px",
                      marginBottom: "16px"
                    }}>
                      <Flex align="center" gap="2">
                        <CheckCircle size={16} style={{ color: "var(--green-9)" }} weight="fill" />
                        <Text size="2" style={{ color: "var(--green-11)", fontWeight: 600 }}>
                          {selectedPendingLabels.size} annotation(s) selected for confirmation
                        </Text>
                      </Flex>
                    </Card>
                  )}
                  
                  <Flex gap="3">
                    <Button
                      variant="soft"
                      style={{
                        flex: 1,
                        background: "var(--gray-3)",
                        color: "var(--gray-12)",
                        borderRadius: "8px",
                        padding: "12px",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                      onClick={handleCloseModal}
                    >
                      Close
                    </Button>
                    <Button
                      disabled={selectedPendingLabels.size === 0 || confirmationStatus.status === 'pending'}
                      style={{
                        flex: 1,
                        background: (selectedPendingLabels.size > 0 && confirmationStatus.status !== 'pending')
                          ? "linear-gradient(135deg, var(--green-9) 0%, var(--green-10) 100%)"
                          : "var(--gray-4)",
                        color: (selectedPendingLabels.size > 0 && confirmationStatus.status !== 'pending') ? "white" : "var(--gray-8)",
                        border: "none",
                        borderRadius: "8px",
                        padding: "12px",
                        cursor: (selectedPendingLabels.size > 0 && confirmationStatus.status !== 'pending') ? "pointer" : "not-allowed",
                        fontWeight: 600,
                        opacity: (selectedPendingLabels.size > 0 && confirmationStatus.status !== 'pending') ? 1 : 0.6,
                      }}
                      onClick={handleConfirmSelectedAnnotations}
                    >
                      {confirmationStatus.status === 'pending' ? (
                        <Flex align="center" gap="2">
                          <Box
                            style={{
                              width: "12px",
                              height: "12px",
                              border: "2px solid white",
                              borderTop: "2px solid transparent",
                              borderRadius: "50%",
                              animation: "spin 1s linear infinite",
                            }}
                          />
                          <span>Processing...</span>
                        </Flex>
                      ) : (
                        <>
                          <CheckCircle size={16} weight="fill" />
                          Confirm {selectedPendingLabels.size > 0 ? `(${selectedPendingLabels.size})` : 'Selected'}
                        </>
                      )}
                    </Button>
                  </Flex>
                </Box>
              </Box>
            </Grid>
          )}

          {/* Drawing mode controls */}
          {isDrawingMode && (
            <Box style={{
              position: "absolute",
              bottom: "24px",
              left: "24px",
              right: "24px",
              background: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(8px)",
              padding: "16px",
              borderRadius: "12px",
              boxShadow: "0 4px 24px rgba(0, 0, 0, 0.1)",
            }}>
              <Flex gap="3" align="center" justify="between">
                <Flex align="center" gap="3">
                  <Badge style={{
                    background: "var(--green-3)",
                    color: "var(--green-11)",
                    padding: "4px 8px",
                  }}>
                    {boundingBoxes.length} boxes drawn
                  </Badge>
                  {boundingBoxes.length > 0 && (
                    <Button 
                      size="2" 
                      variant="soft" 
                      color="red"
                      onClick={clearBoundingBoxes}
                    >
                      Clear All
                    </Button>
                  )}
                </Flex>
                <Flex gap="3">
                  <Button 
                    variant="soft" 
                    color="gray"
                    onClick={() => setIsDrawingMode(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="solid" 
                    style={{
                      background: "var(--green-9)",
                      color: "white",
                    }}
                  >
                    Save Boxes
                  </Button>
                </Flex>
              </Flex>
            </Box>
          )}
        </Dialog.Content>
      </Dialog.Root>

      <style>
        {`
          button {
            cursor: pointer !important;
          }
          button:hover {
            opacity: 0.9;
          }
          .hover-effect:hover {
            color: #FF5733 !important;
          }
          .item-card-hover:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
          }
          .annotation-badge-hover:hover {
            transform: scale(1.05);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes shimmer {
            0% {
              background-position: -200% 0;
            }
            100% {
              background-position: 200% 0;
            }
          }
          @keyframes pulse {
            0% { 
              transform: scale(1);
              opacity: 1;
            }
            50% { 
              transform: scale(1.02);
              opacity: 0.9;
            }
            100% { 
              transform: scale(1);
              opacity: 1;
            }
          }
          .click-overlay {
            opacity: 0;
          }
          
          [style*="cursor: pointer"]:hover .click-overlay {
            opacity: 1;
          }
          .image-container {
            transition: all 0.2s ease;
          }

          .image-container.verified:hover {
            background: var(--gray-3) !important;
          }

          .image-container.verified:hover .click-overlay {
            opacity: 1 !important;
          }
          .visually-hidden {
            border: 0;
            clip: rect(0 0 0 0);
            height: 1px;
            margin: -1px;
            overflow: hidden;
            padding: 0;
            position: absolute;
            width: 1px;
          }
        `}
      </style>
    </Box>
  );
}
