import { SUI_NETWORK, SUI_CONTRACT } from "../constants/suiConfig";
import { SuiGraphQLClient } from "@mysten/sui/graphql";
import { graphql } from "@mysten/sui/graphql/schemas/latest";

/**
 * 데이터셋 객체 인터페이스
 */
export interface DatasetObject {
  id: string;
  name: string;
  description?: string;
  dataType: string;
  dataSize: string | number;
  dataCount: number;
  creator?: string;
  license?: string;
  tags?: string[];
  createdAt: string;
  data: Array<{
    blobId: string;
    fileHash: string;
    annotation?: string;
  }>;
}

/**
 * 데이터 객체 인터페이스
 */
export interface DataObject {
  path: string;
  annotations: AnnotationObject[];
  blobId: string;
  blobHash: string;
  range?: RangeObject;
}

/**
 * 어노테이션 객체 인터페이스
 */
export interface AnnotationObject {
  label: string;
}

/**
 * 범위 객체 인터페이스
 */
export interface RangeObject {
  start?: number;
  end?: number;
}

/**
 * 데이터셋 GraphQL 서비스
 */
export class DatasetGraphQLService {
  private gqlClient: SuiGraphQLClient;

  constructor() {
    this.gqlClient = new SuiGraphQLClient({
      url: SUI_NETWORK.GRAPHQL_URL,
    });
  }

  /**
   * 모든 데이터셋 객체 가져오기
   */
  async getAllDatasets(): Promise<DatasetObject[]> {
    try {
      const query = graphql(`
        query GetDatasets {
          objects(filter: {
            type: "${SUI_CONTRACT.PACKAGE_ID}::dataset::Dataset"
          }) {
            nodes {
              address
              version
              owner{
                ... on AddressOwner {
                  owner {
                    address
                  }
                }
              }
              asMoveObject {
                contents {
                  json
                }
                dynamicFields {
                  nodes {
                    value {
                      ... on MoveValue {
                        json
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `);

      const result = await this.gqlClient.query({
        query: query,
      });

      if (result.errors && result.errors.length > 0) {
        throw new Error(`GraphQL error: ${result.errors[0].message}`);
      }

      console.log("graphQL data: \n", result.data);

      const objectNodes = result.data?.objects?.nodes || [];
      return this.transformDatasetNodes(objectNodes as any[]);
    } catch (error) {
      console.error("Error fetching datasets:", error);
      throw error;
    }
  }

  /**
   * 특정 ID의 데이터셋 객체 가져오기
   */
  async getDatasetById(datasetId: string): Promise<DatasetObject | null> {
    try {
      const query = graphql(`
        query GetDataset {
          object(address: "${datasetId}") {
            address
            version
            owner{
              ... on AddressOwner {
                owner {
                  address
                }
              }
            }
            asMoveObject {
              contents {
                json
              }
              dynamicFields {
                nodes {
                  value {
                    ... on MoveValue {
                      json
                    }
                  }
                }
              }
            }
          }
        }
      `);

      const result = await this.gqlClient.query({
        query: query,
      });

      if (result.errors && result.errors.length > 0) {
        throw new Error(`GraphQL error: ${result.errors[0].message}`);
      }

      console.log("graphQL data: \n", result.data);

      // 객체가 없는 경우
      if (!result.data?.object) {
        return null;
      }

      // 단일 데이터셋을 변환
      const datasets = this.transformDatasetNodes([result.data.object as any]);
      return datasets.length > 0 ? datasets[0] : null;
    } catch (error) {
      console.error(`Error fetching dataset with ID ${datasetId}:`, error);
      throw error;
    }
  }

  /**
   * 특정 사용자가 소유한 데이터셋 객체 가져오기
   */
  async getUserDatasets(userAddress: string): Promise<DatasetObject[]> {
    try {
      const query = graphql(`
        query GetUserDatasets {
          objects(filter: {
            type: "${SUI_CONTRACT.PACKAGE_ID}::dataset::Dataset",
            owner: "${userAddress}"
          }) {
            nodes {
              address
              version
              owner {
                ... on AddressOwner {
                  owner {
                    address
                  }
                }
              }
              asMoveObject {
                contents {
                  json
                }
                dynamicFields {
                  nodes {
                    value {
                      ... on MoveValue {
                        json
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `);

      const result = await this.gqlClient.query({
        query: query,
      });

      if (result.errors && result.errors.length > 0) {
        throw new Error(`GraphQL error: ${result.errors[0].message}`);
      }

      const objectNodes = result.data?.objects?.nodes || [];
      return this.transformDatasetNodes(objectNodes as any[]);
    } catch (error) {
      console.error(`Error fetching datasets for user ${userAddress}:`, error);
      throw error;
    }
  }

  /**
   * GraphQL 응답 노드를 DatasetObject 배열로 변환
   */
  private transformDatasetNodes(nodes: any[]): DatasetObject[] {
    return nodes.map(node => {
      // JSON 데이터 추출
      const jsonData = node?.asMoveObject?.contents?.json;
      console.log("JSON 데이터:", jsonData);

      // 동적 필드 데이터 추출
      const dynamicFields = node?.asMoveObject?.dynamicFields?.nodes || [];
      const dataItems = dynamicFields.map((field: any) => {
        const fieldData = field.value.json;
        return {
          blobId: fieldData.blob_id,
          fileHash: fieldData.blob_hash,
          annotation: fieldData.annotations?.[0]?.label || "",
        };
      });

      // 소유자 주소 처리
      let ownerAddress = "Unknown";
      if (node.owner && node.owner.owner && node.owner.owner.address) {
        ownerAddress = node.owner.owner.address.toString();
      }

      if (!jsonData) {
        console.warn(`No JSON data found for dataset with ID ${node.address}`);
      }

      // 기본값 설정
      const defaultData = {
        id: node.address,
        name: `Dataset ${node.address.substring(0, 8)}`,
        description: "데이터셋에 대한 설명이 제공되지 않았습니다.",
        tags: [],
        dataType: "unknown",
        dataSize: 0,
        creator: ownerAddress,
        license: "OpenGraph License",
        createdAt: new Date().toISOString(),
        dataCount: 0,
        data: [],
      };

      // JSON 데이터가 있으면 해당 데이터 사용
      if (jsonData) {
        return {
          ...defaultData,
          id: jsonData.id || defaultData.id,
          name: jsonData.name || defaultData.name,
          description: jsonData.description || defaultData.description,
          tags: jsonData.tags || defaultData.tags,
          dataType: jsonData.data_type || defaultData.dataType,
          dataSize: jsonData.data_size || defaultData.dataSize,
          creator: jsonData.creator || defaultData.creator,
          license: jsonData.license || defaultData.license,
          dataCount: dataItems.length,
          data: dataItems,
          createdAt: node.createdAt || defaultData.createdAt,
        };
      }

      return defaultData;
    });
  }
}

// 싱글톤 인스턴스 생성
export const datasetGraphQLService = new DatasetGraphQLService();
