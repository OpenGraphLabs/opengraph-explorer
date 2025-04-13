import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { SuiClient } from "@mysten/sui/client";
import { SUI_NETWORK, SUI_CONTRACT, GAS_BUDGET } from "../constants/suiConfig";
import { uploadMedia, calculateFileHash } from "./walrusService";

const suiClient = new SuiClient({
  url: SUI_NETWORK.URL,
});

// 데이터셋 메타데이터 인터페이스
export interface DatasetMetadata {
  name: string;
  description?: string;
  tags?: string[];
  dataType: string;
  dataSize: number;
  creator?: string;
  license?: string;
}

// 데이터 인터페이스
export interface Data {
  path: string;
  annotations: string[];
  blobId: string;
  blobHash: string;
  range?: {
    start?: number;
    end?: number;
  };
}

// 데이터셋 생성 결과 인터페이스
export interface DatasetCreationResult {
  datasetId: string;
  dataIds: string[];
}

/**
 * 데이터셋 서비스 클래스
 */
export function useDatasetSuiService() {
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const account = useCurrentAccount();

  /**
   * 데이터셋 생성 및 데이터 추가
   */
  const createDataset = async (
    metadata: DatasetMetadata,
    files: File[],
    annotations: string[],
    onSuccess?: (result: any) => void,
    onError?: (error: Error) => void
  ) => {
    if (!account) {
      const error = new Error("Wallet account not found. Please connect your wallet first.");
      if (onError) onError(error);
      throw error;
    }

    try {
      const tx = new Transaction();
      tx.setGasBudget(GAS_BUDGET);

      // 1. 메타데이터 객체 생성
      const metadataObject = tx.moveCall({
        target: `${SUI_CONTRACT.PACKAGE_ID}::metadata::new_metadata`,
        arguments: [
          tx.pure.option('string', metadata.description),
          tx.pure.string(metadata.dataType),
          tx.pure.u64(BigInt(metadata.dataSize)),
          tx.pure.option('string', metadata.creator),
          tx.pure.option('string', metadata.license),
          tx.pure.option('vector<string>', metadata.tags),
        ],
      });

      // 2. 데이터셋 객체 생성
      const dataset = tx.moveCall({
        target: `${SUI_CONTRACT.PACKAGE_ID}::dataset::new_dataset`,
        arguments: [
          tx.pure.string(metadata.name),
          metadataObject,
        ],
      });

      // 3. 각 파일을 Walrus에 업로드하고 데이터 객체 생성
      const dataIds: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const annotation = annotations[i];

        try {
          // Walrus에 파일 업로드
          console.log(`Uploading file ${i + 1}/${files.length} to Walrus...`);
          const storageInfo = await uploadMedia(file, account.address, 10);
          console.log(`File ${i + 1} uploaded successfully:`, storageInfo);
          
          // 파일 해시 계산
          const fileHash = await calculateFileHash(file);
          console.log(`File ${i + 1} hash calculated:`, fileHash);

          // blob range 객체 생성
          const rangeOptionObject = tx.moveCall({
            target: `${SUI_CONTRACT.PACKAGE_ID}::dataset::new_range_option`,
            arguments: [
              tx.pure.option("u64", null), // range start
              tx.pure.option("u64", null), // range end
            ],
          });

          // 데이터 객체 생성 (u256 형식으로 변환)
          const dataObject = tx.moveCall({
            target: `${SUI_CONTRACT.PACKAGE_ID}::dataset::new_data`,
            arguments: [
              tx.pure.string(`data_${i}`),
              tx.pure.string(storageInfo.blobId),
              tx.pure.string(fileHash),
              rangeOptionObject,
            ],
          });

          // 어노테이션 추가
          tx.moveCall({
            target: `${SUI_CONTRACT.PACKAGE_ID}::dataset::add_annotation_label`,
            arguments: [dataObject, tx.pure.string(annotation)],
          });

          // 데이터셋에 데이터 추가
          tx.moveCall({
            target: `${SUI_CONTRACT.PACKAGE_ID}::dataset::add_data`,
            arguments: [dataset, dataObject],
          });

          dataIds.push(storageInfo.blobId);
        } catch (error) {
          console.error(`Error processing file ${i + 1}:`, error);
          throw new Error(`Failed to process file ${file.name}: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
      }

      tx.transferObjects([dataset], account.address);

      // 4. 트랜잭션 실행
      return await signAndExecuteTransaction(
        {
          transaction: tx,
          chain: `sui:${SUI_NETWORK.TYPE}`,
        },
        {
          onSuccess: result => {
            console.log("Dataset creation successful:", result);
            if (onSuccess) {
              onSuccess(result);
            }
            return result;
          },
          onError: error => {
            console.error("Transaction execution failed:", error);
            if (onError) {
              onError(new Error(`Transaction failed: ${error instanceof Error ? error.message : "Unknown error"}`));
            }
          }
        }
      );
    } catch (error) {
      console.error("Error creating dataset:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      if (onError) {
        onError(new Error(`Failed to create dataset: ${errorMessage}`));
      }
      throw new Error(`Failed to create dataset: ${errorMessage}`);
    }
  };

  return { createDataset };
}

/**
 * 특정 주소가 업로드한 데이터셋 객체를 가져오는 함수
 */
export async function getDatasets(ownerAddress: string) {
  if (!ownerAddress) {
    return {
      datasets: [],
      isLoading: false,
      error: null,
    };
  }

  try {
    // 해당 주소가 소유한 객체 가져오기
    const { data } = await suiClient.getOwnedObjects({
      owner: ownerAddress,
    });

    // 객체 ID 추출
    const objectIds = data
      .map(item => item.data?.objectId)
      .filter((id): id is string => id !== undefined);

    if (!objectIds.length) {
      return {
        datasets: [],
        isLoading: false,
        error: null,
      };
    }

    // 객체 상세 정보 가져오기
    const objects = await suiClient.multiGetObjects({
      ids: objectIds,
      options: {
        showContent: true,
        showType: true,
      },
    });

    // 데이터셋 객체만 필터링
    const datasetObjects = objects.filter(
      obj =>
        obj.data?.content?.dataType === "moveObject" &&
        obj.data?.content?.type?.includes("dataset::Dataset")
    );

    // 데이터셋 객체 파싱
    const datasets = datasetObjects.map(obj => {
      const content = obj.data?.content as any;
      return {
        id: obj.data?.objectId,
        name: content?.fields?.name,
        description: content?.fields?.description,
        dataType: content?.fields?.data_type,
        dataSize: content?.fields?.data_size,
        creator: content?.fields?.creator,
        license: content?.fields?.license,
        tags: content?.fields?.tags,
      };
    });

    return {
      datasets,
      isLoading: false,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching datasets:", error);
    return {
      datasets: [],
      isLoading: false,
      error,
    };
  }
}

/**
 * 데이터셋 ID로 특정 데이터셋의 상세 정보를 가져오는 함수
 */
export async function getDatasetById(datasetId: string) {
  if (!datasetId) {
    throw new Error("Dataset ID is required");
  }

  try {
    const object = await suiClient.getObject({
      id: datasetId,
      options: {
        showContent: true,
        showType: true,
      },
    });

    if (object.data?.content?.dataType !== "moveObject") {
      throw new Error("Invalid dataset object");
    }

    const content = object.data.content as any;
    return {
      dataset: {
        id: object.data.objectId,
        name: content.fields?.name,
        description: content.fields?.description,
        dataType: content.fields?.data_type,
        dataSize: content.fields?.data_size,
        creator: content.fields?.creator,
        license: content.fields?.license,
        tags: content.fields?.tags,
      },
      isLoading: false,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching dataset by ID:", error);
    throw error;
  }
}
