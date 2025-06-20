import { Mission, UserMissionProgress } from "../types/mission";
import { missionService } from "../../../shared/api/missionService";
import { updateMissionActivation } from "../utils/missionProgress";

// 실제 API에서 Mission 데이터를 가져오는 함수들
export const getMissions = async (): Promise<Mission[]> => {
  try {
    return await missionService.getMissions();
  } catch (error) {
    console.error("Failed to fetch missions:", error);
    // Fallback으로 빈 배열 반환
    return [];
  }
};

export const getMissionById = async (id: string): Promise<Mission | undefined> => {
  try {
    return await missionService.getMissionById(id);
  } catch (error) {
    console.error(`Failed to fetch mission ${id}:`, error);
    return undefined;
  }
};

// UserMissionProgress는 별도의 API가 없으므로 클라이언트에서 계산
export const calculateUserMissionProgress = (
  userId: string,
  missions: Mission[]
): UserMissionProgress => {
  // 미션 순서와 활성화 상태를 올바르게 설정
  const orderedMissions = updateMissionActivation(missions);
  
  // 모든 미션이 완료되었는지 확인 (status가 "completed"인 미션들)
  const completedMissions = orderedMissions.filter(mission => mission.status === "completed");
  const activeMissions = orderedMissions.filter(mission => mission.status === "active");
  const isAllCompleted = completedMissions.length === orderedMissions.length && orderedMissions.length > 0;

  const overallStatus = isAllCompleted
    ? "completed"
    : activeMissions.length > 0 || completedMissions.length > 0
      ? "in_progress"
      : "not_started";

  // Calculate mission scores (100 points per mission)
  const missionScores = orderedMissions.map(mission => ({
    missionId: parseInt(mission.id),
    missionName: mission.name,
    score: mission.status === "completed" ? 100 : 0,
    maxScore: 100,
    completedAt: mission.status === "completed" ? new Date().toISOString() : undefined,
  }));

  const totalScore = completedMissions.length * 100;
  const maxPossibleScore = orderedMissions.length * 100;

  return {
    userId,
    missions: orderedMissions, // 정렬된 미션 사용
    missionScores,
    totalScore,
    maxPossibleScore,
    overallStatus,
    completedAt: isAllCompleted ? new Date() : undefined,
    certificate: isAllCompleted
      ? {
          id: `OG-CERT-${new Date().getFullYear()}-${userId}`,
          title: "OpenGraph Data Annotation Specialist",
          issuedAt: new Date(),
          shareableUrl: `https://opengraph.io/certificate/OG-CERT-${new Date().getFullYear()}-${userId}`,
        }
      : undefined,
  };
};

// Helper functions
export const updateMissionStatus = async (
  missionId: string,
  status: "active" | "completed" | "inactive"
): Promise<Mission | undefined> => {
  try {
    return await missionService.updateMissionStatus(missionId, { status });
  } catch (error) {
    console.error(`Failed to update mission ${missionId} status:`, error);
    return undefined;
  }
};

export const checkAllMissionsCompleted = (missions: Mission[]): boolean => {
  return missions.every(mission => mission.status === "completed") && missions.length > 0;
};
