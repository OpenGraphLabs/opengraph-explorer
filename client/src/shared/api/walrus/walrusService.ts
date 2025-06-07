import { getSuiScanUrl } from "../../utils/sui";
import { suiClient } from "../sui/modelSuiService";
import { WalrusClient } from "@mysten/walrus";
import {useCurrentAccount} from "@mysten/dapp-kit";
import {useSignAndExecuteTransaction} from "@mysten/dapp-kit";


// Walrus 네트워크 설정
// const WALRUS_NETWORK = "testnet"; // 또는 "devnet", "mainnet" 등
// const WALRUS_PUBLISHER_URL = "https://publisher.testnet.walrus.atalma.io";
export const WALRUS_AGGREGATOR_URL = "https://aggregator.testnet.walrus.atalma.io";

export const walrusClient = new WalrusClient({
  network: 'testnet',
  suiClient,
  storageNodeClientOptions: {
    timeout: 60_000,
  },
  wasmUrl: "/walrus_wasm_bg.wasm",
});

// 저장 상태 enum
export enum WalrusStorageStatus {
  ALREADY_CERTIFIED = "Already certified",
  NEWLY_CREATED = "Newly created",
  UNKNOWN = "Unknown",
}

// 저장 정보 인터페이스
export interface WalrusStorageInfo {
  blobId: string;
  endEpoch: number;
  status: WalrusStorageStatus;
  suiRef: string;
  suiRefType: string;
  mediaUrl: string;
  suiScanUrl: string; // SuiScan URL (transaction or object)
  suiRefId: string; // Original ID (either transaction digest or object ID)
}

// 파일 메타데이터 인터페이스: blob 내에서의 위치 정보를 포함
export interface FileMetadata {
  fileName: string;
  fileType: string;
  fileSize: number;
  fileHash: string;
  startPosition: number;
  endPosition: number;
}

// 여러 파일을 업로드한 결과 인터페이스
export interface MultipleMediaUploadResult extends WalrusStorageInfo {
  filesMetadata: FileMetadata[];
  totalSize: number;
}

export function useWalrusService() {
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const account = useCurrentAccount();

  /**
   * 이미지/영상 업로드 함수
   * @param file 업로드할 파일
   * @param sendTo 소유권을 가질 주소
   * @param epochs 주기 (선택 사항)
   * @returns 저장 정보
   */
  const uploadMedia = async (
      file: File,
      sendTo: string,
      epochs?: number
  )=> {
    if (!account) {
      throw new Error("Wallet account not found. Please connect your wallet first.");
    }

    try {
      console.log("File to upload:", file);

      const buffer = await file.arrayBuffer();
      const bytesArray = new Uint8Array(buffer);
      const encoded = await walrusClient.encodeBlob(bytesArray);

      const registerBlobTx = await walrusClient.registerBlobTransaction({
        blobId: encoded.blobId,
        rootHash: encoded.rootHash,
        size: bytesArray.length,
        deletable: true,
        epochs: epochs ? epochs : 3,
        owner: sendTo,
      })
      registerBlobTx.setSender(account.address);

      console.log("Registering blob transaction:", registerBlobTx);

      const { digest } = await signAndExecuteTransaction({ transaction: registerBlobTx });
      const { objectChanges, effects } = await suiClient.waitForTransaction({
        digest,
        options: { showObjectChanges: true, showEffects: true },
      });

      console.log("blob transaction effects:", effects);

      if (effects?.status.status !== 'success') {
        throw new Error('Failed to register blob');
      }

      const blobType = await walrusClient.getBlobType();
      const blobObject = objectChanges?.find(
          (change) => change.type === 'created' && change.objectType === blobType,
      );
      if (!blobObject || blobObject.type !== 'created') {
        throw new Error('Blob object not found');
      }

      console.log("blob type: ", blobType);

      const confirmations = await walrusClient.writeEncodedBlobToNodes({
        blobId: encoded.blobId,
        metadata: encoded.metadata,
        sliversByNode: encoded.sliversByNode,
        deletable: true,
        objectId: blobObject.objectId,
      });
      const certifyBlobTx = await walrusClient.certifyBlobTransaction({
        blobId: encoded.blobId,
        blobObjectId: blobObject.objectId,
        confirmations,
        deletable: true,
      });
      certifyBlobTx.setSender(account.address);

        console.log("Certifying blob transaction:", certifyBlobTx);

      const { digest: certifyDigest } = await signAndExecuteTransaction({
        transaction: certifyBlobTx,
      });

      const { effects: certifyEffects } = await suiClient.waitForTransaction({
        digest: certifyDigest,
        options: { showEffects: true },
      });

      console.log("certify blob transaction effects:", certifyEffects);

      if (certifyEffects?.status.status !== 'success') {
        throw new Error('Failed to certify blob');
      }

      // 응답 데이터 처리
      let storageInfo: WalrusStorageInfo = {
        status: WalrusStorageStatus.NEWLY_CREATED,
        blobId: encoded.blobId,
        endEpoch: encoded.metadata.V1.hashes.length,
        suiRefType: "Associated Sui Object",
        suiRef: blobObject.objectId,
        mediaUrl: `${WALRUS_AGGREGATOR_URL}/v1/blobs/${encoded.blobId}`,
        suiScanUrl: getSuiScanUrl("object", blobObject.objectId),
        suiRefId: blobObject.objectId,
      }
      console.log("[신규 BLOB 객체 생성] BLOB 객체 ID:", blobObject.objectId);

      console.log("storageInfo: ", storageInfo);

      return storageInfo;
    } catch (error) {
      console.error("미디어 업로드 오류:", error);
      throw new Error(
          `미디어 업로드 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
    }
  }

  /**
   * 여러 파일을 하나의 Blob으로 업로드하는 함수
   * @param files 업로드할 파일 배열
   * @param sendTo 소유권을 가질 주소
   * @param epochs 주기 (선택 사항)
   * @returns 저장 정보와 각 파일의 메타데이터
   */
  const uploadMultipleMedia = async (
    files: File[],
    sendTo: string,
    epochs?: number
  ): Promise<MultipleMediaUploadResult> => {
    if (!account) {
      throw new Error("Wallet account not found. Please connect your wallet first.");
    }

    if (!files.length) {
      throw new Error("No files provided for upload");
    }

    try {
      console.log("Files to upload:", files);

      // 여러 파일을 하나의 바이트 배열로 합치기
      const filesMetadata: FileMetadata[] = [];
      let totalSize = 0;
      let currentPosition = 0;

      // 모든 파일의 바이트 배열 계산
      const fileBuffers: ArrayBuffer[] = await Promise.all(
        files.map(file => file.arrayBuffer())
      );

      // 총 크기 계산
      totalSize = fileBuffers.reduce((acc, buffer) => acc + buffer.byteLength, 0);
      
      // 하나의 큰 바이트 배열 생성
      const combinedBuffer = new Uint8Array(totalSize);
      
      // 파일 메타데이터 생성 및 바이트 배열 채우기
      for (let i = 0; i < files.length; i++) {
        console.log(`Processing file ${i + 1}:`, files[i].name);
        console.log("currentPosition:", currentPosition);
        console.log("---------------------\n");
        const file = files[i];
        const buffer = fileBuffers[i];
        const bytesArray = new Uint8Array(buffer);
        
        // 현재 파일의 내용을 통합 버퍼에 복사
        combinedBuffer.set(bytesArray, currentPosition);
        
        // 파일 해시 계산
        const fileHash = await calculateFileHash(file);
        
        // 메타데이터 저장
        filesMetadata.push({
          fileName: file.name,
          fileType: file.type,
          fileSize: bytesArray.length,
          fileHash,
          startPosition: currentPosition,
          endPosition: currentPosition + bytesArray.length - 1,
        });
        
        // 다음 파일 위치 업데이트
        currentPosition += bytesArray.length;
      }

      // 단일 blob으로 인코딩
      const encoded = await walrusClient.encodeBlob(combinedBuffer);

      // Blob 등록 트랜잭션 생성
      const registerBlobTx = await walrusClient.registerBlobTransaction({
        blobId: encoded.blobId,
        rootHash: encoded.rootHash,
        size: combinedBuffer.length,
        deletable: true,
        epochs: epochs ? epochs : 3,
        owner: sendTo,
      });
      registerBlobTx.setSender(account.address);

      console.log("Registering combined blob transaction:", registerBlobTx);

      // 트랜잭션 실행
      const { digest } = await signAndExecuteTransaction({ transaction: registerBlobTx });
      const { objectChanges, effects } = await suiClient.waitForTransaction({
        digest,
        options: { showObjectChanges: true, showEffects: true },
      });

      console.log("blob transaction effects:", effects);

      if (effects?.status.status !== 'success') {
        throw new Error('Failed to register blob');
      }

      // 생성된 blob 객체 찾기
      const blobType = await walrusClient.getBlobType();
      const blobObject = objectChanges?.find(
        (change) => change.type === 'created' && change.objectType === blobType,
      );
      if (!blobObject || blobObject.type !== 'created') {
        throw new Error('Blob object not found');
      }

      console.log("blob type:", blobType);

      // 노드에 블롭 데이터 쓰기
      const confirmations = await walrusClient.writeEncodedBlobToNodes({
        blobId: encoded.blobId,
        metadata: encoded.metadata,
        sliversByNode: encoded.sliversByNode,
        deletable: true,
        objectId: blobObject.objectId,
      });

      // blob 인증 트랜잭션
      const certifyBlobTx = await walrusClient.certifyBlobTransaction({
        blobId: encoded.blobId,
        blobObjectId: blobObject.objectId,
        confirmations,
        deletable: true,
      });
      certifyBlobTx.setSender(account.address);

      console.log("Certifying blob transaction:", certifyBlobTx);

      const { digest: certifyDigest } = await signAndExecuteTransaction({
        transaction: certifyBlobTx,
      });

      const { effects: certifyEffects } = await suiClient.waitForTransaction({
        digest: certifyDigest,
        options: { showEffects: true },
      });

      console.log("certify blob transaction effects:", certifyEffects);

      if (certifyEffects?.status.status !== 'success') {
        throw new Error('Failed to certify blob');
      }

      // 응답 데이터 처리
      const storageInfo: WalrusStorageInfo = {
        status: WalrusStorageStatus.NEWLY_CREATED,
        blobId: encoded.blobId,
        endEpoch: encoded.metadata.V1.hashes.length,
        suiRefType: "Associated Sui Object",
        suiRef: blobObject.objectId,
        mediaUrl: `${WALRUS_AGGREGATOR_URL}/v1/blobs/${encoded.blobId}`,
        suiScanUrl: getSuiScanUrl("object", blobObject.objectId),
        suiRefId: blobObject.objectId,
      };

      console.log("[신규 통합 BLOB 객체 생성] BLOB 객체 ID:", blobObject.objectId);
      console.log("filesMetadata:", filesMetadata);

      // 결과 데이터 생성
      const result: MultipleMediaUploadResult = {
        ...storageInfo,
        filesMetadata,
        totalSize,
      };

      return result;
    } catch (error) {
      console.error("다중 미디어 업로드 오류:", error);
      throw new Error(
        `다중 미디어 업로드 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
    }
  };

  /**
   * 파일 범위로 특정 파일만 다운로드
   * @param blobId Walrus Blob ID
   * @param start 시작 위치
   * @param end 종료 위치
   * @returns Blob 객체
   */
  const getMediaRange = async (
    blobId: string, 
    start: number, 
    end: number
  ): Promise<Blob> => {
    try {
      const url = `${WALRUS_AGGREGATOR_URL}/v1/blobs/${blobId}`;
      const response = await fetch(url, {
        headers: {
          Range: `bytes=${start}-${end}`
        }
      });

      if (!response.ok) {
        throw new Error(`미디어 범위 가져오기 실패: ${response.status} ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error("미디어 범위 가져오기 오류:", error);
      throw error;
    }
  };

  return {
    uploadMedia,
    uploadMultipleMedia,
    getMediaRange
  };
}

/**
 * 이미지/영상 업로드 함수
 * @param file 업로드할 파일
 * @param sendTo 소유권을 가질 주소
 * @param epochs 주기 (선택 사항)
 * @returns 저장 정보
 */
export async function uploadMedia(
  file: File,
  sendTo: string,
  epochs?: number
): Promise<WalrusStorageInfo> {
  try {
    const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
    const account = useCurrentAccount();
    if (!account) {
      throw new Error("Wallet account not found. Please connect your wallet first.");
    }
    console.log("File to upload:", file);

    const buffer = await file.arrayBuffer();
    const bytesArray = new Uint8Array(buffer);
    const encoded = await walrusClient.encodeBlob(bytesArray);

    const registerBlobTx = walrusClient.registerBlobTransaction({
      blobId: encoded.blobId,
      rootHash: encoded.rootHash,
      size: bytesArray.length,
      deletable: true,
      epochs: epochs ? epochs : 3,
      owner: sendTo,
    })
    registerBlobTx.setSender(account.address);

    const { digest } = await signAndExecuteTransaction({ transaction: registerBlobTx });
    const { objectChanges, effects } = await suiClient.waitForTransaction({
      digest,
      options: { showObjectChanges: true, showEffects: true },
    });

    if (effects?.status.status !== 'success') {
      throw new Error('Failed to register blob');
    }

    const blobType = await walrusClient.getBlobType();
    const blobObject = objectChanges?.find(
        (change) => change.type === 'created' && change.objectType === blobType,
    );
    if (!blobObject || blobObject.type !== 'created') {
      throw new Error('Blob object not found');
    }

    const confirmations = await walrusClient.writeEncodedBlobToNodes({
      blobId: encoded.blobId,
      metadata: encoded.metadata,
      sliversByNode: encoded.sliversByNode,
      deletable: true,
      objectId: blobObject.objectId,
    });
    const certifyBlobTx = walrusClient.certifyBlobTransaction({
      blobId: encoded.blobId,
      blobObjectId: blobObject.objectId,
      confirmations,
      deletable: true,
    });
    certifyBlobTx.setSender(account.address);

    const { digest: certifyDigest } = await signAndExecuteTransaction({
      transaction: certifyBlobTx,
    });

    const { effects: certifyEffects } = await suiClient.waitForTransaction({
      digest: certifyDigest,
      options: { showEffects: true },
    });

    if (certifyEffects?.status.status !== 'success') {
      throw new Error('Failed to certify blob');
    }

    // 응답 데이터 처리
    let storageInfo: WalrusStorageInfo;
    storageInfo = {
      status: WalrusStorageStatus.NEWLY_CREATED,
      blobId: encoded.blobId,
      endEpoch: encoded.metadata.V1.hashes.length,
      suiRefType: "Associated Sui Object",
      suiRef: blobObject.objectId,
      mediaUrl: `${WALRUS_AGGREGATOR_URL}/v1/blobs/${encoded.blobId}`,
      suiScanUrl: getSuiScanUrl("object", blobObject.objectId),
      suiRefId: blobObject.objectId,
    }
    console.log("[신규 BLOB 객체 생성] BLOB 객체 ID:", blobObject.objectId);

    // if ("alreadyCertified" in data) {
    //   storageInfo = {
    //     status: WalrusStorageStatus.ALREADY_CERTIFIED,
    //     blobId: data.alreadyCertified.blobId,
    //     endEpoch: data.alreadyCertified.endEpoch,
    //     suiRefType: "Previous Sui Certified Event",
    //     suiRef: data.alreadyCertified.event.txDigest,
    //     mediaUrl: `${WALRUS_AGGREGATOR_URL}/v1/blobs/${data.alreadyCertified.blobId}`,
    //     suiScanUrl: getSuiScanUrl("transaction", data.alreadyCertified.event.txDigest),
    //     suiRefId: data.alreadyCertified.event.txDigest,
    //   };
    //   console.log(
    //     "[기존 BLOB 객체 업데이트] 관련 Tx digest:",
    //     data.alreadyCertified.event.txDigest
    //   );
    // } else if ("newlyCreated" in data) {
    //   storageInfo = {
    //     status: WalrusStorageStatus.NEWLY_CREATED,
    //     blobId: data.newlyCreated.blobObject.blobId,
    //     endEpoch: data.newlyCreated.blobObject.storage.endEpoch,
    //     suiRefType: "Associated Sui Object",
    //     suiRef: data.newlyCreated.blobObject.id,
    //     mediaUrl: `${WALRUS_AGGREGATOR_URL}/v1/blobs/${data.newlyCreated.blobObject.blobId}`,
    //     suiScanUrl: getSuiScanUrl("object", data.newlyCreated.blobObject.id),
    //     suiRefId: data.newlyCreated.blobObject.id,
    //   };
    //   console.log("[신규 BLOB 객체 생성] BLOB 객체 ID:", data.newlyCreated.blobObject.id);
    // } else {
    //   throw new Error("알 수 없는 응답 형식");
    // }

    return storageInfo;
  } catch (error) {
    console.error("미디어 업로드 오류:", error);
    throw new Error(
      `미디어 업로드 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
    );
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
    console.error("미디어 가져오기 오류:", error);
    throw error;
  }
}

/**
 * 특정 범위의 미디어 데이터 가져오기 함수
 * @param blobId Walrus Blob ID
 * @param start 시작 바이트 위치
 * @param end 종료 바이트 위치
 * @returns Blob 객체
 */
export async function getMediaRange(blobId: string, start: number, end: number): Promise<Blob> {
  try {
    const url = `${WALRUS_AGGREGATOR_URL}/v1/blobs/${blobId}`;
    const response = await fetch(url, {
      headers: {
        Range: `bytes=${start}-${end}`
      }
    });

    if (!response.ok) {
      throw new Error(`미디어 범위 가져오기 실패: ${response.status} ${response.statusText}`);
    }

    return await response.blob();
  } catch (error) {
    console.error("미디어 범위 가져오기 오류:", error);
    throw error;
  }
}

// function transformResponse(data: any): WalrusStorageInfo {
//   if ("alreadyCertified" in data) {
//     return {
//       status: WalrusStorageStatus.ALREADY_CERTIFIED,
//       blobId: data.alreadyCertified.blobId,
//       endEpoch: data.alreadyCertified.endEpoch,
//       suiRefType: "Previous Sui Certified Event",
//       suiRef: data.alreadyCertified.event.txDigest,
//       mediaUrl: `${WALRUS_AGGREGATOR_URL}/v1/blobs/${data.alreadyCertified.blobId}`,
//       suiScanUrl: getSuiScanUrl("transaction", data.alreadyCertified.event.txDigest),
//       suiRefId: data.alreadyCertified.event.txDigest,
//     };
//   } else if ("newlyCreated" in data) {
//     return {
//       status: WalrusStorageStatus.NEWLY_CREATED,
//       blobId: data.newlyCreated.blobObject.blobId,
//       endEpoch: data.newlyCreated.blobObject.storage.endEpoch,
//       suiRefType: "Associated Sui Object",
//       suiRef: data.newlyCreated.blobObject.id,
//       mediaUrl: `${WALRUS_AGGREGATOR_URL}/v1/blobs/${data.newlyCreated.blobObject.blobId}`,
//       suiScanUrl: getSuiScanUrl("object", data.newlyCreated.blobObject.id),
//       suiRefId: data.newlyCreated.blobObject.id,
//     };
//   } else {
//     throw new Error("Unknown response format");
//   }
// }

/**
 * 파일 해시 계산 함수
 * @param file 파일 객체
 * @returns 파일의 SHA-256 해시
 */
export async function calculateFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return "0x" + hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}
