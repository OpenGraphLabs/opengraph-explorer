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
const MODEL_ID = "0x872dc36048bedd901a56356d269c993e1b34afbb4fbd857412f79d0f9ea02657";
const LAYER_COUNT = 3;
const LAYER_DIMENSIONS = [32, 16, 10]; // Example dimensions

const GAS_BUDGET = 3_000_000_000; // 1 SUI

interface PredictionResult {
  magnitudes: number[];
  signs: number[];
  argmaxIdx?: number;
}

interface MnistSample {
  index: number;
  input: number[];
  label: number;
  offchain_predicted_label: number | null;
  onchain_predicted_label: number | null;
  selected: boolean;
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

    // Read MNIST test data
    const testDataPath = path.join(__dirname, '../../scripts/mnist_test_data.json');
    const testData: MnistSample[] = JSON.parse(fs.readFileSync(testDataPath, 'utf-8'));

    // Process first 10 samples
    const samplesToProcess = testData.slice(0, 10);
    let correctCount = 0;

    // Process each sample
    for (const sample of samplesToProcess) {
      console.log(`\nProcessing sample ${sample.index} (true label: ${sample.label})`);

      // Convert input values to magnitude
      const inputMagnitude = sample.input.map(v => {
        const strValue = v.toString();
        // Remove decimal point and convert to integer
        // e.g., "0.55882353" -> 55882353
        return parseInt(strValue.replace("0.", "").padEnd(8, "0"));
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

      const predictedClass = Number(result.argmaxIdx);
      
      // Update onchain_predicted_label in the original data
      const sampleIndex = testData.findIndex(s => s.index === sample.index);
      if (sampleIndex !== -1) {
        testData[sampleIndex].onchain_predicted_label = predictedClass;
      }

      console.log("Prediction result:");
      console.log("- Predicted class:", predictedClass);
      console.log("- True label:", sample.label);
      
      const isCorrect = predictedClass === sample.label;
      console.log("- Correct?:", isCorrect);
      
      if (isCorrect) {
        correctCount++;
      }
    }

    // Print final accuracy statistics for processed samples
    console.log("\n=== Final Results ===");
    console.log(`Correct predictions: ${correctCount}/${samplesToProcess.length}`);
    console.log(`Accuracy: ${((correctCount / samplesToProcess.length) * 100).toFixed(2)}%`);

    // Save updated data back to JSON file
    fs.writeFileSync(testDataPath, JSON.stringify(testData, null, 2));
    console.log(`\nUpdated results saved to: ${testDataPath}`);

  } catch (error) {
    console.error("Error in main:", error);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { ModelInference, PredictionResult }; 