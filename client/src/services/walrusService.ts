import { getSuiScanUrl } from "../utils/sui";
import { suiClient } from "./modelSuiService";
import { WalrusClient } from "@mysten/walrus";
import {useCurrentAccount} from "@mysten/dapp-kit";
import {useSignAndExecuteTransaction} from "@mysten/dapp-kit";


// Walrus 네트워크 설정
// const WALRUS_NETWORK = "testnet"; // 또는 "devnet", "mainnet" 등
// const WALRUS_PUBLISHER_URL = "https://publisher.testnet.walrus.atalma.io";
export const WALRUS_AGGREGATOR_URL = "https://aggregator.testnet.walrus.atalma.io";

const walrusClient = new WalrusClient({
  network: 'testnet',
  suiClient,
  storageNodeClientOptions: {
    timeout: 60_000,
  },
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
      const certifyBlobTx = await walrusClient.certifyBlobTransaction({
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

      return storageInfo;
    } catch (error) {
      console.error("미디어 업로드 오류:", error);
      throw new Error(
          `미디어 업로드 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
    }
  }

    return {
        uploadMedia,
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
