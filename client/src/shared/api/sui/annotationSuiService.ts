import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { SuiClient } from "@mysten/sui/client";
import { SUI_NETWORK, SUI_CONTRACT, GAS_BUDGET } from "../../constants/suiConfig";
import { type LabelAnnotation, type BoundingBox } from "@/features/annotation/types/workspace";

const suiClient = new SuiClient({
  url: SUI_NETWORK.URL,
});

// Data별 어노테이션 입력 인터페이스
export interface DataAnnotationInput {
  dataId: string; // Data 객체 ID
  dataPath: string; // Data의 path (for annotation creation)
  labelAnnotations?: LabelAnnotation[]; // 해당 Data에 추가할 label annotation들
  bboxAnnotations?: BoundingBox[]; // 해당 Data에 추가할 bbox annotation들
}

// 배치 어노테이션 등록 인터페이스
export interface BatchAnnotationInput {
  datasetId: string; // Dataset 객체 ID
  dataAnnotations: DataAnnotationInput[]; // Data별로 그룹화된 annotation 배열
}

/**
 * Annotation 서비스 클래스
 */
export function useAnnotationSuiService() {
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const account = useCurrentAccount();

  /**
   * 여러 Data에 Annotation들을 배치로 등록하는 함수 (Label과 BBox 모두 지원)
   * @param batchInput Data별로 그룹화된 annotation 배열
   * @param onSuccess 성공 콜백
   * @param onError 오류 콜백
   * @returns 트랜잭션 결과
   */
  const addAnnotationsBatch = async (
    batchInput: BatchAnnotationInput,
    onSuccess?: (result: any) => void,
    onError?: (error: Error) => void
  ) => {
    if (!account) {
      const error = new Error("Wallet account not found. Please connect your wallet first.");
      if (onError) onError(error);
      throw error;
    }

    if (!batchInput.dataAnnotations || batchInput.dataAnnotations.length === 0) {
      const error = new Error("No data annotations provided");
      if (onError) onError(error);
      throw error;
    }

    try {
      const tx = new Transaction();
      tx.setGasBudget(GAS_BUDGET);

      // TODO: datasetId를 활용하여 Dataset 객체 유효성 검사 또는 로깅 추가 가능
      console.log(`!!!! Adding annotations to dataset: ${batchInput.datasetId}`);

      // 각 Data별로 annotation 처리
      for (const dataAnnotation of batchInput.dataAnnotations) {
        const { dataId, dataPath, labelAnnotations, bboxAnnotations } = dataAnnotation;

        // Label과 BBox annotation 모두 없으면 스킵
        const hasLabelAnnotations = labelAnnotations && labelAnnotations.length > 0;
        const hasBboxAnnotations = bboxAnnotations && bboxAnnotations.length > 0;

        if (!hasLabelAnnotations && !hasBboxAnnotations) {
          console.warn(`No annotations for data: ${dataPath}`);
          continue;
        }

        const allAnnotationCalls = [];

        // 1. Label Annotation 객체들 생성
        if (hasLabelAnnotations) {
          console.log(
            `Processing ${labelAnnotations.length} label annotations for data: ${dataPath}`
          );

          const labelAnnotationCalls = labelAnnotations.map(labelAnnotation => {
            return tx.moveCall({
              target: `${SUI_CONTRACT.PACKAGE_ID}::annotation::new_label_annotation`,
              arguments: [
                tx.pure.string(labelAnnotation.label), // label
                tx.pure.address(account.address), // annotated_by
              ],
            });
          });

          allAnnotationCalls.push(...labelAnnotationCalls);
        }

        // 2. BBox Annotation 객체들 생성
        if (hasBboxAnnotations) {
          console.log(
            `Processing ${bboxAnnotations.length} bbox annotations for data: ${dataPath}`
          );

          const bboxAnnotationCalls = bboxAnnotations.map(bboxAnnotation => {
            return tx.moveCall({
              target: `${SUI_CONTRACT.PACKAGE_ID}::annotation::new_bbox_annotation`,
              arguments: [
                tx.pure.u64(BigInt(Math.round(bboxAnnotation.x))), // x
                tx.pure.u64(BigInt(Math.round(bboxAnnotation.y))), // y
                tx.pure.u64(BigInt(Math.round(bboxAnnotation.width))), // w
                tx.pure.u64(BigInt(Math.round(bboxAnnotation.height))), // h
                tx.pure.address(account.address), // annotated_by
              ],
            });
          });

          allAnnotationCalls.push(...bboxAnnotationCalls);
        }

        // 3. 생성된 모든 annotation들을 벡터로 만들어서 add_annotations 호출
        if (allAnnotationCalls.length > 0) {
          tx.moveCall({
            target: `${SUI_CONTRACT.PACKAGE_ID}::dataset::add_annotations`,
            arguments: [
              tx.object(batchInput.datasetId), // dataset object
              tx.pure.string(dataPath), // data path
              tx.makeMoveVec({
                type: `${SUI_CONTRACT.PACKAGE_ID}::annotation::Annotation`,
                elements: allAnnotationCalls,
              }), // annotations vector
            ],
          });

          const totalAnnotations = (labelAnnotations?.length || 0) + (bboxAnnotations?.length || 0);
          console.log(
            `Added ${totalAnnotations} annotations (${labelAnnotations?.length || 0} labels, ${bboxAnnotations?.length || 0} bboxes) to data ${dataPath}`
          );
        }
      }

      // 4. 트랜잭션 실행
      return await signAndExecuteTransaction(
        {
          transaction: tx,
          chain: `sui:${SUI_NETWORK.TYPE}`,
        },
        {
          onSuccess: result => {
            console.log("Batch annotations creation successful:", result);
            if (onSuccess) {
              onSuccess(result);
            }
            return result;
          },
          onError: error => {
            console.error("Transaction execution failed:", error);
            if (onError) {
              onError(
                new Error(
                  `Transaction failed: ${error instanceof Error ? error.message : "Unknown error"}`
                )
              );
            }
          },
        }
      );
    } catch (error) {
      console.error("Error adding batch annotations:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      if (onError) {
        onError(new Error(`Failed to add annotations: ${errorMessage}`));
      }
      throw new Error(`Failed to add annotations: ${errorMessage}`);
    }
  };

  /**
   * 단일 Data에 Annotation들을 등록하는 함수 (Label과 BBox 모두 지원)
   * @param datasetId Dataset 객체 ID
   * @param dataId Data 객체 ID
   * @param dataPath Data의 path
   * @param labelAnnotations 추가할 label annotation 배열 (선택)
   * @param bboxAnnotations 추가할 bbox annotation 배열 (선택)
   * @param onSuccess 성공 콜백
   * @param onError 오류 콜백
   * @returns 트랜잭션 결과
   */
  const addAnnotationsToData = async (
    datasetId: string,
    dataId: string,
    dataPath: string,
    labelAnnotations?: LabelAnnotation[],
    bboxAnnotations?: BoundingBox[],
    onSuccess?: (result: any) => void,
    onError?: (error: Error) => void
  ) => {
    const batchInput: BatchAnnotationInput = {
      datasetId,
      dataAnnotations: [
        {
          dataId,
          dataPath,
          labelAnnotations,
          bboxAnnotations,
        },
      ],
    };

    return addAnnotationsBatch(batchInput, onSuccess, onError);
  };

  /**
   * 단일 Data에 Label Annotation들만 등록하는 편의 함수
   * @param datasetId Dataset 객체 ID
   * @param dataId Data 객체 ID
   * @param dataPath Data의 path
   * @param labelAnnotations 추가할 label annotation 배열
   * @param onSuccess 성공 콜백
   * @param onError 오류 콜백
   * @returns 트랜잭션 결과
   */
  const addLabelAnnotationsToData = async (
    datasetId: string,
    dataId: string,
    dataPath: string,
    labelAnnotations: LabelAnnotation[],
    onSuccess?: (result: any) => void,
    onError?: (error: Error) => void
  ) => {
    return addAnnotationsToData(
      datasetId,
      dataId,
      dataPath,
      labelAnnotations,
      undefined,
      onSuccess,
      onError
    );
  };

  /**
   * 단일 Data에 BBox Annotation들만 등록하는 편의 함수
   * @param datasetId Dataset 객체 ID
   * @param dataId Data 객체 ID
   * @param dataPath Data의 path
   * @param bboxAnnotations 추가할 bbox annotation 배열
   * @param onSuccess 성공 콜백
   * @param onError 오류 콜백
   * @returns 트랜잭션 결과
   */
  const addBboxAnnotationsToData = async (
    datasetId: string,
    dataId: string,
    dataPath: string,
    bboxAnnotations: BoundingBox[],
    onSuccess?: (result: any) => void,
    onError?: (error: Error) => void
  ) => {
    return addAnnotationsToData(
      datasetId,
      dataId,
      dataPath,
      undefined,
      bboxAnnotations,
      onSuccess,
      onError
    );
  };

  /**
   * 여러 Data에 대한 Annotation 통계 계산 (Label과 BBox 모두 포함)
   * @param dataAnnotations Data별 annotation 배열
   * @returns 통계 정보
   */
  const calculateAnnotationStats = (dataAnnotations: DataAnnotationInput[]) => {
    const stats = {
      totalDataCount: dataAnnotations.length,
      totalAnnotationCount: 0,
      totalLabelCount: 0,
      totalBboxCount: 0,
      averageAnnotationsPerData: 0,
      dataAnnotationCounts: [] as {
        dataPath: string;
        labelCount: number;
        bboxCount: number;
        totalCount: number;
      }[],
    };

    stats.totalAnnotationCount = dataAnnotations.reduce((total, dataAnnotation) => {
      const labelCount = dataAnnotation.labelAnnotations?.length || 0;
      const bboxCount = dataAnnotation.bboxAnnotations?.length || 0;
      const totalCount = labelCount + bboxCount;

      stats.dataAnnotationCounts.push({
        dataPath: dataAnnotation.dataPath,
        labelCount,
        bboxCount,
        totalCount,
      });

      stats.totalLabelCount += labelCount;
      stats.totalBboxCount += bboxCount;

      return total + totalCount;
    }, 0);

    stats.averageAnnotationsPerData =
      stats.totalDataCount > 0 ? stats.totalAnnotationCount / stats.totalDataCount : 0;

    return stats;
  };

  /**
   * 어노테이션 입력 검증 함수 (Label과 BBox 모두 지원)
   * @param batchInput 검증할 배치 입력
   * @returns 검증 결과와 오류 메시지
   */
  const validateBatchInput = (
    batchInput: BatchAnnotationInput
  ): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!batchInput.datasetId || batchInput.datasetId.trim() === "") {
      errors.push("Dataset ID is required");
    }

    if (!batchInput.dataAnnotations || batchInput.dataAnnotations.length === 0) {
      errors.push("No data annotations provided");
    } else {
      batchInput.dataAnnotations.forEach((dataAnnotation, index) => {
        if (!dataAnnotation.dataId || dataAnnotation.dataId.trim() === "") {
          errors.push(`Data annotation ${index}: dataId is required`);
        }

        if (!dataAnnotation.dataPath || dataAnnotation.dataPath.trim() === "") {
          errors.push(`Data annotation ${index}: dataPath is required`);
        }

        const hasLabelAnnotations =
          dataAnnotation.labelAnnotations && dataAnnotation.labelAnnotations.length > 0;
        const hasBboxAnnotations =
          dataAnnotation.bboxAnnotations && dataAnnotation.bboxAnnotations.length > 0;

        // 적어도 하나의 annotation 타입은 있어야 함
        if (!hasLabelAnnotations && !hasBboxAnnotations) {
          errors.push(
            `Data annotation ${index}: at least one annotation (label or bbox) is required`
          );
        }

        // Label annotation 검증
        if (hasLabelAnnotations) {
          dataAnnotation.labelAnnotations!.forEach((labelAnnotation, labelIndex) => {
            if (!labelAnnotation.label || labelAnnotation.label.trim() === "") {
              errors.push(
                `Data annotation ${index}, label annotation ${labelIndex}: label is required`
              );
            }
          });
        }

        // BBox annotation 검증
        if (hasBboxAnnotations) {
          dataAnnotation.bboxAnnotations!.forEach((bboxAnnotation, bboxIndex) => {
            if (bboxAnnotation.x < 0 || bboxAnnotation.y < 0) {
              errors.push(
                `Data annotation ${index}, bbox annotation ${bboxIndex}: x and y must be non-negative`
              );
            }
            if (bboxAnnotation.width <= 0 || bboxAnnotation.height <= 0) {
              errors.push(
                `Data annotation ${index}, bbox annotation ${bboxIndex}: width and height must be positive`
              );
            }
            if (!bboxAnnotation.label || bboxAnnotation.label.trim() === "") {
              errors.push(
                `Data annotation ${index}, bbox annotation ${bboxIndex}: label is required`
              );
            }
          });
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  return {
    addAnnotationsBatch,
    addAnnotationsToData,
    addLabelAnnotationsToData,
    addBboxAnnotationsToData,
    calculateAnnotationStats,
    validateBatchInput,
  };
}

/**
 * Data 객체들의 ID를 조회하는 유틸리티 함수
 * Dataset의 dynamic field를 통해 Data 객체들을 찾는 함수
 */
export async function getDataObjectIds(datasetId: string, dataPaths: string[]) {
  if (!datasetId || dataPaths.length === 0) {
    return {
      dataIds: [],
      isLoading: false,
      error: "Invalid dataset ID or data paths",
    };
  }

  try {
    // Dataset 객체의 dynamic field들을 조회
    const dynamicFields = await suiClient.getDynamicFields({
      parentId: datasetId,
    });

    const dataIds: { path: string; id: string }[] = [];

    // 각 data path에 대해 dynamic field에서 해당하는 Data 객체 ID 찾기
    for (const dataPath of dataPaths) {
      const field = dynamicFields.data.find(field => {
        // dynamic field의 name이 DataPath 구조체 형태로 저장되어 있을 것
        const fieldName = field.name as any;
        return fieldName?.value?.path === dataPath;
      });

      if (field) {
        dataIds.push({
          path: dataPath,
          id: field.objectId,
        });
      }
    }

    return {
      dataIds,
      isLoading: false,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching data object IDs:", error);
    return {
      dataIds: [],
      isLoading: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Fetches all annotations for a data object without type safety
 * This is a simplified version that returns raw annotation data
 * @param dataId The ID of the data object
 * @returns Promise<any[]> Array of raw annotation objects
 */
export async function fetchAllAnnotationsForData(dataId: string): Promise<any[]> {
  const annotations: any[] = [];

  try {
    // 1단계: 해당 DataId에 속한 Dynamic Field (== Annotation 목록) 조회
    const annotationFields = await suiClient.getDynamicFields({ parentId: dataId });

    const annotationIds = annotationFields.data.map(field => field.objectId);

    // 2단계: annotation object 상세 조회
    const annotationObjects = await suiClient.multiGetObjects({
      ids: annotationIds,
      options: { showContent: true },
    });

    for (const annotationObj of annotationObjects) {
      const content = annotationObj.data?.content as any;
      if (!content || !content.type.includes('::annotation::Annotation')) continue;

      const annotationId = annotationObj.data?.objectId;
      const fields = content.fields;
      const status = fields.status;   // Pending, Confirmed, Rejected 중 하나
      const value = fields.value;

      let annotationData: any = {
        annotationId,
        status,
        valueType: null,
        value: null,
      };

      if (value.type.includes('::annotation::AnnotationValue::Label')) {
        const labelFields = value.fields;
        annotationData.valueType = 'Label';
        annotationData.value = {
          label: labelFields.label,
          annotated_by: labelFields.annotated_by,
        };
      } else if (value.type.includes('::annotation::AnnotationValue::BBox')) {
        const bboxFields = value.fields;
        annotationData.valueType = 'BBox';
        annotationData.value = {
          x: bboxFields.x,
          y: bboxFields.y,
          w: bboxFields.w,
          h: bboxFields.h,
          annotated_by: bboxFields.annotated_by,
        };
      } else if (value.type.includes('::annotation::AnnotationValue::Skeleton')) {
        const skeletonFields = value.fields;
        annotationData.valueType = 'Skeleton';
        annotationData.value = {
          keypoints: skeletonFields.keypoints,
          edges: skeletonFields.edges,
          annotated_by: skeletonFields.annotated_by,
        };
      } else {
        // 예상되지 않은 타입 처리
        annotationData.valueType = 'Unknown';
      }

      annotations.push(annotationData);
    }
  } catch (err) {
    console.error('Failed to fetch annotations', err);
  }

  return annotations;
}
