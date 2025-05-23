import { SUI_NETWORK, SUI_CONTRACT } from "../constants/suiConfig";
import { SuiGraphQLClient } from "@mysten/sui/graphql";
import { graphql } from "@mysten/sui/graphql/schemas/latest";

/**
 * 페이지네이션 정보 인터페이스
 */
export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor?: string;
}

/**
 * 페이지네이션된 데이터 응답 인터페이스
 */
export interface PaginatedDataResponse {
  data: Array<DataObject>;
  pageInfo: PageInfo;
  totalCount?: number;
}

/**
 * 데이터셋 객체 인터페이스 (페이지네이션 정보 포함)
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
  labels?: string[];
  createdAt: string;
  data: Array<DataObject>;
  pageInfo?: PageInfo;
}

/**
 * 데이터 객체 인터페이스
 */
export interface DataObject {
  path: string;
  annotations: AnnotationObject[];
  blobId: string;
  blobHash: string;
  dataType: string;
  range?: RangeObject;
  pendingAnnotationStats: PendingAnnotationStat[];
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
 * 대기 중인 어노테이션 통계 객체 인터페이스
 */
export interface PendingAnnotationStat {
  label: string;
  count: number;
}

/**
 * 페이지네이션 옵션 인터페이스
 */
export interface PaginationOptions {
  first?: number;
  after?: string;
  last?: number;
  before?: string;
}

/**
 * 데이터셋 GraphQL 서비스
 */
export class DatasetGraphQLService {
  private gqlClient: SuiGraphQLClient;
  private readonly DEFAULT_PAGE_SIZE = 20;

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
                dynamicFields(first: 50) {
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
   * 특정 ID의 데이터셋 객체 가져오기 (페이지네이션 포함)
   */
  async getDatasetById(
    datasetId: string, 
    paginationOptions?: PaginationOptions
  ): Promise<DatasetObject | null> {
    try {
      const pageSize = paginationOptions?.first || paginationOptions?.last || this.DEFAULT_PAGE_SIZE;
      
      console.log(`[GraphQL] getDatasetById - datasetId: ${datasetId}, pageSize: ${pageSize}, options:`, paginationOptions);
      
      // 변수와 쿼리 동적 생성
      const variables: any = {
        datasetId,
        pageSize,
      };

      let dynamicFieldsArgs = "first: $pageSize";
      let variableDeclarations = "$datasetId: SuiAddress!, $pageSize: Int!";
      
      // cursor 유효성 검증 및 안전한 설정
      if (paginationOptions?.after && typeof paginationOptions.after === 'string' && paginationOptions.after.trim()) {
        variables.after = paginationOptions.after;
        dynamicFieldsArgs = "first: $pageSize, after: $after";
        variableDeclarations += ", $after: String!";
        console.log(`[GraphQL] Using after cursor: ${paginationOptions.after}`);
      } else if (paginationOptions?.before && typeof paginationOptions.before === 'string' && paginationOptions.before.trim()) {
        variables.before = paginationOptions.before;
        dynamicFieldsArgs = "last: $pageSize, before: $before";
        variableDeclarations += ", $before: String!";
        console.log(`[GraphQL] Using before cursor: ${paginationOptions.before}`);
      } else if (paginationOptions?.after || paginationOptions?.before) {
        console.warn(`[GraphQL] Invalid cursor provided:`, paginationOptions);
        // 잘못된 cursor가 제공된 경우 첫 페이지로 fallback
        dynamicFieldsArgs = "first: $pageSize";
      }

      const queryString = `
        query GetDataset(${variableDeclarations}) {
          object(address: $datasetId) {
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
              dynamicFields(${dynamicFieldsArgs}) {
                pageInfo {
                  hasNextPage
                  hasPreviousPage
                  startCursor
                  endCursor
                }
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
      `;

      console.log(`[GraphQL] Executing query with variables:`, variables);

      const result = await this.gqlClient.query({
        query: queryString as any,
        variables,
      });

      if (result.errors && result.errors.length > 0) {
        console.error(`[GraphQL] Query errors:`, result.errors);
        throw new Error(`GraphQL error: ${result.errors[0].message}`);
      }

      console.log("graphQL data: \n", result.data);

      // 객체가 없는 경우
      if (!result.data?.object) {
        console.warn(`[GraphQL] No object found for dataset ID: ${datasetId}`);
        return null;
      }

      // 페이지네이션 정보 로깅
      const pageInfo = (result.data.object as any)?.asMoveObject?.dynamicFields?.pageInfo;
      if (pageInfo) {
        console.log(`[GraphQL] PageInfo:`, {
          hasNextPage: pageInfo.hasNextPage,
          hasPreviousPage: pageInfo.hasPreviousPage,
          startCursor: pageInfo.startCursor ? `${pageInfo.startCursor.substring(0, 20)}...` : null,
          endCursor: pageInfo.endCursor ? `${pageInfo.endCursor.substring(0, 20)}...` : null,
        });
      }

      // 단일 데이터셋을 변환 (페이지네이션 정보 포함)
      const datasets = this.transformDatasetNodesWithPagination([result.data.object as any]);
      return datasets.length > 0 ? datasets[0] : null;
    } catch (error) {
      console.error(`[GraphQL] Error fetching dataset with ID ${datasetId}:`, error);
      throw error;
    }
  }

  /**
   * 데이터셋의 동적 필드만 페이지네이션으로 가져오기
   */
  async getDatasetData(
    datasetId: string, 
    paginationOptions?: PaginationOptions
  ): Promise<PaginatedDataResponse> {
    try {
      const pageSize = paginationOptions?.first || paginationOptions?.last || this.DEFAULT_PAGE_SIZE;
      
      console.log(`[GraphQL] getDatasetData - datasetId: ${datasetId}, pageSize: ${pageSize}, options:`, paginationOptions);
      
      // 변수와 쿼리 동적 생성
      const variables: any = {
        datasetId,
        pageSize,
      };

      let dynamicFieldsArgs = "first: $pageSize";
      let variableDeclarations = "$datasetId: SuiAddress!, $pageSize: Int!";
      
      // cursor 유효성 검증 및 안전한 설정
      if (paginationOptions?.after && typeof paginationOptions.after === 'string' && paginationOptions.after.trim()) {
        variables.after = paginationOptions.after;
        dynamicFieldsArgs = "first: $pageSize, after: $after";
        variableDeclarations += ", $after: String!";
        console.log(`[GraphQL] Using after cursor: ${paginationOptions.after.substring(0, 50)}...`);
      } else if (paginationOptions?.before && typeof paginationOptions.before === 'string' && paginationOptions.before.trim()) {
        variables.before = paginationOptions.before;
        dynamicFieldsArgs = "last: $pageSize, before: $before";
        variableDeclarations += ", $before: String!";
        console.log(`[GraphQL] Using before cursor: ${paginationOptions.before.substring(0, 50)}...`);
      } else if (paginationOptions?.after || paginationOptions?.before) {
        console.warn(`[GraphQL] Invalid cursor provided, falling back to first page:`, paginationOptions);
        // 잘못된 cursor가 제공된 경우 첫 페이지로 fallback
        dynamicFieldsArgs = "first: $pageSize";
      }

      const queryString = `
        query GetDatasetData(${variableDeclarations}) {
          object(address: $datasetId) {
            asMoveObject {
              dynamicFields(${dynamicFieldsArgs}) {
                pageInfo {
                  hasNextPage
                  hasPreviousPage
                  startCursor
                  endCursor
                }
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
      `;

      console.log(`[GraphQL] Executing getDatasetData query with variables:`, {
        ...variables,
        after: variables.after ? `${variables.after.substring(0, 20)}...` : undefined,
        before: variables.before ? `${variables.before.substring(0, 20)}...` : undefined,
      });

      const result = await this.gqlClient.query({
        query: queryString as any,
        variables,
      });

      if (result.errors && result.errors.length > 0) {
        console.error(`[GraphQL] getDatasetData errors:`, result.errors);
        
        // 특정 에러의 경우 재시도 또는 fallback
        const errorMessage = result.errors[0].message;
        if (errorMessage.includes('outside the available range') || errorMessage.includes('invalid cursor')) {
          console.warn(`[GraphQL] Cursor error detected, falling back to first page`);
          return this.getDatasetData(datasetId, { first: pageSize });
        }
        
        throw new Error(`GraphQL error: ${errorMessage}`);
      }

      const objectData = result.data?.object as any;
      const dynamicFields = objectData?.asMoveObject?.dynamicFields;
      
      if (!dynamicFields) {
        console.warn(`[GraphQL] No dynamic fields found for dataset: ${datasetId}`);
        return {
          data: [],
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false,
          }
        };
      }

      // 페이지네이션 정보 상세 로깅
      const pageInfo = dynamicFields.pageInfo;
      console.log(`[GraphQL] getDatasetData PageInfo:`, {
        hasNextPage: pageInfo?.hasNextPage,
        hasPreviousPage: pageInfo?.hasPreviousPage,
        startCursor: pageInfo?.startCursor ? `${pageInfo.startCursor.substring(0, 20)}...` : null,
        endCursor: pageInfo?.endCursor ? `${pageInfo.endCursor.substring(0, 20)}...` : null,
        nodeCount: dynamicFields.nodes?.length || 0,
      });

      const dataItems: Array<DataObject> = (dynamicFields.nodes || []).map((field: any) => {
        const fieldData = field.value.json;
        return {
          path: fieldData.path,
          annotations: fieldData.annotations || [],
          blobId: fieldData.blob_id,
          blobHash: fieldData.blob_hash,
          dataType: fieldData.data_type,
          range: {
            start: fieldData.range?.start,
            end: fieldData.range?.end,
          }
        };
      });

      console.log(`[GraphQL] Successfully retrieved ${dataItems.length} items`);

      return {
        data: dataItems,
        pageInfo: {
          hasNextPage: dynamicFields.pageInfo?.hasNextPage || false,
          hasPreviousPage: dynamicFields.pageInfo?.hasPreviousPage || false,
          startCursor: dynamicFields.pageInfo?.startCursor,
          endCursor: dynamicFields.pageInfo?.endCursor,
        }
      };
    } catch (error) {
      console.error(`[GraphQL] Error fetching dataset data for ${datasetId}:`, error);
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
                dynamicFields(first: 50) {
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
   * GraphQL 응답 노드를 DatasetObject 배열로 변환 (페이지네이션 정보 포함)
   */
  private transformDatasetNodesWithPagination(nodes: any[]): DatasetObject[] {
    return nodes.map(node => {
      // JSON 데이터 추출
      const jsonData = node?.asMoveObject?.contents?.json;
      console.log("JSON 데이터:", jsonData);

      // 동적 필드 데이터 및 페이지네이션 정보 추출
      const dynamicFieldsResponse = node?.asMoveObject?.dynamicFields;
      const dynamicFields = dynamicFieldsResponse?.nodes || [];
      const pageInfo = dynamicFieldsResponse?.pageInfo;
      
      const dataItems: Array<DataObject> = dynamicFields.map((field: any) => {
        const fieldData = field.value.json;
        return {
          path: fieldData.path,
          annotations: fieldData.annotations || [],
          blobId: fieldData.blob_id,
          blobHash: fieldData.blob_hash,
          dataType: fieldData.data_type,
          range: {
            start: fieldData.range?.start,
            end: fieldData.range?.end,
          },
          pendingAnnotationStats: fieldData.pending_annotation_stats?.contents?.map((stat: any) => ({
            label: stat.key,
            count: stat.value,
          })),
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
        labels: [],
        dataType: "unknown",
        dataSize: 0,
        creator: ownerAddress,
        license: "OpenGraph License",
        createdAt: new Date().toISOString(),
        dataCount: 0,
        data: [],
        pageInfo: pageInfo || {
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      // JSON 데이터가 있으면 해당 데이터 사용
      if (jsonData) {
        return {
          ...defaultData,
          id: jsonData.id || defaultData.id,
          name: jsonData.name || defaultData.name,
          description: jsonData.description || defaultData.description,
          tags: jsonData.tags || defaultData.tags,
          labels: jsonData.labels || defaultData.labels,
          dataType: jsonData.data_type || defaultData.dataType,
          dataSize: jsonData.data_size || defaultData.dataSize,
          creator: jsonData.creator || defaultData.creator,
          license: jsonData.license || defaultData.license,
          dataCount: dataItems.length,
          data: dataItems,
          createdAt: node.createdAt || defaultData.createdAt,
          pageInfo: pageInfo || defaultData.pageInfo,
        };
      }

      return defaultData;
    });
  }

  /**
   * GraphQL 응답 노드를 DatasetObject 배열로 변환 (기존 호환성 유지)
   */
  private transformDatasetNodes(nodes: any[]): DatasetObject[] {
    return nodes.map(node => {
      // JSON 데이터 추출
      const jsonData = node?.asMoveObject?.contents?.json;
      console.log("JSON 데이터:", jsonData);

      // 동적 필드 데이터 추출
      const dynamicFields = node?.asMoveObject?.dynamicFields?.nodes || [];
      const dataItems: Array<DataObject> = dynamicFields.map((field: any) => {
        const fieldData = field.value.json;
        return {
          path: fieldData.path,
          annotations: fieldData.annotations || [],
          blobId: fieldData.blob_id,
          blobHash: fieldData.blob_hash,
          dataType: fieldData.data_type,
          range: {
            start: fieldData.range?.start,
            end: fieldData.range?.end,
          },
          pendingAnnotationStats: fieldData.pending_annotation_stats?.contents?.map((stat: any) => ({
            label: stat.key,
            count: stat.value,
          })),
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
        labels: [],
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
          labels: jsonData.labels || defaultData.labels,
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
