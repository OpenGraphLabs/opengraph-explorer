import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Flex,
  Heading,
  Text,
  Card,
  Tabs,
  Button,
  TextArea,
  Code,
  Avatar,
  Table,
  Badge,
  TextField,
  Grid,
} from "@radix-ui/themes";
import {
  HeartIcon,
  DownloadIcon,
  Share1Icon,
  GitHubLogoIcon,
  InfoCircledIcon,
  Cross2Icon,
  ReloadIcon,
  ArrowRightIcon,
} from "@radix-ui/react-icons";
import { useModelById } from "../hooks/useModels";
import { useModelInference } from "../services/modelSuiService";

export function ModelDetail() {
  const { id } = useParams<{ id: string }>();
  const { model, loading, error } = useModelById(id || "");
  const [activeTab, setActiveTab] = useState("overview");
  const [promptText, setPromptText] = useState("");
  const [inferenceResult, setInferenceResult] = useState("");
  const [isInferenceLoading, setIsInferenceLoading] = useState(false);
  
  // 추론 관련 상태 추가
  const [inputVector, setInputVector] = useState<string>("");
  const [inputValues, setInputValues] = useState<number[]>([]);
  const [inputSigns, setInputSigns] = useState<number[]>([]);
  const [currentLayerIndex, setCurrentLayerIndex] = useState<number>(0);
  const [predictResults, setPredictResults] = useState<Array<{
    layerIdx: number;
    inputMagnitude: number[];
    inputSign: number[];
    outputMagnitude: number[];
    outputSign: number[];
    activationType: number;
    argmaxIdx?: number;
  }>>([]);
  const [inferenceStatus, setInferenceStatus] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [txDigest, setTxDigest] = useState<string>("");
  
  // 추론 훅 가져오기
  const { predictLayer, getTransactionEvents, parseLayerComputedEvent, parsePredictionCompletedEvent } = useModelInference();

  // 데이터 로딩 중이면 로딩 상태 표시
  if (loading) {
    return (
      <Flex direction="column" align="center" gap="3" py="8">
        <Text>모델 데이터를 불러오는 중입니다...</Text>
      </Flex>
    );
  }

  // 오류가 발생했거나 모델이 없는 경우
  if (error || !model) {
    return (
      <Flex direction="column" align="center" gap="3" py="8">
        <Text>{error || "모델을 찾을 수 없습니다."}</Text>
      </Flex>
    );
  }

  // 입력 벡터 파싱
  const parseInputVector = () => {
    try {
      let values = inputVector.split(",").map(val => val.trim()).filter(val => val !== "");
      
      if (values.length === 0) {
        throw new Error("입력 벡터가 비어 있습니다.");
      }
      
      // 숫자로 변환하고 부호와 크기로 분리
      const magnitudes: number[] = [];
      const signs: number[] = [];
      
      values.forEach(val => {
        const num = parseFloat(val);
        if (isNaN(num)) {
          throw new Error(`유효하지 않은 숫자: ${val}`);
        }
        
        // 부호 결정 (1=양수, 0=음수)
        const sign = num >= 0 ? 1 : 0;
        // 크기 (절대값)
        const magnitude = Math.abs(num);
        
        magnitudes.push(magnitude);
        signs.push(sign);
      });
      
      setInputValues(magnitudes);
      setInputSigns(signs);
      return { magnitudes, signs };
    } catch (error) {
      console.error("입력 벡터 파싱 오류:", error);
      setInferenceStatus(`오류: ${error instanceof Error ? error.message : "입력 벡터 형식이 잘못되었습니다."}`);
      return null;
    }
  };

  // 레이어 예측 실행
  const runLayerPrediction = async (layerIdx: number, inputMagnitude: number[], inputSign: number[]) => {
    if (!id) return;
    
    setIsProcessing(true);
    setInferenceStatus(`레이어 ${layerIdx} 예측 중...`);
    
    try {
      // 레이어 예측 트랜잭션 호출
      const result = await predictLayer(id, layerIdx, inputMagnitude, inputSign, (res) => {
        console.log(`Layer ${layerIdx} prediction result:`, res);
        if (res && res.digest) {
          setTxDigest(res.digest);
          processTransactionResult(res.digest, layerIdx, inputMagnitude, inputSign);
        }
      });
    } catch (error) {
      console.error(`레이어 ${layerIdx} 예측 오류:`, error);
      setInferenceStatus(`오류: ${error instanceof Error ? error.message : "예측 실행 중 오류가 발생했습니다."}`);
      setIsProcessing(false);
    }
  };
  
  // 트랜잭션 결과 처리
  const processTransactionResult = async (digest: string, layerIdx: number, inputMagnitude: number[], inputSign: number[]) => {
    try {
      // 1초 대기하여 트랜잭션이 완료될 시간을 줌
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 트랜잭션 이벤트 조회
      const events = await getTransactionEvents(digest);
      console.log("Transaction events:", events);
      
      // LayerComputed 이벤트 파싱
      const layerResult = parseLayerComputedEvent(events);
      console.log("Layer result:", layerResult);
      
      // PredictionCompleted 이벤트 파싱 (마지막 레이어인 경우)
      const predictionResult = parsePredictionCompletedEvent(events);
      console.log("Prediction result:", predictionResult);
      
      if (layerResult) {
        // 결과를 저장
        const newResult = {
          layerIdx,
          inputMagnitude,
          inputSign,
          outputMagnitude: layerResult.outputMagnitude,
          outputSign: layerResult.outputSign,
          activationType: layerResult.activationType,
          argmaxIdx: predictionResult?.argmaxIdx,
        };
        
        setPredictResults(prev => [...prev, newResult]);
        
        // 다음 레이어 인덱스 설정
        setCurrentLayerIndex(layerIdx + 1);
        
        // 이벤트가 검색되었는지 여부에 따라 상태 업데이트
        if (predictionResult) {
          // 마지막 레이어 (예측 완료)
          setInferenceStatus(`예측 완료! 결과 인덱스: ${predictionResult.argmaxIdx}`);
          setIsProcessing(false);
        } else {
          // 다음 레이어 준비
          setInferenceStatus(`레이어 ${layerIdx} 예측 완료. 다음 레이어 준비 중...`);
          setIsProcessing(false);
          
          // 자동으로 다음 레이어 실행 (마지막 레이어가 아닌 경우)
          const totalLayers = getLayerCount();
          if (layerIdx + 1 < totalLayers) {
            // 0.5초 후 다음 레이어 실행
            setTimeout(() => {
              runLayerPrediction(
                layerIdx + 1,
                layerResult.outputMagnitude,
                layerResult.outputSign
              );
            }, 500);
          }
        }
      } else {
        setInferenceStatus(`레이어 ${layerIdx} 예측 완료했지만 이벤트를 찾을 수 없습니다.`);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("트랜잭션 결과 처리 오류:", error);
      setInferenceStatus(`오류: ${error instanceof Error ? error.message : "트랜잭션 결과 처리 중 오류가 발생했습니다."}`);
      setIsProcessing(false);
    }
  };
  
  // 레이어 추론 시작
  const startInference = async () => {
    // 입력 벡터 파싱
    const parsedInput = parseInputVector();
    if (!parsedInput) return;
    
    // 기존 결과 초기화
    setPredictResults([]);
    setCurrentLayerIndex(0);
    setTxDigest("");
    
    // 첫 번째 레이어 예측 실행
    await runLayerPrediction(0, parsedInput.magnitudes, parsedInput.signs);
  };
  
  // 다음 레이어 추론 (수동)
  const predictNextLayer = async () => {
    if (predictResults.length === 0) {
      setInferenceStatus("먼저 첫 번째 레이어를 예측해야 합니다.");
      return;
    }
    
    // 마지막 예측 결과 가져오기
    const lastResult = predictResults[predictResults.length - 1];
    
    // 다음 레이어 예측 실행 (이전 레이어의 출력을 입력으로 사용)
    await runLayerPrediction(
      currentLayerIndex,
      lastResult.outputMagnitude,
      lastResult.outputSign
    );
  };
  
  // 레이어 수 가져오기
  const getLayerCount = () => {
    if (!model.graphs || model.graphs.length === 0) return 0;
    return model.graphs[0].layers.length;
  };

  // Run inference function
  const runInference = async () => {
    if (!promptText.trim()) return;

    setIsInferenceLoading(true);

    // In a real implementation, this would communicate with the Sui blockchain for on-chain inference
    // This is just a simulation
    setTimeout(() => {
      let result = "";

      if (model.task_type === "text-generation") {
        result = `${promptText}\n\nThis is a text response generated by the ${model.name} model. In a real implementation, inference would be executed on the Sui blockchain.`;
      } else if (model.task_type === "translation") {
        result = `Translation result: This is text translated by the ${model.name} model.`;
      } else {
        result = `Inference result from ${model.name} model. Task: ${model.task_type}`;
      }

      setInferenceResult(result);
      setIsInferenceLoading(false);
    }, 1500);
  };

  // 활성화 함수 이름 가져오기
  const getActivationTypeName = (type: number): string => {
    const activationTypes: Record<number, string> = {
      0: "None",
      1: "ReLU",
      2: "Sigmoid",
      3: "Tanh",
      4: "Softmax",
      5: "LeakyReLU",
    };
    return activationTypes[type] || `Unknown (${type})`;
  };

  return (
    <Box>
      {/* Model Header */}
      <Flex direction="column" gap="4" mb="6">
        <Flex justify="between" align="start">
          <Box>
            <Heading size="8" style={{ fontWeight: 700 }}>
              {model.name}
            </Heading>
            <Flex align="center" gap="2" mt="1">
              <Avatar size="2" fallback={model.creator[0]} style={{ background: "#FF5733" }} />
              <Text size="2">{model.creator}</Text>
            </Flex>
          </Box>

          <Flex gap="2">
            <Button variant="soft" style={{ borderRadius: "8px" }}>
              <HeartIcon style={{ color: "#F06292" }} />
              <Text>{model.likes}</Text>
            </Button>
            <Button variant="soft" style={{ borderRadius: "8px" }}>
              <DownloadIcon style={{ color: "#4CAF50" }} />
              <Text>{model.downloads}</Text>
            </Button>
            <Button variant="soft" style={{ borderRadius: "8px" }}>
              <Share1Icon style={{ color: "#2196F3" }} />
            </Button>
          </Flex>
        </Flex>

        <Text style={{ fontSize: "16px", lineHeight: "1.6" }}>{model.description}</Text>

        <Flex gap="3">
          <Card style={{ borderRadius: "8px", background: "#F5F5F5", border: "none" }}>
            <Flex align="center" gap="2">
              <InfoCircledIcon style={{ color: "#FF5733" }} />
              <Text size="2" style={{ fontWeight: 500 }}>
                Task: {getTaskName(model.task_type)}
              </Text>
            </Flex>
          </Card>
          <Card style={{ borderRadius: "8px", background: "#F5F5F5", border: "none" }}>
            <Flex align="center" gap="2">
              <GitHubLogoIcon style={{ color: "#333333" }} />
              <Text size="2" style={{ fontWeight: 500 }}>
                License: MIT
              </Text>
            </Flex>
          </Card>
        </Flex>
      </Flex>

      {/* Tab Navigation */}
      <Tabs.Root
        value={activeTab}
        onValueChange={setActiveTab}
        style={{
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
        }}
      >
        <Tabs.List
          style={{
            background: "var(--gray-2)",
            padding: "8px",
            borderBottom: "1px solid var(--gray-4)",
          }}
        >
          <Tabs.Trigger value="overview" style={{ fontWeight: 600 }}>
            Overview
          </Tabs.Trigger>
          <Tabs.Trigger value="inference" style={{ fontWeight: 600 }}>
            Inference
          </Tabs.Trigger>
          <Tabs.Trigger value="files" style={{ fontWeight: 600 }}>
            Files
          </Tabs.Trigger>
          <Tabs.Trigger value="model-data" style={{ fontWeight: 600 }}>
            Model Data
          </Tabs.Trigger>
        </Tabs.List>

        <Box py="4" px="3" style={{ background: "white" }}>
          {/* Overview Tab */}
          <Tabs.Content value="overview">
            <Card style={{ border: "none", boxShadow: "none" }}>
              <Flex direction="column" gap="4">
                <Heading size="4" style={{ color: "#FF5733", fontWeight: 700 }}>
                  Model Information
                </Heading>
                <Text style={{ lineHeight: "1.6" }}>
                  {model.name} is a {getTaskName(model.task_type)} model developed by{" "}
                  {model.creator}. This model is stored on the Sui blockchain and can run inference
                  in a fully on-chain environment.
                </Text>

                <Heading size="4" style={{ color: "#FF5733", fontWeight: 700 }}>
                  Usage
                </Heading>
                <Text style={{ lineHeight: "1.6" }}>
                  You can try this model directly in the Inference tab. You can also access it
                  programmatically through Sui smart contracts.
                </Text>

                <Heading size="4" style={{ color: "#FF5733", fontWeight: 700 }}>
                  Model Architecture
                </Heading>
                <Text style={{ lineHeight: "1.6" }}>{getModelArchitecture(model.task_type)}</Text>

                <Heading size="4" style={{ color: "#FF5733", fontWeight: 700 }}>
                  On-chain Information
                </Heading>
                <Flex
                  direction="column"
                  gap="2"
                  style={{ background: "#F5F5F5", padding: "16px", borderRadius: "8px" }}
                >
                  <Text size="2" style={{ fontFamily: "monospace" }}>
                    Object ID: {model.id}
                  </Text>
                  <Text size="2">Created: {new Date(model.createdAt).toLocaleDateString()}</Text>
                  <Text size="2">Size: {Math.floor(Math.random() * 500) + 100}MB</Text>
                </Flex>
              </Flex>
            </Card>
          </Tabs.Content>

          {/* Inference Tab */}
          <Tabs.Content value="inference">
            <Card style={{ border: "none", boxShadow: "none" }}>
              <Flex direction="column" gap="4">
                <Heading size="4" style={{ color: "#FF5733", fontWeight: 700 }}>
                  On-chain Inference
                </Heading>
                <Text style={{ lineHeight: "1.6" }}>
                  이 모델의 추론은 Sui 블록체인 위에서 직접 실행됩니다. 레이어별로 추론 결과를 확인하세요.
                </Text>

                <Card style={{ padding: "16px", borderRadius: "8px", marginBottom: "16px" }}>
                  <Flex gap="2" align="center" mb="3">
                    <InfoCircledIcon style={{ color: "#2196F3" }} />
                    <Text size="2" style={{ fontWeight: 500 }}>
                      입력 벡터를 제공하면 모델의 각 레이어를 순차적으로 통과하며 추론 결과를 실시간으로 확인할 수 있습니다.
                      각 레이어의 출력이 다음 레이어의 입력으로 자동 연결됩니다.
                    </Text>
                  </Flex>
                </Card>

                <Box style={{ background: "#F5F5F5", padding: "16px", borderRadius: "8px" }}>
                  <Heading size="3" mb="2">
                    모델 벡터 입력
                  </Heading>
                  <Text size="2" mb="2">
                    입력 벡터 값을 쉼표로 구분하여 입력하세요:
                  </Text>
                  <TextArea
                    placeholder="예: 1.0, 2.5, -3.0, 4.2, -1.5"
                    value={inputVector}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInputVector(e.target.value)}
                    style={{
                      minHeight: "80px",
                      borderRadius: "8px",
                      border: "1px solid var(--gray-5)",
                      padding: "12px",
                      fontSize: "14px",
                      fontFamily: "monospace",
                    }}
                  />
                </Box>
                
                <Flex justify="between" align="center" mt="3" mb="3">
                  <Flex align="center" gap="2">
                    <Text size="2" style={{ fontWeight: 600 }}>
                      모델 구조: {getLayerCount()}개 레이어
                    </Text>
                  </Flex>
                  <Flex align="center" gap="2">
                    <Text size="2" style={{ fontWeight: 600 }}>
                      현재 레이어: {currentLayerIndex}/{getLayerCount()}
                    </Text>
                  </Flex>
                </Flex>

                <Flex gap="2">
                  <Button
                    onClick={startInference}
                    disabled={isProcessing || !inputVector.trim()}
                    style={{
                      background: "#FF5733",
                      color: "white",
                      borderRadius: "8px",
                      opacity: isProcessing || !inputVector.trim() ? 0.6 : 1,
                    }}
                  >
                    {isProcessing ? (
                      <Flex align="center" gap="2">
                        <ReloadIcon style={{ animation: "spin 1s linear infinite" }} />
                        <span>처리 중...</span>
                      </Flex>
                    ) : (
                      <span>추론 시작</span>
                    )}
                  </Button>
                  
                  <Button
                    onClick={predictNextLayer}
                    disabled={isProcessing || predictResults.length === 0 || currentLayerIndex >= getLayerCount()}
                    style={{
                      background: "#2196F3",
                      color: "white",
                      borderRadius: "8px",
                      opacity: isProcessing || predictResults.length === 0 || currentLayerIndex >= getLayerCount() ? 0.6 : 1,
                    }}
                  >
                    {isProcessing ? (
                      <Flex align="center" gap="2">
                        <ReloadIcon style={{ animation: "spin 1s linear infinite" }} />
                        <span>처리 중...</span>
                      </Flex>
                    ) : (
                      <Flex align="center" gap="2">
                        <span>수동으로 다음 레이어</span>
                        <ArrowRightIcon />
                      </Flex>
                    )}
                  </Button>
                </Flex>

                {inferenceStatus && (
                  <Card
                    style={{
                      padding: "12px 16px",
                      borderRadius: "8px",
                      background: isProcessing ? "#E3F2FD" : inferenceStatus.includes("오류") ? "#FFEBEE" : "#E8F5E9",
                      border: "none",
                    }}
                  >
                    <Text size="2">
                      {inferenceStatus}
                    </Text>
                    {txDigest && (
                      <Text size="1" style={{ marginTop: "4px", fontFamily: "monospace" }}>
                        트랜잭션: {txDigest.substring(0, 10)}...
                      </Text>
                    )}
                  </Card>
                )}

                {predictResults.length > 0 && (
                  <Box style={{ marginTop: "16px" }}>
                    <Heading size="3" mb="2">
                      레이어별 추론 결과
                    </Heading>
                    
                    <Grid columns="2" gap="3" mb="4">
                      <Box>
                        <Text size="2" mb="1" style={{ fontWeight: 600 }}>
                          현재 진행 상황: {currentLayerIndex} / {getLayerCount()} 레이어
                        </Text>
                        <div
                          style={{
                            width: "100%",
                            height: "8px",
                            backgroundColor: "#E0E0E0",
                            borderRadius: "4px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${(currentLayerIndex / Math.max(1, getLayerCount())) * 100}%`,
                              height: "100%",
                              backgroundColor: "#FF5733",
                              transition: "width 0.3s ease-in-out",
                            }}
                          />
                        </div>
                      </Box>
                      
                      <Card style={{ padding: "10px", background: "#F5F5F5" }}>
                        <Flex align="center" justify="between">
                          <Text size="2" style={{ fontWeight: 600 }}>
                            총 레이어 수: {getLayerCount()}
                          </Text>
                          <Text size="2" style={{ fontWeight: 600 }}>
                            예측 결과 수: {predictResults.length}
                          </Text>
                        </Flex>
                      </Card>
                    </Grid>
                    
                    <Table.Root>
                      <Table.Header>
                        <Table.Row>
                          <Table.ColumnHeaderCell>레이어</Table.ColumnHeaderCell>
                          <Table.ColumnHeaderCell>활성화 함수</Table.ColumnHeaderCell>
                          <Table.ColumnHeaderCell>입력 벡터</Table.ColumnHeaderCell>
                          <Table.ColumnHeaderCell>출력 벡터</Table.ColumnHeaderCell>
                          <Table.ColumnHeaderCell>상태</Table.ColumnHeaderCell>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {predictResults.map((result, index) => (
                          <Table.Row key={index}>
                            <Table.Cell>
                              <Badge color="orange" mr="1">{result.layerIdx + 1}</Badge>
                            </Table.Cell>
                            <Table.Cell>
                              {getActivationTypeName(result.activationType)}
                            </Table.Cell>
                            <Table.Cell>
                              <Box style={{ maxWidth: "200px", overflow: "hidden" }}>
                                <Flex direction="column" gap="1">
                                  <Text size="1" style={{ color: "var(--gray-9)" }}>
                                    크기: {result.inputMagnitude.length}
                                  </Text>
                                  <Code
                                    style={{
                                      maxHeight: "60px",
                                      overflow: "auto",
                                      fontSize: "11px",
                                      padding: "4px",
                                      backgroundColor: "var(--gray-a2)",
                                    }}
                                  >
                                    [{formatVector(result.inputMagnitude, result.inputSign)}]
                                  </Code>
                                </Flex>
                              </Box>
                            </Table.Cell>
                            <Table.Cell>
                              <Box style={{ maxWidth: "200px", overflow: "hidden" }}>
                                <Flex direction="column" gap="1">
                                  <Text size="1" style={{ color: "var(--gray-9)" }}>
                                    크기: {result.outputMagnitude.length}
                                  </Text>
                                  <Code
                                    style={{
                                      maxHeight: "60px",
                                      overflow: "auto",
                                      fontSize: "11px",
                                      padding: "4px",
                                      backgroundColor: "var(--gray-a2)",
                                    }}
                                  >
                                    [{formatVector(result.outputMagnitude, result.outputSign)}]
                                  </Code>
                                </Flex>
                              </Box>
                            </Table.Cell>
                            <Table.Cell>
                              {result.argmaxIdx !== undefined ? (
                                <Badge color="green">
                                  최종 예측: {result.argmaxIdx}
                                </Badge>
                              ) : (
                                <Badge color="blue">완료</Badge>
                              )}
                            </Table.Cell>
                          </Table.Row>
                        ))}
                        
                        {/* 현재 처리 중인 레이어 행 */}
                        {isProcessing && (
                          <Table.Row>
                            <Table.Cell>
                              <Badge color="orange" mr="1">{currentLayerIndex + 1}</Badge>
                            </Table.Cell>
                            <Table.Cell>진행 중...</Table.Cell>
                            <Table.Cell>
                              <Flex align="center" gap="2">
                                <ReloadIcon style={{ animation: "spin 1s linear infinite" }} />
                                <Text size="2">처리 중...</Text>
                              </Flex>
                            </Table.Cell>
                            <Table.Cell>
                              <Flex align="center" gap="2">
                                <ReloadIcon style={{ animation: "spin 1s linear infinite" }} />
                                <Text size="2">처리 중...</Text>
                              </Flex>
                            </Table.Cell>
                            <Table.Cell>
                              <Badge color="orange">처리 중</Badge>
                            </Table.Cell>
                          </Table.Row>
                        )}
                        
                        {/* 남은 레이어 행 */}
                        {Array.from({ length: Math.max(0, getLayerCount() - currentLayerIndex - (isProcessing ? 1 : 0)) }).map((_, idx) => (
                          <Table.Row key={`pending-${idx}`} style={{ opacity: 0.5 }}>
                            <Table.Cell>
                              <Badge variant="outline" mr="1">{currentLayerIndex + idx + (isProcessing ? 1 : 0) + 1}</Badge>
                            </Table.Cell>
                            <Table.Cell>대기 중</Table.Cell>
                            <Table.Cell>-</Table.Cell>
                            <Table.Cell>-</Table.Cell>
                            <Table.Cell>
                              <Badge variant="outline" color="gray">대기 중</Badge>
                            </Table.Cell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table.Root>
                  </Box>
                )}
              </Flex>
            </Card>
          </Tabs.Content>

          {/* Files Tab */}
          <Tabs.Content value="files">
            <Card style={{ border: "none", boxShadow: "none" }}>
              <Flex direction="column" gap="4">
                <Heading size="4" style={{ color: "#FF5733", fontWeight: 700 }}>
                  Model Files
                </Heading>
                <Text style={{ lineHeight: "1.6" }}>
                  This model is stored on the Sui blockchain and consists of the following files.
                </Text>

                <Box style={{ background: "#F5F5F5", padding: "16px", borderRadius: "8px" }}>
                  {getModelFiles(model.task_type).map((file, index) => (
                    <Flex
                      key={index}
                      justify="between"
                      py="2"
                      style={{
                        borderBottom:
                          index < getModelFiles(model.task_type).length - 1
                            ? "1px solid var(--gray-a2)"
                            : "none",
                        padding: "12px 8px",
                      }}
                    >
                      <Text size="2" style={{ fontFamily: "monospace" }}>
                        {file.name}
                      </Text>
                      <Text size="2" color="gray">
                        {file.size}
                      </Text>
                    </Flex>
                  ))}
                </Box>
              </Flex>
            </Card>
          </Tabs.Content>

          {/* Model Data Tab - 디코딩된 BCS 데이터 표시 */}
          <Tabs.Content value="model-data">
            <Card style={{ border: "none", boxShadow: "none" }}>
              <Flex direction="column" gap="4">
                <Heading size="4" style={{ color: "#FF5733", fontWeight: 700 }}>
                  Model Data
                </Heading>
                <Text style={{ lineHeight: "1.6" }}>
                  이 섹션에서는 Sui 블록체인에서 가져온 모델 데이터를 표시합니다.
                </Text>

                {model.graphs && model.graphs.length > 0 ? (
                  <>
                    <Heading size="3" style={{ color: "#FF5733", marginTop: "16px" }}>
                      모델 기본 정보
                    </Heading>
                    <Box
                      style={{
                        background: "#F5F5F5",
                        padding: "16px",
                        borderRadius: "8px",
                        overflowX: "auto",
                      }}
                    >
                      <Table.Root>
                        <Table.Body>
                          <Table.Row>
                            <Table.Cell style={{ fontWeight: 600 }}>이름</Table.Cell>
                            <Table.Cell>{model.name}</Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell style={{ fontWeight: 600 }}>설명</Table.Cell>
                            <Table.Cell>{model.description}</Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell style={{ fontWeight: 600 }}>작업 유형</Table.Cell>
                            <Table.Cell>{model.task_type}</Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell style={{ fontWeight: 600 }}>스케일</Table.Cell>
                            <Table.Cell>{model.scale.toString()}</Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell style={{ fontWeight: 600 }}>그래프 수</Table.Cell>
                            <Table.Cell>{model.graphs.length}</Table.Cell>
                          </Table.Row>
                        </Table.Body>
                      </Table.Root>
                    </Box>

                    {model.graphs.length > 0 && (
                      <>
                        <Heading size="3" style={{ color: "#FF5733", marginTop: "16px" }}>
                          그래프 및 레이어 정보
                        </Heading>
                        {model.graphs.map((graph, graphIdx) => (
                          <Box
                            key={graphIdx}
                            style={{
                              background: "#F5F5F5",
                              padding: "16px",
                              borderRadius: "8px",
                              overflowX: "auto",
                              marginBottom: "10px",
                            }}
                          >
                            <Heading size="2" style={{ marginBottom: "10px" }}>
                              그래프 {graphIdx + 1}
                            </Heading>
                            <Table.Root>
                              <Table.Header>
                                <Table.Row>
                                  <Table.ColumnHeaderCell>레이어</Table.ColumnHeaderCell>
                                  <Table.ColumnHeaderCell>유형</Table.ColumnHeaderCell>
                                  <Table.ColumnHeaderCell>입력 차원</Table.ColumnHeaderCell>
                                  <Table.ColumnHeaderCell>출력 차원</Table.ColumnHeaderCell>
                                </Table.Row>
                              </Table.Header>
                              <Table.Body>
                                {graph.layers.map((layer, layerIdx) => (
                                  <Table.Row key={layerIdx}>
                                    <Table.Cell>{layerIdx + 1}</Table.Cell>
                                    <Table.Cell>
                                      {getLayerTypeName(String(layer.layer_type))}
                                    </Table.Cell>
                                    <Table.Cell>{layer.in_dimension.toString()}</Table.Cell>
                                    <Table.Cell>{layer.out_dimension.toString()}</Table.Cell>
                                  </Table.Row>
                                ))}
                              </Table.Body>
                            </Table.Root>
                          </Box>
                        ))}
                      </>
                    )}

                    {model.graphs.length > 0 && (
                      <>
                        <Heading size="3" style={{ color: "#FF5733", marginTop: "16px" }}>
                          텐서 정보
                        </Heading>
                        <Box
                          style={{
                            background: "#F5F5F5",
                            padding: "16px",
                            borderRadius: "8px",
                            overflowX: "auto",
                          }}
                        >
                          <Table.Root>
                            <Table.Header>
                              <Table.Row>
                                <Table.ColumnHeaderCell>그래프</Table.ColumnHeaderCell>
                                <Table.ColumnHeaderCell>레이어</Table.ColumnHeaderCell>
                                <Table.ColumnHeaderCell>가중치 텐서 형태</Table.ColumnHeaderCell>
                                <Table.ColumnHeaderCell>편향 텐서 형태</Table.ColumnHeaderCell>
                              </Table.Row>
                            </Table.Header>
                            <Table.Body>
                              {model.graphs.flatMap((graph, graphIdx) =>
                                graph.layers.map((layer, layerIdx) => (
                                  <Table.Row key={`${graphIdx}-${layerIdx}`}>
                                    <Table.Cell>{graphIdx + 1}</Table.Cell>
                                    <Table.Cell>{layerIdx + 1}</Table.Cell>
                                    <Table.Cell>
                                      {Array.isArray(layer.weight_tensor.shape)
                                        ? layer.weight_tensor.shape
                                            .map((d: any) => d.toString())
                                            .join(" × ")
                                        : "없음"}
                                    </Table.Cell>
                                    <Table.Cell>
                                      {Array.isArray(layer.bias_tensor.shape)
                                        ? layer.bias_tensor.shape
                                            .map((d: any) => d.toString())
                                            .join(" × ")
                                        : "없음"}
                                    </Table.Cell>
                                  </Table.Row>
                                ))
                              )}
                            </Table.Body>
                          </Table.Root>
                        </Box>
                      </>
                    )}

                    {model.partial_denses.length > 0 && (
                      <>
                        <Heading size="3" style={{ color: "#FF5733", marginTop: "16px" }}>
                          부분 밀집 레이어
                        </Heading>
                        <Box
                          style={{
                            background: "#F5F5F5",
                            padding: "16px",
                            borderRadius: "8px",
                            overflowX: "auto",
                          }}
                        >
                          <Table.Root>
                            <Table.Header>
                              <Table.Row>
                                <Table.ColumnHeaderCell>ID</Table.ColumnHeaderCell>
                                <Table.ColumnHeaderCell>부분 수</Table.ColumnHeaderCell>
                              </Table.Row>
                            </Table.Header>
                            <Table.Body>
                              {model.partial_denses.map((pd, pdIdx) => (
                                <Table.Row key={pdIdx}>
                                  <Table.Cell>{pdIdx + 1}</Table.Cell>
                                  <Table.Cell>{pd.partials.length}</Table.Cell>
                                </Table.Row>
                              ))}
                            </Table.Body>
                          </Table.Root>
                        </Box>
                      </>
                    )}
                  </>
                ) : (
                  <Flex
                    direction="column"
                    align="center"
                    gap="3"
                    py="4"
                    style={{ background: "#FFF4F2", borderRadius: "8px", padding: "20px" }}
                  >
                    <Cross2Icon width={32} height={32} style={{ color: "#FF5733" }} />
                    <Text style={{ textAlign: "center" }}>모델 데이터를 찾을 수 없습니다.</Text>
                    <Badge color="orange">데이터 없음</Badge>
                  </Flex>
                )}
              </Flex>
            </Card>
          </Tabs.Content>
        </Box>
      </Tabs.Root>
    </Box>
  );
}

// Task name conversion function
function getTaskName(taskId: string): string {
  const taskMap: Record<string, string> = {
    "text-generation": "Text Generation",
    "image-classification": "Image Classification",
    "object-detection": "Object Detection",
    "text-to-image": "Text-to-Image",
    translation: "Translation",
  };
  return taskMap[taskId] || taskId;
}

// Task-specific input placeholders
function getPlaceholderByTask(task: string): string {
  switch (task) {
    case "text-generation":
      return "Enter a text prompt...";
    case "image-classification":
      return "Enter an image URL...";
    case "object-detection":
      return "Enter an image URL...";
    case "text-to-image":
      return "Enter a text prompt for image generation...";
    case "translation":
      return "Enter text to translate...";
    default:
      return "Enter input...";
  }
}

// Model architecture information
function getModelArchitecture(task: string): string {
  switch (task) {
    case "text-generation":
      return "This model is based on the Transformer architecture, using a decoder-only design for autoregressive language modeling.";
    case "image-classification":
      return "This model uses a Convolutional Neural Network (CNN) architecture to classify images.";
    case "object-detection":
      return "This model uses a Single Shot Detector (SSD) architecture to detect and classify objects in images.";
    case "text-to-image":
      return "This model uses a diffusion model architecture to generate images from text prompts.";
    case "translation":
      return "This model uses an encoder-decoder Transformer architecture to translate text from one language to another.";
    default:
      return "This model uses state-of-the-art deep learning architecture.";
  }
}

// Model files list
function getModelFiles(task: string): Array<{ name: string; size: string }> {
  const commonFiles = [
    { name: "config.json", size: "4.2KB" },
    { name: "README.md", size: "8.5KB" },
    { name: "LICENSE", size: "1.1KB" },
  ];

  switch (task) {
    case "text-generation":
      return [
        { name: "model.bin", size: "548MB" },
        { name: "tokenizer.json", size: "1.2MB" },
        { name: "vocab.json", size: "798KB" },
        ...commonFiles,
      ];
    case "image-classification":
      return [
        { name: "model.bin", size: "102MB" },
        { name: "classes.txt", size: "12KB" },
        ...commonFiles,
      ];
    default:
      return [{ name: "model.bin", size: "256MB" }, ...commonFiles];
  }
}

// Layer type name conversion function
function getLayerTypeName(layerType: string): string {
  const layerTypeMap: Record<string, string> = {
    "0": "Convolutional Layer",
    "1": "Fully Connected Layer",
    "2": "Max Pooling Layer",
    "3": "Average Pooling Layer",
    "4": "Flatten Layer",
    "5": "ReLU Activation Layer",
    "6": "Softmax Activation Layer",
    "7": "Sigmoid Activation Layer",
    "8": "Tanh Activation Layer",
    "9": "Leaky ReLU Activation Layer",
    "10": "Batch Normalization Layer",
    "11": "Dropout Layer",
    "12": "Embedding Layer",
    "13": "LSTM Layer",
    "14": "GRU Layer",
    "15": "RNN Layer",
    "16": "Bidirectional Layer",
    "17": "Transposed Convolutional Layer",
    "18": "Up Sampling Layer",
    "19": "Down Sampling Layer",
    "20": "Cropping Layer",
    "21": "Resizing Layer",
    "22": "Concatenation Layer",
    "23": "Addition Layer",
  };
  return layerTypeMap[layerType] || `Unknown Layer (${layerType})`;
}

// 벡터 형식화 함수
function formatVector(magnitudes: number[], signs: number[]): string {
  if (magnitudes.length !== signs.length) return "";
  
  return magnitudes.map((mag, i) => {
    const sign = signs[i] === 1 ? 1 : -1;
    return (sign * mag).toFixed(2);
  }).join(", ");
}
