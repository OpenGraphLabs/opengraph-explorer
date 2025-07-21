"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelInference = void 0;
var client_1 = require("@mysten/sui.js/client");
var transactions_1 = require("@mysten/sui.js/transactions");
var ed25519_1 = require("@mysten/sui.js/keypairs/ed25519");
var bcs_1 = require("@mysten/bcs");
// Network and contract configuration
var SUI_NETWORK = {
    TYPE: "testnet",
    URL: "https://fullnode.testnet.sui.io",
};
var SUI_CONTRACT = {
    PACKAGE_ID: "0xf5c229df211883b8f067e73d8d2ac1b1c3a74c2a2b174fb7b8e130ecf171d995",
    MODULE_NAME: "model",
};
var GAS_BUDGET = 3000000000; // 1 SUI
var ModelInference = /** @class */ (function () {
    function ModelInference(privateKey) {
        this.client = new client_1.SuiClient({ url: SUI_NETWORK.URL });
        if (privateKey) {
            //   this.signer = Ed25519Keypair.fromSecretKey(Buffer.from(privateKey, 'hex'));
            this.signer = ed25519_1.Ed25519Keypair.fromSecretKey((0, bcs_1.fromHEX)(privateKey));
            console.log("Signer address:", this.signer.toSuiAddress());
        }
        else {
            this.signer = new ed25519_1.Ed25519Keypair();
        }
    }
    /**
     * Parse layer partial computed events from transaction response
     */
    ModelInference.prototype.parseLayerPartialComputedEvents = function (events) {
        return events.filter(function (event) { var _a; return (_a = event.type) === null || _a === void 0 ? void 0 : _a.includes('LayerPartialComputed'); });
    };
    /**
     * Parse prediction completed event from transaction response
     */
    ModelInference.prototype.parsePredictionCompletedEvent = function (events) {
        return events.find(function (event) { var _a; return (_a = event.type) === null || _a === void 0 ? void 0 : _a.includes('PredictionCompleted'); });
    };
    /**
     * Perform model inference with PTB (Parallel Transaction Batching) optimization
     */
    ModelInference.prototype.predict = function (modelId, layerCount, layerDimensions, inputMagnitude, inputSign) {
        return __awaiter(this, void 0, void 0, function () {
            var tx, layerResultMagnitudes, layerResultSigns, dimIdx, _a, magnitude, sign, layerIdx, outputDimension, currentLayerResultMagnitudes, currentLayerResultSigns, dimIdx, _b, magnitude, sign, result, events, layerEvents, predictionEvent, error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (layerDimensions.length !== layerCount) {
                            throw new Error("Layer dimensions array length must match layer count");
                        }
                        console.log("Starting prediction with parameters:");
                        console.log("- Model ID:", modelId);
                        console.log("- Layer count:", layerCount);
                        console.log("- Layer dimensions:", layerDimensions);
                        console.log("- Input shape:", inputMagnitude.length);
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        tx = new transactions_1.TransactionBlock();
                        tx.setGasBudget(GAS_BUDGET);
                        layerResultMagnitudes = undefined;
                        layerResultSigns = undefined;
                        // Process first layer
                        console.log("Processing layer 0 with output dimension ".concat(layerDimensions[0]));
                        for (dimIdx = 0; dimIdx < layerDimensions[0]; dimIdx++) {
                            _a = tx.moveCall({
                                target: "".concat(SUI_CONTRACT.PACKAGE_ID, "::").concat(SUI_CONTRACT.MODULE_NAME, "::predict_layer_partial"),
                                arguments: [
                                    tx.object(modelId),
                                    tx.pure(0n),
                                    tx.pure(BigInt(dimIdx)),
                                    tx.pure(inputMagnitude.map(BigInt)),
                                    tx.pure(inputSign.map(BigInt)),
                                    layerResultMagnitudes || tx.pure([]),
                                    layerResultSigns || tx.pure([]),
                                ],
                            }), magnitude = _a[0], sign = _a[1];
                            layerResultMagnitudes = magnitude;
                            layerResultSigns = sign;
                        }
                        // Process remaining layers
                        for (layerIdx = 1; layerIdx < layerCount; layerIdx++) {
                            outputDimension = layerDimensions[layerIdx];
                            console.log("Processing layer ".concat(layerIdx, " with output dimension ").concat(outputDimension));
                            currentLayerResultMagnitudes = undefined;
                            currentLayerResultSigns = undefined;
                            for (dimIdx = 0; dimIdx < outputDimension; dimIdx++) {
                                _b = tx.moveCall({
                                    target: "".concat(SUI_CONTRACT.PACKAGE_ID, "::").concat(SUI_CONTRACT.MODULE_NAME, "::predict_layer_partial"),
                                    arguments: [
                                        tx.object(modelId),
                                        tx.pure(BigInt(layerIdx)),
                                        tx.pure(BigInt(dimIdx)),
                                        layerResultMagnitudes,
                                        layerResultSigns,
                                        currentLayerResultMagnitudes || tx.pure([]),
                                        currentLayerResultSigns || tx.pure([]),
                                    ],
                                }), magnitude = _b[0], sign = _b[1];
                                currentLayerResultMagnitudes = magnitude;
                                currentLayerResultSigns = sign;
                            }
                            layerResultMagnitudes = currentLayerResultMagnitudes;
                            layerResultSigns = currentLayerResultSigns;
                        }
                        return [4 /*yield*/, this.client.signAndExecuteTransactionBlock({
                                signer: this.signer,
                                transactionBlock: tx,
                                options: {
                                    showEvents: true,
                                },
                            })];
                    case 2:
                        result = _c.sent();
                        console.log("Transaction executed:", result.digest);
                        events = result.events || [];
                        layerEvents = this.parseLayerPartialComputedEvents(events);
                        predictionEvent = this.parsePredictionCompletedEvent(events);
                        console.log("Layer events:", layerEvents);
                        console.log("Prediction event:", predictionEvent);
                        if (!predictionEvent) {
                            throw new Error("No prediction completion event found");
                        }
                        return [2 /*return*/, {
                                magnitudes: predictionEvent.parsedJson.output_magnitude,
                                signs: predictionEvent.parsedJson.output_sign,
                                argmaxIdx: predictionEvent.parsedJson.argmax_idx,
                            }];
                    case 3:
                        error_1 = _c.sent();
                        console.error("Prediction error:", error_1);
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return ModelInference;
}());
exports.ModelInference = ModelInference;
// Example usage
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var privateKey, inference, modelId, layerCount, layerDimensions, inputMagnitude, inputSign, result, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    privateKey = "";
                    inference = new ModelInference(privateKey);
                    modelId = "0x42e9af4b10d27486cebeae450e9fdfd99d30f65147529253a1419d1fe99d670f";
                    layerCount = 4;
                    layerDimensions = [16, 8, 4, 2];
                    inputMagnitude = [
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
                    ];
                    inputSign = [
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
                        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0
                    ];
                    return [4 /*yield*/, inference.predict(modelId, layerCount, layerDimensions, inputMagnitude, inputSign)];
                case 1:
                    result = _a.sent();
                    console.log("Prediction result:");
                    console.log("- Magnitudes:", result.magnitudes);
                    console.log("- Signs:", result.signs);
                    console.log("- Predicted class:", result.argmaxIdx);
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    console.error("Error in main:", error_2);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}
