import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { SuiClient } from "@mysten/sui/client";
import { Model } from "../types/model";

// Sui 컨트랙트 정보
const NETWORK = "testnet";
const TENSORFLOW_SUI_PACKAGE_ADDRESS =
  "0x9e91d5e190849806449a918ac3c6f8ae8254ce5e6149c3a877993d4183eb7a22";
const MODULE_NAME = "model";

const suiClient = new SuiClient({
  url: "https://fullnode.testnet.sui.io",
});

/**
 * Model 객체를 Sui 블록체인에 업로드하는 커스텀 훅
 */
export function useUploadModelToSui() {
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const account = useCurrentAccount();

  const uploadModel = async (
    model: Model,
    modelInfo: { name: string; description: string; task: string }
  ) => {
    if (!account) {
      throw new Error("Wallet account not found. Please connect your wallet first.");
    }

    console.log("Uploading model to Sui blockchain:", model);
    console.log("Model info:", modelInfo);

    try {
      const tx = new Transaction();

      tx.moveCall({
        target: `${TENSORFLOW_SUI_PACKAGE_ADDRESS}::${MODULE_NAME}::create_model`,
        arguments: [
          // model metadata
          tx.pure.string(modelInfo.name),
          tx.pure.string(modelInfo.description),
          tx.pure.string(modelInfo.task),

          // model data
          tx.pure.vector("vector<u64>", model.layerDimensions),
          tx.pure.vector("vector<u64>", model.weightsMagnitudes),
          tx.pure.vector("vector<u64>", model.weightsSigns),
          tx.pure.vector("vector<u64>", model.biasesMagnitudes),
          tx.pure.vector("vector<u64>", model.biasesSigns),
          tx.pure.u64(BigInt(model.scale)),
        ],
      });

      return await signAndExecuteTransaction({
        transaction: tx,
        chain: `sui:${NETWORK}`,
      });
    } catch (error) {
      console.error("Error uploading model to Sui blockchain:", error);
      throw error;
    }
  };

  return { uploadModel };
}

/**
 * 특정 주소가 업로드한 모델 객체를 가져오는 함수
 */
export async function getModels(ownerAddress: string) {
  if (!ownerAddress) {
    return {
      models: [],
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
        models: [],
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

    // 모델 객체만 필터링
    const modelObjects = objects.filter(
      obj =>
        obj.data?.content?.dataType === "moveObject" &&
        obj.data?.content?.type?.includes(`${MODULE_NAME}::Graph`)
    );

    // 모델 객체 파싱 (실제 구현은 컨트랙트 반환 구조에 따라 달라질 수 있음)
    const models = modelObjects.map(obj => {
      // const content = obj.data?.content;
      // 여기서는 예시로 반환하지만, 실제 구현은 컨트랙트 반환 구조에 맞게 조정 필요
      return {
        id: obj.data?.objectId,
        owner: obj.data?.owner?.toString() || "",
        // 기타 모델 정보를 구조에 맞게 파싱
      };
    });

    return {
      models,
      isLoading: false,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching models:", error);
    return {
      models: [],
      isLoading: false,
      error,
    };
  }
}

/**
 * 모델 ID로 특정 모델의 상세 정보를 가져오는 함수
 */
export async function getModelById(modelId: string) {
  if (!modelId) {
    throw new Error("Model ID is required");
  }

  try {
    const object = await suiClient.getObject({
      id: modelId,
      options: {
        showContent: true,
        showType: true,
      },
    });

    if (object.data?.content?.dataType !== "moveObject") {
      throw new Error("Invalid model object");
    }

    // 모델 정보 파싱 (실제 구현은 컨트랙트 반환 구조에 따라 달라질 수 있음)
    // 이 부분은 실제 컨트랙트가 반환하는 형식에 맞게 조정 필요
    // const modelData = object.data.content;

    return {
      model: {
        id: object.data.objectId,
        // 기타 필요한 정보 파싱
      },
      isLoading: false,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching model by ID:", error);
    throw error;
  }
}
