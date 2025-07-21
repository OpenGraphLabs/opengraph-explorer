import { SuiClient, SuiTransactionBlockResponse } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { fromHEX } from '@mysten/bcs';
import contractConfig from '../../config/contract.json';
import * as fs from 'fs';
import * as path from 'path';

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
const MODEL_ID = "0xeb1e66e14c92cb1e1bca8f1fb016c959bbaaef284b3643a1c65ab02e5abe36fd";
const LAYER_COUNT = 3;
const LAYER_DIMENSIONS = [32, 16, 10]; // Example dimensions

const GAS_BUDGET = 3_000_000_000; // 1 SUI

interface PredictionResult {
  magnitudes: number[];
  signs: number[];
  argmaxIdx?: number;
}

interface TestSample {
  index: number;
  input_values: string[];
  true_label: number;
  visualization: string[];
}

interface TestSamples {
  test_samples: TestSample[];
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

      // console.log("Layer events:", layerEvents);
      // console.log("Prediction event:", predictionEvent);

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

    // Read test samples
    const testSamplesPath = path.join(__dirname, '../data/mnist_14_14/test_samples/test_samples.json');
    const testSamplesData = fs.readFileSync(testSamplesPath, 'utf-8');
    const testSamples: TestSamples = JSON.parse(testSamplesData);

    let correctCount = 0;
    const totalCount = testSamples.test_samples.length;

    // Process each test sample
    for (const sample of testSamples.test_samples) {
      // console.log(`\nProcessing sample ${sample.index} (true label: ${sample.true_label})`);
      // console.log("Visualization:");
      // console.log(sample.visualization.join('\n'));

      // Convert input values to magnitude by removing decimal point
      const inputMagnitude = sample.input_values.map(v => {
        // Remove decimal point and convert to integer
        // e.g., "0.55882353" -> 55882353
        return parseInt(v.replace("0.", "").padEnd(8, "0"));
      });
      const inputSign = new Array(inputMagnitude.length).fill(0); // All positive

      // Run prediction
      const result = await inference.predict(
        MODEL_ID,
        LAYER_COUNT,
        LAYER_DIMENSIONS,
        inputMagnitude,
        inputSign
      );

      console.log("\nPrediction result:");
      // console.log("- Magnitudes:", result.magnitudes);
      // console.log("- Signs:", result.signs);
      console.log("- Predicted class:", result.argmaxIdx);
      console.log("- True label:", sample.true_label);
      console.log("- Types:", {
        predicted: typeof result.argmaxIdx,
        true_label: typeof sample.true_label,
        predicted_value: result.argmaxIdx,
        true_label_value: sample.true_label
      });
      const isCorrect = Number(result.argmaxIdx) === sample.true_label;
      console.log("- Correct?:", isCorrect);
      
      if (isCorrect) {
        correctCount++;
      }
    }

    // Print final accuracy statistics
    console.log("\n=== Final Results ===");
    console.log(`Correct predictions: ${correctCount}/${totalCount}`);
    console.log(`Accuracy: ${((correctCount / totalCount) * 100).toFixed(2)}%`);

  } catch (error) {
    console.error("Error in main:", error);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { ModelInference, PredictionResult }; 