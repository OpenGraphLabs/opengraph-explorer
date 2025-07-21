import { SuiClient, SuiTransactionBlockResponse } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { fromHEX } from '@mysten/bcs';
import contractConfig from '../../config/contract.json';

// Network and contract configuration
const SUI_NETWORK = {
  TYPE: contractConfig.network,
  URL: `https://fullnode.${contractConfig.network}.sui.io`,
};

const SUI_CONTRACT = {
  PACKAGE_ID: contractConfig.contract.package_id,
  MODULE_NAME: contractConfig.contract.module_name,
};

// Model parameters
const MODEL_ID = "0x625124372982e2c2fb5da4c59b3938e02c38f83de2568fa6d1d7210334de8f2a";
const LAYER_COUNT = 3;
const LAYER_DIMENSIONS = [192, 32, 16, 10]; // Example dimensions

const GAS_BUDGET = 3_000_000_000; // 1 SUI

interface PredictionResult {
  magnitudes: number[];
  signs: number[];
  argmaxIdx?: number;
}

class ModelInference {
  private client: SuiClient;
  private signer: Ed25519Keypair;

  constructor(privateKey?: string) {
    this.client = new SuiClient({ url: SUI_NETWORK.URL });
    if (privateKey) {
      this.signer = Ed25519Keypair.fromSecretKey(fromHEX(privateKey));
      console.log("Signer address:", this.signer.toSuiAddress());
    } else {
      this.signer = new Ed25519Keypair();
    }
  }

  /**
   * Parse layer partial computed events from transaction response
   */
  private parseLayerPartialComputedEvents(events: any[]): any[] {
    return events.filter((event: any) => 
      event.type?.includes('LayerPartialComputed')
    );
  }

  /**
   * Parse prediction completed event from transaction response
   */
  private parsePredictionCompletedEvent(events: any[]): any {
    return events.find((event: any) => 
      event.type?.includes('PredictionCompleted')
    );
  }

  /**
   * Perform model inference with PTB (Parallel Transaction Batching) optimization
   */
  async predict(
    modelId: string,
    layerCount: number,
    layerDimensions: number[],
    inputMagnitude: number[],
    inputSign: number[],
  ): Promise<PredictionResult> {
    if (layerDimensions.length !== layerCount) {
      throw new Error("Layer dimensions array length must match layer count");
    }

    console.log("Starting prediction with parameters:");
    console.log("- Model ID:", modelId);
    console.log("- Layer count:", layerCount);
    console.log("- Layer dimensions:", layerDimensions);
    console.log("- Input shape:", inputMagnitude.length);

    try {
      const tx = new TransactionBlock();
      tx.setGasBudget(GAS_BUDGET);

      let layerResultMagnitudes: any = undefined;
      let layerResultSigns: any = undefined;

      // Process first layer
      console.log(`Processing layer 0 with output dimension ${layerDimensions[0]}`);
      for (let dimIdx = 0; dimIdx < layerDimensions[0]; dimIdx++) {
        const [magnitude, sign] = tx.moveCall({
          target: `${SUI_CONTRACT.PACKAGE_ID}::${SUI_CONTRACT.MODULE_NAME}::predict_layer_partial`,
          arguments: [
            tx.object(modelId),
            tx.pure(0n),
            tx.pure(BigInt(dimIdx)),
            tx.pure(inputMagnitude.map(BigInt)),
            tx.pure(inputSign.map(BigInt)),
            layerResultMagnitudes || tx.pure([]),
            layerResultSigns || tx.pure([]),
          ],
        });

        layerResultMagnitudes = magnitude;
        layerResultSigns = sign;
      }

      // Process remaining layers
      for (let layerIdx = 1; layerIdx < layerCount; layerIdx++) {
        const outputDimension = layerDimensions[layerIdx];
        console.log(`Processing layer ${layerIdx} with output dimension ${outputDimension}`);

        let currentLayerResultMagnitudes: any = undefined;
        let currentLayerResultSigns: any = undefined;

        for (let dimIdx = 0; dimIdx < outputDimension; dimIdx++) {
          const [magnitude, sign] = tx.moveCall({
            target: `${SUI_CONTRACT.PACKAGE_ID}::${SUI_CONTRACT.MODULE_NAME}::predict_layer_partial`,
            arguments: [
              tx.object(modelId),
              tx.pure(BigInt(layerIdx)),
              tx.pure(BigInt(dimIdx)),
              layerResultMagnitudes,
              layerResultSigns,
              currentLayerResultMagnitudes || tx.pure([]),
              currentLayerResultSigns || tx.pure([]),
            ],
          });

          currentLayerResultMagnitudes = magnitude;
          currentLayerResultSigns = sign;
        }

        layerResultMagnitudes = currentLayerResultMagnitudes;
        layerResultSigns = currentLayerResultSigns;
      }

      // Execute transaction
      const result = await this.client.signAndExecuteTransactionBlock({
        signer: this.signer,
        transactionBlock: tx,
        options: {
          showEvents: true,
        },
      });

      console.log("Transaction executed:", result.digest);

      // Parse events
      const events = result.events || [];
      const layerEvents = this.parseLayerPartialComputedEvents(events);
      const predictionEvent = this.parsePredictionCompletedEvent(events);

      console.log("Layer events:", layerEvents);
      console.log("Prediction event:", predictionEvent);

      if (!predictionEvent) {
        throw new Error("No prediction completion event found");
      }

      return {
        magnitudes: predictionEvent.parsedJson.output_magnitude,
        signs: predictionEvent.parsedJson.output_sign,
        argmaxIdx: predictionEvent.parsedJson.argmax_idx,
      };

    } catch (error) {
      console.error("Prediction error:", error);
      throw error;
    }
  }
}

// Example usage
async function main() {
  try {
    // Initialize inference with private key from config
    const privateKey = contractConfig.account.private_key;
    const inference = new ModelInference(privateKey);

    // Example input (normalized between 0 and 1)
    // const inputSize = 784; // For MNIST
    // const inputValues = new Array(inputSize).fill(0.5);
    // const inputMagnitude = inputValues.map(v => Math.floor(v * 1000000)); // Scale to 6 decimal places
    // const inputSign = inputValues.map(() => 0); // All positive

    const inputMagnitude = [
        69, 69, 69, 69, 70, 70, 70, 70, 70, 70,
        69, 69, 69, 69, 70, 70, 70, 70, 70, 70,
        69, 69, 69, 69, 70, 70, 70, 70, 70, 70,
        69, 69, 69, 69, 70, 70, 70, 70, 70, 70,
        69, 69, 69, 69, 70, 70, 70, 70, 70, 70,
        69, 69, 69, 69, 70, 70, 70, 70, 70, 70,
        69, 69, 69, 69, 70, 70, 70, 70, 70, 70,
        69, 69, 69, 69, 70, 70, 70, 70, 70, 70,
        69, 69, 69, 69, 70, 70, 70, 70, 70, 70,
        69, 69, 69, 69, 70, 70, 70, 70, 70, 70,
        69, 69, 69, 69, 70, 70, 70, 70, 70, 70,
        69, 69, 69, 69, 70, 70, 70, 70, 70, 70,
        69, 69, 69, 69, 70, 70, 70, 70, 70, 70,
        69, 69, 69, 69, 70, 70, 70, 70, 70, 70,
        69, 69, 69, 69, 70, 70, 70, 70, 70, 70,
        69, 69, 69, 69, 70, 70, 70, 70, 70, 70,
        69, 69, 69, 69, 70, 70, 70, 70, 70, 70,
        69, 69, 69, 69, 70, 70, 70, 70, 70, 70,
        69, 69, 69, 69, 70, 70, 70, 70, 70, 70,
        69, 69, 69, 69, 70, 70
    ]
    const inputSign = [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0
    ]

    // Run prediction
    const result = await inference.predict(
      MODEL_ID,
      LAYER_COUNT,
      LAYER_DIMENSIONS,
      inputMagnitude,
      inputSign
    );

    console.log("Prediction result:");
    console.log("- Magnitudes:", result.magnitudes);
    console.log("- Signs:", result.signs);
    console.log("- Predicted class:", result.argmaxIdx);

  } catch (error) {
    console.error("Error in main:", error);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { ModelInference, PredictionResult }; 