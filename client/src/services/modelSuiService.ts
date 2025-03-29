import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { SuiClient } from "@mysten/sui/client";
import { Model } from "../types/model";
import { SUI_NETWORK, SUI_CONTRACT, GAS_BUDGET } from "../constants/suiConfig";
import { WalrusStorageInfo } from "./walrusService";

const suiClient = new SuiClient({
  url: SUI_NETWORK.URL,
});

/**
 * 문자열을 바이트 배열로 변환하는 유틸리티 함수
 */
function stringToBytes(str: string): number[] {
  return Array.from(str).map(char => char.charCodeAt(0));
}

interface UploadModelParams {
  name: string;
  description: string;
  modelType: string;
  license: string;
  trainingData: WalrusStorageInfo[];
}

/**
 * Model 객체를 Sui 블록체인에 업로드하는 커스텀 훅
 */
export function useUploadModelToSui() {
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const account = useCurrentAccount();

  const uploadModel = async (params: UploadModelParams) => {
    if (!account) {
      throw new Error("Wallet account not found. Please connect your wallet first.");
    }

    try {
      const tx = new Transaction();

      tx.setGasBudget(GAS_BUDGET);

      // 학습 데이터 blob ID와 Sui 참조를 바이트 배열로 변환
      const trainingDataBlobIds = params.trainingData.map(data => stringToBytes(data.blobId));
      const trainingDataSuiRefs = params.trainingData.map(data => stringToBytes(data.suiRef));

      tx.moveCall({
        target: `${SUI_CONTRACT.PACKAGE_ID}::${SUI_CONTRACT.MODULE_NAME}::create_model`,
        arguments: [
          // model metadata
          tx.pure.string(params.name),
          tx.pure.string(params.description),
          tx.pure.string(params.modelType),

          // model data
          tx.pure.vector("vector<u64>", []), // layerDimensions
          tx.pure.vector("vector<u64>", []), // weightsMagnitudes
          tx.pure.vector("vector<u64>", []), // weightsSigns
          tx.pure.vector("vector<u64>", []), // biasesMagnitudes
          tx.pure.vector("vector<u64>", []), // biasesSigns
          tx.pure.u64(BigInt(0)), // scale

          // training data
          tx.pure.vector("vector<u8>", trainingDataBlobIds),
          tx.pure.vector("vector<u8>", trainingDataSuiRefs),
        ],
      });

      return await signAndExecuteTransaction(
        {
          transaction: tx,
          chain: `sui:${SUI_NETWORK.TYPE}`,
        },
        {
          onSuccess: (result) => {
            console.log("Transaction successful:", result);
            return result;
          }
        }
      );
    } catch (error) {
      console.error("Error uploading model to Sui blockchain:", error);
      throw error;
    }
  };

  return { uploadModel };
}

/**
 * 모델 inference를 수행하는 커스텀 훅
 */
export function useModelInference() {
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction({
    execute: async ({ bytes, signature }) => {
      // SuiClient를 통해 트랜잭션 실행, 이벤트 및 이펙트 정보 포함
      const result = await suiClient.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: {
          showEvents: true,     // 이벤트 정보 포함
          showEffects: true,    // 이펙트 정보 포함
          showRawEffects: true, // 트랜잭션 이펙트 보고용
        },
      });
      
      return result;
    },
  });
  const account = useCurrentAccount();

  /**
   * 단일 레이어에 대해 inference를 수행하는 함수
   * @param modelId 모델 객체 ID
   * @param layerIdx 레이어 인덱스
   * @param inputMagnitude 입력 벡터의 크기 값
   * @param inputSign 입력 벡터의 부호 값
   * @param onSuccess 성공 시 콜백 함수
   */
  const predictLayer = async (
    modelId: string,
    layerIdx: number,
    inputMagnitude: number[],
    inputSign: number[],
    onSuccess?: (result: any) => void
  ) => {
    if (!account) {
      throw new Error("Wallet account not found. Please connect your wallet first.");
    }

    try {
      console.log("Predicting layer", layerIdx, "for model", modelId);
      console.log("inputMagnitude", inputMagnitude);
      console.log("inputSign", inputSign);

      const tx = new Transaction();

      tx.setGasBudget(GAS_BUDGET);

      tx.moveCall({
        target: `${SUI_CONTRACT.PACKAGE_ID}::${SUI_CONTRACT.MODULE_NAME}::predict_layer`,
        arguments: [
          tx.object(modelId),
          tx.pure.u64(BigInt(layerIdx)),
          tx.pure.vector("u64", inputMagnitude),
          tx.pure.vector("u64", inputSign),
        ],
      });

      console.log(`Predicting layer ${layerIdx} for model ${modelId}`, {
        inputMagnitude,
        inputSign,
      });

      // 사용자의 지갑을 통해 트랜잭션 서명 및 실행
      return await signAndExecuteTransaction(
        {
          transaction: tx,
          chain: `sui:${SUI_NETWORK.TYPE}`,
        },
        {
          onSuccess: (result) => {
            console.log(`Layer ${layerIdx} prediction successful:`, result);
            console.log(`Layer ${layerIdx} prediction events:`, result.events);
            
            if (onSuccess) {
              onSuccess(result);
            }
            return result;
          }
        }
      );
    } catch (error) {
      console.error(`Error predicting layer ${layerIdx} for model ${modelId}:`, error);
      throw error;
    }
  };

  /**
   * LayerComputed 이벤트 데이터를 파싱하는 함수
   * @param events 이벤트 배열
   */
  const parseLayerComputedEvent = (events: any[]) => {
    try {
      // LayerComputed 이벤트 필터링
      const layerEvents = events.filter((event: any) => {
        return event.type && event.type === `${SUI_CONTRACT.PACKAGE_ID}::${SUI_CONTRACT.MODULE_NAME}::LayerComputed`
      });

      if (layerEvents.length === 0) {
        return null;
      }

      // 가장 최근 이벤트 데이터 파싱
      const lastEvent = layerEvents[layerEvents.length - 1];
      return {
        modelId: lastEvent.parsedJson?.model_id,
        layerIdx: Number(lastEvent.parsedJson?.layer_idx),
        outputMagnitude: lastEvent.parsedJson?.output_magnitude?.map(Number) || [],
        outputSign: lastEvent.parsedJson?.output_sign?.map(Number) || [],
        activationType: Number(lastEvent.parsedJson?.activation_type),
      };
    } catch (error) {
      console.error("Error parsing layer computed event:", error);
      return null;
    }
  };

  /**
   * PredictionCompleted 이벤트 데이터를 파싱하는 함수
   * @param events 이벤트 배열
   */
  const parsePredictionCompletedEvent = (events: any[]) => {
    try {
      // PredictionCompleted 이벤트 필터링
      const predictionEvents = events.filter((event: any) => {
        return event.type && event.type === `${SUI_CONTRACT.PACKAGE_ID}::${SUI_CONTRACT.MODULE_NAME}::PredictionCompleted`
      });

      if (predictionEvents.length === 0) {
        return null;
      }

      // 이벤트 데이터 파싱
      const event = predictionEvents[0];
      return {
        modelId: event.parsedJson?.model_id,
        outputMagnitude: event.parsedJson?.output_magnitude?.map(Number) || [],
        outputSign: event.parsedJson?.output_sign?.map(Number) || [],
        argmaxIdx: Number(event.parsedJson?.argmax_idx),
      };
    } catch (error) {
      console.error("Error parsing prediction completed event:", error);
      return null;
    }
  };

  return {
    predictLayer,
    parseLayerComputedEvent,
    parsePredictionCompletedEvent,
  };
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
        obj.data?.content?.type?.includes(`${SUI_CONTRACT.MODULE_NAME}::Graph`)
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
