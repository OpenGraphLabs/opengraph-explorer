import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction, TransactionArgument } from "@mysten/sui/transactions";
import { SuiClient } from "@mysten/sui/client";
import {SUI_NETWORK, SUI_CONTRACT, GAS_BUDGET, SUI_MAX_PARAMS_PER_TX} from "../constants/suiConfig";
import {Model, validateModel} from "../types/model";

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

      console.log("CREATE MODEL!")
      // 1. create model
      const modelObject = tx.moveCall({
        target: `${SUI_CONTRACT.PACKAGE_ID}::${SUI_CONTRACT.MODULE_NAME}::create_model`,
        arguments: [
          // model metadata
          tx.pure.string(params.name),
          tx.pure.string(params.description),
          tx.pure.string(params.modelType),
          tx.pure.u64(BigInt(model.scale)),

          // dataset references
          tx.pure.option("address", params.trainingDatasetId),
          tx.pure.option("vector<address>", params.testDatasetIds),
        ],
      });

      // for now, only one graph is supported
      console.log("ADD GRAPH!")
      const numGraph = 1;
      for (let i = 0; i < numGraph; i++) {
        // 2. add graph
        tx.moveCall({
          target: `${SUI_CONTRACT.PACKAGE_ID}::${SUI_CONTRACT.MODULE_NAME}::add_graph`,
          arguments: [modelObject],
        });

        try {
          validateModel(model);
        } catch (e) {
          console.error("Model validation failed:", e);
          if (e instanceof Error) {
            throw new Error(e.message);
          } else {
            throw new Error(String(e));
          }
        }

        console.log("ADD LAYER!")
        for (let j = 0; j < model.layerDimensions.length; j++) {
          const layerDimensionPair = model.layerDimensions[j];

          // 3. add layers in multiple transactions, chunk by chunk

          // start layer
          tx.moveCall({
            target: `${SUI_CONTRACT.PACKAGE_ID}::${SUI_CONTRACT.MODULE_NAME}::start_layer`,
            arguments: [
              modelObject,
              tx.pure.string("dense"), // layer type

              // layer dimension data
              tx.pure.u64(BigInt(layerDimensionPair[0])),
              tx.pure.u64(BigInt(layerDimensionPair[1])),
            ],
          });

          // add weights in chunks
          const weightsMagnitudes = model.weightsMagnitudes[j];
          const weightsSigns = model.weightsSigns[j];
          const numTotalWeights = weightsMagnitudes.length;

          let weightStartIdx = 0;
          while (weightStartIdx < numTotalWeights) {
            const chunkSize = Math.min(SUI_MAX_PARAMS_PER_TX / 2, numTotalWeights - weightStartIdx);
            const weightMagChunk = weightsMagnitudes.slice(weightStartIdx, weightStartIdx + chunkSize);
            const weightSignChunk = weightsSigns.slice(weightStartIdx, weightStartIdx + chunkSize);

            console.log(`ADD WEIGHTS CHUNK (${weightStartIdx}:${weightStartIdx + chunkSize}/${numTotalWeights})`);
            tx.moveCall({
              target: `${SUI_CONTRACT.PACKAGE_ID}::${SUI_CONTRACT.MODULE_NAME}::add_weights_chunk`,
              arguments: [
                modelObject,
                tx.pure.u64(BigInt(weightStartIdx)), // weight start index
                tx.pure.vector("u64", weightMagChunk), // chunked weight magnitudes
                tx.pure.vector("u64", weightSignChunk), // chunked weight signs
                tx.pure.bool(weightStartIdx + chunkSize >= numTotalWeights), // isLastChunk
              ],
            });

            weightStartIdx += chunkSize;
          }

          // add biases in chunks
          const biasesMagnitudes = model.biasesMagnitudes[j];
          const biasesSigns = model.biasesSigns[j];
          const numTotalBiases = biasesMagnitudes.length;

          let biasStartIdx = 0;
          while (biasStartIdx < numTotalBiases) {
            const chunkSize = Math.min(SUI_MAX_PARAMS_PER_TX / 2, numTotalBiases - biasStartIdx);
            const biasMagChunk = biasesMagnitudes.slice(biasStartIdx, biasStartIdx + chunkSize);
            const biasSignChunk = biasesSigns.slice(biasStartIdx, biasStartIdx + chunkSize);

            console.log(`ADD BIASES CHUNK (${biasStartIdx}:${biasStartIdx + chunkSize}/${numTotalBiases})`);
            tx.moveCall({
              target: `${SUI_CONTRACT.PACKAGE_ID}::${SUI_CONTRACT.MODULE_NAME}::add_biases_chunk`,
              arguments: [
                modelObject,
                tx.pure.u64(BigInt(biasStartIdx)), // bias start index
                tx.pure.vector("u64", biasMagChunk), // chunked bias magnitudes
                tx.pure.vector("u64", biasSignChunk), // chunked bias signs
                tx.pure.bool(biasStartIdx + chunkSize >= numTotalBiases), // isLastChunk
              ],
            });

            biasStartIdx += chunkSize;
          }

          // complete layer
          console.log(`COMPLETE LAYER ${j}`);
          tx.moveCall({
            target: `${SUI_CONTRACT.PACKAGE_ID}::${SUI_CONTRACT.MODULE_NAME}::complete_layer`,
            arguments: [
              modelObject,
              tx.pure.bool(j >= model.layerDimensions.length - 1), // isFinalLayer
            ],
          });
        }

        console.log("COMPLETE MODEL!")
        // 4. complete model
        tx.moveCall({
          target: `${SUI_CONTRACT.PACKAGE_ID}::${SUI_CONTRACT.MODULE_NAME}::complete_model`,
          arguments: [modelObject],
        });
      }

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
              currentLayerResultMagnitudes ? currentLayerResultMagnitudes : tx.pure.vector("u64", []),
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
    predictModelWithPTBOptimization,
    parseLayerComputedEvent,
    parseLayerPartialComputedEvents,
    reconstructLayerOutputs,
    parsePredictionCompletedEvent,
  };
}
