import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction, TransactionArgument } from "@mysten/sui/transactions";
import { SuiClient } from "@mysten/sui/client";
import { SUI_NETWORK, SUI_CONTRACT, GAS_BUDGET } from "../constants/suiConfig";
import { Model } from "../types/model";

const suiClient = new SuiClient({
  url: SUI_NETWORK.URL,
});

interface UploadModelParams {
  name: string;
  description: string;
  modelType: string;
  trainingDatasetId?: string;
  testDatasetIds?: string[];
}

/**
 * Model 객체를 Sui 블록체인에 업로드하는 커스텀 훅
 */
export function useUploadModelToSui() {
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const account = useCurrentAccount();

  const uploadModel = async (
    model: Model,
    params: UploadModelParams,
    onSuccess?: (result: any) => void
  ) => {
    if (!account) {
      throw new Error("Wallet account not found. Please connect your wallet first.");
    }

    try {
      const tx = new Transaction();

      tx.setGasBudget(GAS_BUDGET);

      tx.moveCall({
        target: `${SUI_CONTRACT.PACKAGE_ID}::${SUI_CONTRACT.MODULE_NAME}::new_model`,
        arguments: [
          // model metadata
          tx.pure.string(params.name),
          tx.pure.string(params.description),
          tx.pure.string(params.modelType),

          // model data
          tx.pure.vector("vector<u64>", model.layerDimensions),
          tx.pure.vector("vector<u64>", model.weightsMagnitudes),
          tx.pure.vector("vector<u64>", model.weightsSigns),
          tx.pure.vector("vector<u64>", model.biasesMagnitudes),
          tx.pure.vector("vector<u64>", model.biasesSigns),
          tx.pure.u64(BigInt(model.scale)),

          // dataset references
          tx.pure.option("address", params.trainingDatasetId),
          tx.pure.option("vector<address>", params.testDatasetIds),
        ],
      });

      return await signAndExecuteTransaction(
        {
          transaction: tx,
          chain: `sui:${SUI_NETWORK.TYPE}`,
        },
        {
          onSuccess: result => {
            console.log("Transaction successful:", result);
            if (onSuccess) {
              onSuccess(result);
            }
            return result;
          },
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
          showEvents: true, // 이벤트 정보 포함
          showEffects: true, // 이펙트 정보 포함
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
          onSuccess: result => {
            console.log(`Layer ${layerIdx} prediction successful:`, result);
            console.log(`Layer ${layerIdx} prediction events:`, result.events);

            if (onSuccess) {
              onSuccess(result);
            }
            return result;
          },
        }
      );
    } catch (error) {
      console.error(`Error predicting layer ${layerIdx} for model ${modelId}:`, error);
      throw error;
    }
  };

  /**
   * 모델 전체에 대해 PTB inference를 수행하는 함수
   * 모든 레이어를 한 번의 트랜잭션으로 처리
   * @param modelId 모델 객체 ID
   * @param layerCount 모델 레이어 수
   * @param inputMagnitude 입력 벡터의 크기 값
   * @param inputSign 입력 벡터의 부호 값
   * @param onSuccess 성공 시 콜백 함수
   * @returns 트랜잭션 실행 결과
   */
  const predictModelWithPTB = async (
    modelId: string,
    layerCount: number,
    inputMagnitude: number[],
    inputSign: number[],
    onSuccess?: (result: any) => void
  ) => {
    if (!account) {
      throw new Error("Wallet account not found. Please connect your wallet first.");
    }

    try {
      console.log("Predicting full model with PTB chaining", modelId);
      console.log("Input magnitude:", inputMagnitude);
      console.log("Input sign:", inputSign);

      const tx = new Transaction();
      tx.setGasBudget(GAS_BUDGET);

      // predict_layer는 (vector<u64>, vector<u64>, Option<u64>)를 반환
      // 첫 번째 레이어 실행
      let layerOutput = tx.moveCall({
        target: `${SUI_CONTRACT.PACKAGE_ID}::${SUI_CONTRACT.MODULE_NAME}::predict_layer`,
        arguments: [
          tx.object(modelId),
          tx.pure.u64(0n), // 첫 번째 레이어(인덱스 0)
          tx.pure.vector("u64", inputMagnitude),
          tx.pure.vector("u64", inputSign),
        ],
      });

      // 나머지 레이어들을 연속해서 실행
      // 각 레이어의 출력을 다음 레이어의 입력으로 사용
      for (let i = 1; i < layerCount; i++) {
        // layerOutput은 (magnitude, sign, argmax_option) 튜플
        // 다음 레이어의 입력으로 이전 레이어의 magnitude와 sign만 사용
        layerOutput = tx.moveCall({
          target: `${SUI_CONTRACT.PACKAGE_ID}::${SUI_CONTRACT.MODULE_NAME}::predict_layer`,
          arguments: [
            tx.object(modelId),
            tx.pure.u64(BigInt(i)),
            // result[0]은 output_magnitude, result[1]은 output_sign
            layerOutput[0], // magnitude vector
            layerOutput[1], // sign vector
          ],
        });
      }

      // 최종 출력은 layerOutput에 저장됨
      // layerOutput[0]: 최종 magnitude
      // layerOutput[1]: 최종 sign
      // layerOutput[2]: 마지막 레이어의 argmax_option (Option<u64> 타입)

      // 사용자의 지갑을 통해 트랜잭션 서명 및 실행
      return await signAndExecuteTransaction(
        {
          transaction: tx,
          chain: `sui:${SUI_NETWORK.TYPE}`,
        },
        {
          onSuccess: result => {
            console.log(`Full model prediction successful:`, result);
            console.log(`Events:`, result.events);

            // 마지막 레이어의 이벤트를 파싱
            const events = result.events || [];
            const finalLayerEvent = parseLayerComputedEvent(events);
            const predictionCompletedEvent = parsePredictionCompletedEvent(events);

            console.log(`Final layer output:`, finalLayerEvent);
            console.log(`Prediction completed:`, predictionCompletedEvent);

            if (onSuccess) {
              onSuccess(result);
            }
            return result;
          },
        }
      );
    } catch (error) {
      console.error(`Error predicting model ${modelId} with PTB:`, error);
      throw error;
    }
  };

  /**
   * 최적화된 PTB inference를 수행하는 함수
   * 레이어의 각 출력 차원에 대해 별도 트랜잭션 수행
   * @param modelId 모델 객체 ID
   * @param layerCount 모델 레이어 수
   * @param layerDimensions 각 레이어의 출력 차원 크기 배열
   * @param inputMagnitude 입력 벡터의 크기 값
   * @param inputSign 입력 벡터의 부호 값
   * @param onSuccess 성공 시 콜백 함수
   * @returns 트랜잭션 실행 결과
   */
  const predictModelWithPTBOptimization = async (
    modelId: string,
    layerCount: number,
    layerDimensions: number[],
    inputMagnitude: number[],
    inputSign: number[],
    onSuccess?: (result: any) => void
  ) => {
    if (!account) {
      throw new Error("Wallet account not found. Please connect your wallet first.");
    }
    if (layerDimensions.length !== layerCount) {
      throw new Error("Layer dimensions array length must match layer count.");
    }

    try {
      const tx = new Transaction();
      tx.setGasBudget(GAS_BUDGET);

      let layerResultMagnitudes = undefined;
      let layerResultSigns = undefined;

      // 첫 번째 레이어 실행
      // 첫 번째 레이어 실행
      console.log(`Processing layer 0 with output dimension ${layerDimensions[0]}`);
      for (let dimIdx = 0; dimIdx < layerDimensions[0]; dimIdx++) {
        // predict_layer_partial 함수 호출
        // 반환값은 (accumulated magnitude, accumulated sign, output dimension index, is last dimension)
        const partialResult = tx.moveCall({
          target: `${SUI_CONTRACT.PACKAGE_ID}::${SUI_CONTRACT.MODULE_NAME}::predict_layer_partial`,
          arguments: [
            tx.object(modelId),
            tx.pure.u64(BigInt(0)),
            tx.pure.u64(BigInt(dimIdx)),
            tx.pure.vector("u64", inputMagnitude),
            tx.pure.vector("u64", inputSign),
            layerResultMagnitudes ? layerResultMagnitudes : tx.pure.vector("u64", []),
            layerResultSigns ? layerResultSigns : tx.pure.vector("u64", []),
          ],
        });

        layerResultMagnitudes = partialResult[0];
        layerResultSigns = partialResult[1];
      }

      // 나머지 레이어들을 연속해서 실행
      // 각 레이어의 출력을 다음 레이어의 입력으로 사용
      for (let layerIdx = 1; layerIdx < layerCount; layerIdx++) {
        const outputDimension = layerDimensions[layerIdx];
        console.log(`Processing layer ${layerIdx} with output dimension ${outputDimension}`);

        let currentLayerResultMagnitudes = undefined;
        let currentLayerResultSigns = undefined;

        for (let dimIdx = 0; dimIdx < outputDimension; dimIdx++) {
          // predict_layer_partial 함수 호출
          // 반환값은 (accumulated magnitude, accumulated sign, output dimension index, is last dimension)
          const partialResult = tx.moveCall({
            target: `${SUI_CONTRACT.PACKAGE_ID}::${SUI_CONTRACT.MODULE_NAME}::predict_layer_partial`,
            arguments: [
              tx.object(modelId),
              tx.pure.u64(BigInt(layerIdx)),
              tx.pure.u64(BigInt(dimIdx)),
              layerResultMagnitudes as TransactionArgument,
              layerResultSigns as TransactionArgument,
              currentLayerResultMagnitudes
                ? currentLayerResultMagnitudes
                : tx.pure.vector("u64", []),
              currentLayerResultSigns ? currentLayerResultSigns : tx.pure.vector("u64", []),
            ],
          });

          // 현재 레이어 결과 저장
          currentLayerResultMagnitudes = partialResult[0];
          currentLayerResultSigns = partialResult[1];
        }

        // 현재 레이어의 결과로 다음 레이어의 입력 벡터 업데이트
        layerResultMagnitudes = currentLayerResultMagnitudes;
        layerResultSigns = currentLayerResultSigns;
      }

      // 사용자의 지갑을 통해 트랜잭션 서명 및 실행
      return await signAndExecuteTransaction(
        {
          transaction: tx,
          chain: `sui:${SUI_NETWORK.TYPE}`,
        },
        {
          onSuccess: result => {
            console.log(`Optimized PTB prediction successful:`, result);
            console.log(`Events:`, result.events);

            // 결과 이벤트 파싱
            const events = result.events || [];
            const partialLayerEvents = parseLayerPartialComputedEvents(events);
            const predictionCompletedEvent = parsePredictionCompletedEvent(events);

            console.log(`Partial layer outputs:`, partialLayerEvents);
            console.log(`Prediction completed:`, predictionCompletedEvent);

            if (onSuccess) {
              onSuccess(result);
            }
            return result;
          },
        }
      );
    } catch (error) {
      console.error(`Error predicting model ${modelId} with optimized PTB:`, error);
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
        return (
          event.type &&
          event.type === `${SUI_CONTRACT.PACKAGE_ID}::${SUI_CONTRACT.MODULE_NAME}::LayerComputed`
        );
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
        return (
          event.type &&
          event.type ===
            `${SUI_CONTRACT.PACKAGE_ID}::${SUI_CONTRACT.MODULE_NAME}::PredictionCompleted`
        );
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

  /**
   * LayerPartialComputed 이벤트 데이터를 파싱하는 함수
   * @param events 이벤트 배열
   */
  const parseLayerPartialComputedEvents = (events: any[]) => {
    try {
      // LayerPartialComputed 이벤트 필터링
      const partialEvents = events.filter((event: any) => {
        return (
          event.type &&
          event.type ===
            `${SUI_CONTRACT.PACKAGE_ID}::${SUI_CONTRACT.MODULE_NAME}::LayerPartialComputed`
        );
      });

      if (partialEvents.length === 0) {
        return [];
      }

      // 각 이벤트 파싱하여 결과 배열 생성
      return partialEvents.map(event => {
        return {
          modelId: event.parsedJson?.model_id,
          layerIdx: Number(event.parsedJson?.layer_idx),
          outputDimIdx: Number(event.parsedJson?.output_dim_idx),
          outputMagnitude: Number(event.parsedJson?.output_magnitude),
          outputSign: Number(event.parsedJson?.output_sign),
          isLastDimension: event.parsedJson?.is_last_dimension,
        };
      });
    } catch (error) {
      console.error("Error parsing layer partial computed events:", error);
      return [];
    }
  };

  /**
   * LayerPartialComputed 이벤트들을 레이어 별로 재구성하는 함수
   * @param partialEvents 각 차원별 계산 결과 이벤트 배열
   * @param layerCount 총 레이어 수
   */
  const reconstructLayerOutputs = (partialEvents: any[], layerCount: number) => {
    try {
      // 레이어별 출력 결과를 저장할 객체
      const layerOutputs: { [key: number]: { magnitudes: number[]; signs: number[] } } = {};

      // 각 레이어 초기화
      for (let i = 0; i < layerCount; i++) {
        layerOutputs[i] = { magnitudes: [], signs: [] };
      }

      // 파셜 이벤트들을 레이어 및 차원 인덱스에 따라 정렬
      partialEvents.sort((a, b) => {
        if (a.layerIdx !== b.layerIdx) {
          return a.layerIdx - b.layerIdx;
        }
        return a.outputDimIdx - b.outputDimIdx;
      });

      // 정렬된 이벤트를 바탕으로 각 레이어의 출력 벡터 재구성
      partialEvents.forEach(event => {
        const { layerIdx, outputMagnitude, outputSign } = event;

        if (layerOutputs[layerIdx]) {
          layerOutputs[layerIdx].magnitudes.push(outputMagnitude);
          layerOutputs[layerIdx].signs.push(outputSign);
        }
      });

      return layerOutputs;
    } catch (error) {
      console.error("Error reconstructing layer outputs:", error);
      return {};
    }
  };

  return {
    predictLayer,
    predictModelWithPTB,
    predictModelWithPTBOptimization,
    parseLayerComputedEvent,
    parseLayerPartialComputedEvents,
    reconstructLayerOutputs,
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
