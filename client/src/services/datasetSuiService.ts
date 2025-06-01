import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { SuiClient } from "@mysten/sui/client";
import { SUI_NETWORK, SUI_CONTRACT, GAS_BUDGET } from "../constants/suiConfig";
import { useWalrusService } from "./walrusService";
import { type DatasetObject } from "./datasetGraphQLService";
import {encryptRangeOption} from "./sealService.ts";


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
  dataCount: number;
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

/**
 * 데이터셋 서비스 클래스
 */
export function useDatasetSuiService() {
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const account = useCurrentAccount();
  const { uploadMultipleMedia } = useWalrusService();

  /**
   * 데이터셋 생성 및 데이터 추가 (개별 파일 업로드 방식)
   */
  const createDataset = async (
    metadata: DatasetMetadata,
    annotations: string[],
    files: { blobId: string; fileHash: string }[],
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
          tx.pure.option("string", metadata.description),
          tx.pure.string(metadata.dataType),
          tx.pure.u64(BigInt(metadata.dataSize)),
          tx.pure.u64(BigInt(metadata.dataCount)),
          tx.pure.option("string", metadata.creator),
          tx.pure.option("string", metadata.license),
          tx.pure.option("vector<string>", metadata.tags),
        ],
      });

      // 2. 데이터셋 객체 생성
      const dataset = tx.moveCall({
        target: `${SUI_CONTRACT.PACKAGE_ID}::dataset::new_dataset`,
        arguments: [tx.pure.string(metadata.name), metadataObject],
      });

      // 3. 각 파일을 Walrus에 업로드하고 데이터 객체 생성
      const dataIds: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const annotation = annotations[i];

        try {
          // blob range 객체 생성
          const rangeOptionObject = tx.moveCall({
            target: `${SUI_CONTRACT.PACKAGE_ID}::dataset::new_range_option`,
            arguments: [
              tx.pure.option("u64", null), // range start
              tx.pure.option("u64", null), // range end
            ],
          });

          // 데이터 객체 생성
          const dataObject = tx.moveCall({
            target: `${SUI_CONTRACT.PACKAGE_ID}::dataset::new_data`,
            arguments: [
              tx.pure.string(`data_${i}`),
              tx.pure.string(file.blobId),
              tx.pure.string(file.fileHash),
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

          dataIds.push(file.blobId);
        } catch (error) {
          console.error(`Error processing data object ${i + 1}:`, error);
          throw new Error(
            `Failed to process data object ${i + 1}: ${error instanceof Error ? error.message : "Unknown error"}`
          );
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
      console.error("Error creating dataset:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      if (onError) {
        onError(new Error(`Failed to create dataset: ${errorMessage}`));
      }
      throw new Error(`Failed to create dataset: ${errorMessage}`);
    }
  };

  /**
   * 여러 파일을 하나의 Blob으로 업로드하고 데이터셋 생성
   * @param metadata 데이터셋 메타데이터
   * @param files 업로드할 파일 배열
   * @param epochs Walrus 저장 주기 (선택 사항)
   * @param onSuccess 성공 콜백
   * @param onError 오류 콜백
   * @returns 데이터셋 생성 결과
   */
  const createDatasetWithMultipleFiles = async (
    metadata: DatasetMetadata,
    files: File[],
    epochs?: number,
    onSuccess?: (result: any) => void,
    onError?: (error: Error) => void
  ) => {
    if (!account) {
      const error = new Error("Wallet account not found. Please connect your wallet first.");
      if (onError) onError(error);
      throw error;
    }

    try {
      console.log("Creating dataset with multiple files...");

      // 1. 여러 파일을 하나의 blob으로 Walrus에 업로드
      const blobUploadResult = await uploadMultipleMedia(files, account.address, epochs);
      console.log("Blob upload result:", blobUploadResult);

      // 2. Sui 트랜잭션 생성
      const tx = new Transaction();
      tx.setGasBudget(GAS_BUDGET);

      // 3. 메타데이터 객체 생성
      const metadataObject = tx.moveCall({
        target: `${SUI_CONTRACT.PACKAGE_ID}::metadata::new_metadata`,
        arguments: [
          tx.pure.option("string", metadata.description),
          tx.pure.string(metadata.dataType),
          tx.pure.u64(BigInt(blobUploadResult.totalSize)),
          tx.pure.u64(BigInt(files.length)),
          tx.pure.option("string", metadata.creator),
          tx.pure.option("string", metadata.license),
          tx.pure.option("vector<string>", metadata.tags),
        ],
      });

      // 4. 데이터셋 객체 생성
      const dataset = tx.moveCall({
        target: `${SUI_CONTRACT.PACKAGE_ID}::dataset::new_dataset`,
        arguments: [tx.pure.string(metadata.name), metadataObject],
      });

      // 5. 각 파일에 대한 데이터 객체 생성 (하나의 blob을 참조하되 range 정보 포함)
      const dataIds: string[] = [];
      const { blobId, filesMetadata } = blobUploadResult;

      console.log("file metadata length:", filesMetadata.length);
      console.log("file metadata:", filesMetadata);
      for (let i = 0; i < filesMetadata.length; i++) {
        const fileMetadata = filesMetadata[i];
        
        try {
          const encryptedRangeOption = await encryptRangeOption(
            account.address,
            fileMetadata.startPosition,
            fileMetadata.endPosition,
          )

          // blob range 객체 생성 - 실제 start/end 값 설정
          const rangeOptionObject = tx.moveCall({
            target: `${SUI_CONTRACT.PACKAGE_ID}::dataset::new_range_option`,
            arguments: [
              tx.pure.vector("u8", encryptedRangeOption),
            ],
          });

          // 데이터 객체 생성 (모든 파일이 동일한 blobId 참조)
          const dataObject = tx.moveCall({
            target: `${SUI_CONTRACT.PACKAGE_ID}::dataset::new_data`,
            arguments: [
              tx.pure.string(fileMetadata.fileName),
              tx.pure.string(blobId),
              tx.pure.string(fileMetadata.fileHash),
              tx.pure.string(fileMetadata.fileType),
              rangeOptionObject,
            ],
          });

          // 데이터셋에 데이터 추가
          tx.moveCall({
            target: `${SUI_CONTRACT.PACKAGE_ID}::dataset::add_data`,
            arguments: [dataset, dataObject],
          });

          dataIds.push(fileMetadata.fileName);
        } catch (error) {
          console.error(`Error processing data object ${i + 1}:`, error);
          throw new Error(
            `Failed to process data object ${i + 1}: ${error instanceof Error ? error.message : "Unknown error"}`
          );
        }
      }

      // 6. 데이터셋 소유권 이전
      tx.transferObjects([dataset], account.address);

      // 7. 트랜잭션 실행
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
      console.error("Error creating dataset with multiple files:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      if (onError) {
        onError(new Error(`Failed to create dataset: ${errorMessage}`));
      }
      throw new Error(`Failed to create dataset: ${errorMessage}`);
    }
  };

  const addAnnotationLabels = async (
    dataset: DatasetObject,
    annotations: { path: string; label: string[] }[],
  ) => {
    if (!account) {
      throw new Error("Wallet account not found. Please connect your wallet first.");
    }

    if (annotations.length === 0) {
      throw new Error("No annotations provided");
    }

    try {
      const tx = new Transaction();
      tx.setGasBudget(GAS_BUDGET);

      let pathArr: string[] = [];
      let labelArr: string[] = [];
      for (let i = 0; i < annotations.length; i++) {
        const { path, label } = annotations[i];
        if (label.length === 0) {
          throw new Error(`Label is required for path: ${path}`);
        }

        pathArr.push(path);
        labelArr.push(label[0]); // Currently only the first label is used
      }

      tx.moveCall({
        target: `${SUI_CONTRACT.PACKAGE_ID}::dataset::batch_add_pending_annotations`,
        arguments: [
          tx.object(dataset.id),
          tx.pure.vector("string", pathArr),
          tx.pure.vector("string", labelArr),
        ],
      });

      await signAndExecuteTransaction(
        {
          transaction: tx,
          chain: `sui:${SUI_NETWORK.TYPE}`,
        },
        {
          onSuccess: result => {
            console.log("Annotation labels added successfully:", result);
            return result;
          },
        }
      );
    } catch (error) {
      console.error("Error adding annotation labels:", error);
      throw error;
    }
  };

  const addConfirmedAnnotationLabels = async (
      dataset: DatasetObject,
      annotation: { path: string; label: string[] },
  ) => {
    if (!account) {
      throw new Error("Wallet account not found. Please connect your wallet first.");
    }

    if (!annotation) {
      throw new Error("No annotation provided");
    }

    try {
      const tx = new Transaction();
      tx.setGasBudget(GAS_BUDGET);

      tx.moveCall({
        target: `${SUI_CONTRACT.PACKAGE_ID}::dataset::add_confirmed_annotations`,
        arguments: [
          tx.object(dataset.id),
          tx.pure.string(annotation.path),
          tx.pure.vector("string", annotation.label),
        ],
      });

      await signAndExecuteTransaction(
          {
            transaction: tx,
            chain: `sui:${SUI_NETWORK.TYPE}`,
          },
          {
            onSuccess: result => {
              console.log("Annotation labels added successfully:", result);
              return result;
            },
          }
      );
    } catch (error) {
      console.error("Error adding annotation labels:", error);
      throw error;
    }
  };

  return { 
    createDataset,
    createDatasetWithMultipleFiles,
    addAnnotationLabels,
    addConfirmedAnnotationLabels
  };
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

/**
 * 데이터셋의 모든 데이터 항목을 가져오는 함수
 */
export async function getDatasetData(datasetId: string) {
  if (!datasetId) {
    throw new Error("Dataset ID is required");
  }

  try {
    const object = await suiClient.getObject({
      id: datasetId,
      options: {
        showContent: true,
        showType: true,
        showOwner: true,
      },
    });

    if (object.data?.content?.dataType !== "moveObject") {
      throw new Error("Invalid dataset object");
    }

    const content = object.data.content as any;
    const dataItems = content.fields?.data_items || [];
    
    // 데이터 항목 파싱
    const parsedDataItems = dataItems.map((item: any) => {
      const range = item.range || {};
      return {
        id: item.id,
        path: item.path,
        blobId: item.blob_id,
        blobHash: item.blob_hash,
        annotations: item.annotations || [],
        range: {
          start: range.start !== undefined ? Number(range.start) : undefined,
          end: range.end !== undefined ? Number(range.end) : undefined,
        }
      };
    });

    return {
      dataItems: parsedDataItems,
      isLoading: false,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching dataset data:", error);
    throw error;
  }
}
