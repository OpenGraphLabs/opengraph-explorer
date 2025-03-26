// Walrus 스토리지 연동을 위한 서비스

// Walrus 네트워크 설정
const WALRUS_NETWORK = "testnet"; // 또는 "devnet", "mainnet" 등
const WALRUS_PUBLISHER_URL = "https://publisher.walrus-testnet.walrus.space";
const WALRUS_AGGREGATOR_URL = "https://aggregator.walrus-testnet.walrus.space";
const SUI_VIEW_TX_URL = `https://suiscan.xyz/${WALRUS_NETWORK}/tx`;
const SUI_VIEW_OBJECT_URL = `https://suiscan.xyz/${WALRUS_NETWORK}/object`;

// 저장 정보 인터페이스
export interface WalrusStorageInfo {
  blobId: string;
  endEpoch: number;
  status: string;
  suiRef: string;
  suiRefType: string;
  mediaUrl: string;
}

/**
 * 이미지/영상 업로드 함수
 * @param file 업로드할 파일
 * @param epochs 저장할 에포크 수
 * @param sendTo 소유권을 가질 주소 (선택적)
 * @returns 저장 정보
 */
export async function uploadMedia(
  file: File, 
  epochs: number = 10, 
  sendTo?: string
): Promise<WalrusStorageInfo> {
  try {
    // 쿼리 파라미터 구성
    let sendToParam = sendTo ? `&send_object_to=${sendTo}` : "";
    const url = `${WALRUS_PUBLISHER_URL}/v1/blobs?epochs=${epochs}${sendToParam}`;
    console.log("Walrus 업로드 URL:", url);
    
    // PUT 요청으로 파일 업로드
    const response = await fetch(url, {
      method: "PUT",
      body: file,
    });
    
    if (!response.ok) {
      throw new Error(`업로드 실패: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("Walrus 업로드 응답:", data);
    
    // 응답 데이터 처리
    let storageInfo: WalrusStorageInfo;
    
    if ("alreadyCertified" in data) {
      storageInfo = {
        status: "Already certified",
        blobId: data.alreadyCertified.blobId,
        endEpoch: data.alreadyCertified.endEpoch,
        suiRefType: "Previous Sui Certified Event",
        suiRef: data.alreadyCertified.event.txDigest,
        mediaUrl: `${WALRUS_AGGREGATOR_URL}/v1/blobs/${data.alreadyCertified.blobId}`
      };
      console.log("[기존 BLOB 객체 업데이트] 관련 Tx digest:", data.alreadyCertified.event.txDigest);
    } else if ("newlyCreated" in data) {
      storageInfo = {
        status: "Newly created",
        blobId: data.newlyCreated.blobObject.blobId,
        endEpoch: data.newlyCreated.blobObject.storage.endEpoch,
        suiRefType: "Associated Sui Object",
        suiRef: data.newlyCreated.blobObject.id,
        mediaUrl: `${WALRUS_AGGREGATOR_URL}/v1/blobs/${data.newlyCreated.blobObject.blobId}`
      };
      console.log("[신규 BLOB 객체 생성] BLOB 객체 ID:", data.newlyCreated.blobObject.id);
    } else {
      throw new Error("알 수 없는 응답 형식");
    }
    
    return storageInfo;
  } catch (error) {
    console.error('미디어 업로드 오류:', error);
    throw error;
  }
}

/**
 * 미디어 가져오기 함수
 * @param blobId Walrus Blob ID
 * @returns Blob 객체
 */
export async function getMedia(blobId: string): Promise<Blob> {
  try {
    const url = `${WALRUS_AGGREGATOR_URL}/v1/blobs/${blobId}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`미디어 가져오기 실패: ${response.status} ${response.statusText}`);
    }
    
    return await response.blob();
  } catch (error) {
    console.error('미디어 가져오기 오류:', error);
    throw error;
  }
}

/**
 * Blob ID에서 미디어 URL 생성
 * @param blobId Walrus Blob ID
 * @returns 미디어 URL
 */
export function getMediaUrl(blobId: string): string {
  return `${WALRUS_AGGREGATOR_URL}/v1/blobs/${blobId}`;
}

/**
 * Sui 객체 또는 트랜잭션 URL 생성
 * @param suiRef Sui 참조 (객체 ID 또는 트랜잭션 다이제스트)
 * @param type 참조 유형 ('object' 또는 'tx')
 * @returns Sui 탐색기 URL
 */
export function getSuiExplorerUrl(suiRef: string, type: 'object' | 'tx'): string {
  const baseUrl = type === 'object' ? SUI_VIEW_OBJECT_URL : SUI_VIEW_TX_URL;
  return `${baseUrl}/${suiRef}`;
}

/**
 * 학습 데이터 업로드 함수
 * @param files 업로드할 파일 배열
 * @param epochs 저장할 에포크 수
 * @param sendTo 소유권을 가질 주소 (선택적)
 * @returns 저장 정보 배열
 */
export async function uploadTrainingData(
  files: File[],
  epochs: number = 10,
  sendTo?: string
): Promise<WalrusStorageInfo[]> {
  try {
    const uploadPromises = files.map(async (file) => {
      return await uploadMedia(file, epochs, sendTo);
    });

    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('학습 데이터 업로드 오류:', error);
    throw error;
  }
}

/**
 * 학습 데이터 가져오기 함수
 * @param blobIds Walrus Blob ID 배열
 * @returns Blob 객체 배열
 */
export async function getTrainingData(blobIds: string[]): Promise<Blob[]> {
  try {
    const getPromises = blobIds.map(async (blobId) => {
      return await getMedia(blobId);
    });

    const results = await Promise.all(getPromises);
    return results;
  } catch (error) {
    console.error('학습 데이터 가져오기 오류:', error);
    throw error;
  }
} 