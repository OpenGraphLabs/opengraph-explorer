import { datasetGraphQLService } from "@/shared/api/graphql/datasetGraphQLService";
import { mockChallenges } from "../data/mockChallenges";
import type { Challenge } from "../types/challenge";
import type { DatasetObject } from "@/shared/api/graphql/datasetGraphQLService";

class ChallengeDatasetService {
  private datasetCache = new Map<string, DatasetObject | null>();

  /**
   * 실제 데이터셋이 없을 때 사용할 fallback 데이터셋을 생성합니다
   */
  private createFallbackDataset(challenge: Challenge): DatasetObject {
    return {
      id: `fallback-${challenge.id}`,
      name: `${challenge.datasetName} (Fallback)`,
      description: `Fallback dataset for challenge: ${challenge.title}`,
      dataType: "image",
      dataSize: 1024000, // 1MB mock size
      dataCount: 10,
      createdAt: new Date().toISOString(),
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: undefined,
        endCursor: undefined,
      },
      data: [
        // Mock data items with DataObject structure
        {
          path: "/mock/image1.jpg",
          annotations: [{ label: "mock-label" }],
          blobId: "mock-blob-1",
          blobHash: "mock-hash-1",
          dataType: "image",
          pendingAnnotationStats: [],
        },
        {
          path: "/mock/image2.jpg",
          annotations: [{ label: "mock-label" }],
          blobId: "mock-blob-2",
          blobHash: "mock-hash-2",
          dataType: "image",
          pendingAnnotationStats: [],
        },
      ],
    };
  }

  /**
   * 챌린지와 실제 데이터셋을 연결하여 가져옵니다
   */
  async getChallengeWithRealDataset(challengeId: string): Promise<{
    challenge: Challenge | null;
    dataset: DatasetObject | null;
    isRealDataset: boolean;
  }> {
    try {
      console.log("challengeId: ", challengeId);
      // 챌린지 정보 가져오기
      const challenge = mockChallenges.find(c => c.id === challengeId);
      if (!challenge) {
        console.log("챌린지를 찾을 수 없음:", challengeId);
        return { challenge: null, dataset: null, isRealDataset: false };
      }

      console.log("challenge: ", challenge);
      console.log("challenge.datasetId: ", challenge.datasetId);

      // 캐시에서 데이터셋 확인
      if (this.datasetCache.has(challenge.datasetId)) {
        console.log("캐시에서 데이터셋 정보 가져옴");
        const dataset = this.datasetCache.get(challenge.datasetId) ?? null;
        return {
          challenge,
          dataset,
          isRealDataset: dataset !== null && !dataset.id.startsWith("fallback-"),
        };
      }

      console.log("실제 데이터셋 조회 시도:", challenge.datasetId);
      // 실제 데이터셋 조회 시도
      try {
        const dataset = await datasetGraphQLService.getDatasetById(challenge.datasetId);
        console.log("실제 데이터셋 조회 성공:", dataset);
        this.datasetCache.set(challenge.datasetId, dataset);
        return { challenge, dataset, isRealDataset: true };
      } catch (datasetError) {
        console.warn("실제 데이터셋 조회 실패, fallback 데이터셋 사용:", datasetError);
        // 실제 데이터셋이 없는 경우 fallback 데이터셋 생성
        const fallbackDataset = this.createFallbackDataset(challenge);
        this.datasetCache.set(challenge.datasetId, fallbackDataset);
        return { challenge, dataset: fallbackDataset, isRealDataset: false };
      }
    } catch (error) {
      console.error("getChallengeWithRealDataset 에러:", error);
      throw error;
    }
  }

  /**
   * 대안 데이터셋을 찾습니다 (첫 번째 사용 가능한 실제 데이터셋)
   */
  private async findFallbackDataset(): Promise<DatasetObject | null> {
    try {
      const allDatasets = await datasetGraphQLService.getAllDatasets();
      return allDatasets.length > 0 ? allDatasets[0] : null;
    } catch (error) {
      console.error("Error finding fallback dataset:", error);
      return null;
    }
  }

  /**
   * 모든 챌린지를 실제 데이터셋과 연결하여 가져옵니다
   */
  async getAllChallengesWithRealDatasets(): Promise<
    Array<{
      challenge: Challenge;
      dataset: DatasetObject | null;
      isRealDataset: boolean;
    }>
  > {
    const results = await Promise.all(
      mockChallenges.map(async challenge => {
        const result = await this.getChallengeWithRealDataset(challenge.id);
        return {
          challenge: result.challenge || challenge,
          dataset: result.dataset,
          isRealDataset: result.isRealDataset,
        };
      })
    );

    return results;
  }

  /**
   * 특정 데이터셋에 연결된 챌린지들을 가져옵니다
   */
  getChallengesForDataset(datasetId: string): Challenge[] {
    return mockChallenges.filter(challenge => challenge.datasetId === datasetId);
  }

  /**
   * 캐시를 초기화합니다
   */
  clearCache(): void {
    this.datasetCache.clear();
  }
}

export const challengeDatasetService = new ChallengeDatasetService();
