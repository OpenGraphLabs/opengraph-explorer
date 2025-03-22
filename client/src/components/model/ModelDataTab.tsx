import {
  Box,
  Flex,
  Heading,
  Text,
  Card,
  Table,
  Badge,
} from "@radix-ui/themes";
import { Cross2Icon } from "@radix-ui/react-icons";
import { getLayerTypeName } from "../../utils/modelUtils";

interface ModelDataTabProps {
  model: {
    name: string;
    description: string;
    task_type: string;
    scale: string | number;
    graphs: any[];
    partial_denses: any[];
  };
}

export function ModelDataTab({ model }: ModelDataTabProps) {
  return (
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
                        {graph.layers.map((layer: any, layerIdx: number) => (
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
                        graph.layers.map((layer: any, layerIdx: number) => (
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
  );
} 