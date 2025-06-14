import { Mission, MissionStatus } from "../types/mission";
import { Score } from "../../../shared/api/annotatorService";

export interface MissionProgressResult {
  completedMissions: string[]; // mission IDs
  updatedMissions: Mission[];
}

/**
 * Score 데이터를 기반으로 Mission 완료 상태를 분석합니다.
 */
export const analyzeMissionProgress = (
  missions: Mission[],
  scores: Score[]
): MissionProgressResult => {
  const completedMissions: string[] = [];

  // 각 미션에 대해 완료된 score가 있는지 확인
  const updatedMissions = missions.map(mission => {
    const missionId = parseInt(mission.id);

    // 해당 미션에 대한 score 기록이 있는지 확인
    const missionScores = scores.filter(score => score.mission_id === missionId);

    if (missionScores.length > 0) {
      // Score가 있으면 완료된 것으로 간주
      completedMissions.push(mission.id);
      return {
        ...mission,
        status: "completed" as MissionStatus,
      };
    }

    return mission;
  });

  return {
    completedMissions,
    updatedMissions,
  };
};

/**
 * Mission 순서에 따라 활성화 상태를 결정합니다.
 * 이전 미션이 완료되어야 다음 미션이 활성화됩니다.
 */
export const updateMissionActivation = (missions: Mission[]): Mission[] => {
  // Mission을 ID 순으로 정렬
  const sortedMissions = [...missions].sort((a, b) => parseInt(a.id) - parseInt(b.id));

  let previousCompleted = true; // 첫 번째 미션은 항상 활성화

  return sortedMissions.map((mission, index) => {
    if (mission.status === "completed") {
      // 이미 완료된 미션은 그대로 유지
      previousCompleted = true;
      return mission;
    }

    if (previousCompleted) {
      // 이전 미션이 완료되었거나 첫 번째 미션이면 활성화
      previousCompleted = false; // 다음 미션은 이 미션이 완료되어야 활성화
      return {
        ...mission,
        status: "active" as MissionStatus,
      };
    }

    // 이전 미션이 완료되지 않았으면 비활성화
    return {
      ...mission,
      status: "inactive" as MissionStatus,
    };
  });
};

/**
 * 지갑 연동 시 사용자의 전체 Mission 진행 상황을 업데이트합니다.
 */
export const syncMissionProgressWithWallet = (missions: Mission[], scores: Score[]): Mission[] => {
  // 1. Score 데이터를 기반으로 완료된 미션 확인
  const { updatedMissions } = analyzeMissionProgress(missions, scores);

  // 2. Mission 활성화 상태 업데이트
  const finalMissions = updateMissionActivation(updatedMissions);

  return finalMissions;
};

/**
 * 현재 활성화된 미션을 찾습니다.
 */
export const getCurrentActiveMission = (missions: Mission[]): Mission | undefined => {
  return missions.find(mission => mission.status === "active");
};

/**
 * 완료된 미션 개수를 반환합니다.
 */
export const getCompletedMissionCount = (missions: Mission[]): number => {
  return missions.filter(mission => mission.status === "completed").length;
};

/**
 * 전체 진행률을 계산합니다.
 */
export const calculateOverallProgress = (
  missions: Mission[]
): {
  completed: number;
  total: number;
  percentage: number;
} => {
  const completed = getCompletedMissionCount(missions);
  const total = missions.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    completed,
    total,
    percentage,
  };
};
