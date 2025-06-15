import { useState, useEffect } from "react";
import { Mission, UserMissionProgress } from "../types/mission";
import {
  getMissions,
  getMissionById as getMissionByIdAPI,
  updateMissionStatus,
  calculateUserMissionProgress,
  checkAllMissionsCompleted,
} from "../data/mockMissions";
import { annotatorService } from "../../../shared/api/annotatorService";
import { syncMissionProgressWithWallet, updateMissionActivation } from "../utils/missionProgress";

export const useMissions = () => {
  const [userProgress, setUserProgress] = useState<UserMissionProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAnnotator, setCurrentAnnotator] = useState<any>(null);

  // Load missions from API and initialize user progress
  useEffect(() => {
    const loadMissions = async () => {
      setLoading(true);
      setError(null);

      try {
        const missions = await getMissions();
        const userId = "user-1"; // TODO: Get from auth context

        // Try to load saved progress from localStorage
        const savedProgress = localStorage.getItem("opengraph-mission-progress");
        if (savedProgress) {
          try {
            const parsed = JSON.parse(savedProgress);
            // Convert date strings back to Date objects
            parsed.completedAt = parsed.completedAt ? new Date(parsed.completedAt) : undefined;
            parsed.certificate = parsed.certificate
              ? {
                  ...parsed.certificate,
                  issuedAt: new Date(parsed.certificate.issuedAt),
                }
              : undefined;
            
            // 서버에서 받은 최신 미션 데이터를 사용하여 진행 상황을 재계산
            // 저장된 진행 상황(완료된 미션)을 유지하면서 최신 데이터로 업데이트
            const updatedProgress = calculateUserMissionProgress(parsed.userId || userId, missions);
            
            // 이전에 완료된 미션들의 상태를 복원
            if (parsed.missions && Array.isArray(parsed.missions)) {
              const completedMissionIds = parsed.missions
                .filter((m: any) => m.status === "completed")
                .map((m: any) => m.id);
              
              updatedProgress.missions = updatedProgress.missions.map(mission => {
                if (completedMissionIds.includes(mission.id)) {
                  return { ...mission, status: "completed" as const };
                }
                return mission;
              });
              
              // 완료된 미션이 있다면 미션 활성화 상태를 다시 계산
              if (completedMissionIds.length > 0) {
                updatedProgress.missions = updateMissionActivation(updatedProgress.missions);
              }
            }
            
            // 기존 인증서 정보 유지
            if (parsed.certificate) {
              updatedProgress.certificate = parsed.certificate;
            }
            
            // 전체 상태 재계산
            const completedCount = updatedProgress.missions.filter(m => m.status === "completed").length;
            const totalCount = updatedProgress.missions.length;
            updatedProgress.overallStatus = completedCount === totalCount && totalCount > 0 
              ? "completed" 
              : completedCount > 0 
                ? "in_progress" 
                : "not_started";
            
            setUserProgress(updatedProgress);
          } catch (err) {
            console.error("Failed to load saved mission progress:", err);
            // Create new progress if parsing fails
            setUserProgress(calculateUserMissionProgress(userId, missions));
          }
        } else {
          // Create new user progress
          setUserProgress(calculateUserMissionProgress(userId, missions));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load missions");
      } finally {
        setLoading(false);
      }
    };

    loadMissions();
  }, []);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    if (userProgress) {
      localStorage.setItem("opengraph-mission-progress", JSON.stringify(userProgress));
    }
  }, [userProgress]);

  const updateMission = async (missionId: string, status: "active" | "completed" | "inactive") => {
    if (!userProgress) return;

    setLoading(true);
    setError(null);

    try {
      const updatedMission = await updateMissionStatus(missionId, status);
      if (!updatedMission) {
        throw new Error("Failed to update mission status");
      }

      setUserProgress(prev => {
        if (!prev) return prev;

        const updatedMissions = prev.missions.map(mission =>
          mission.id === missionId ? updatedMission : mission
        );

        const allCompleted = checkAllMissionsCompleted(updatedMissions);
        const completedMissions = updatedMissions.filter(m => m.status === "completed");

        const overallStatus = allCompleted
          ? "completed"
          : completedMissions.length > 0
            ? "in_progress"
            : "not_started";

        return {
          ...prev,
          missions: updatedMissions,
          overallStatus,
          completedAt: allCompleted ? new Date() : prev.completedAt,
          certificate:
            allCompleted && !prev.certificate
              ? {
                  id: `OG-CERT-${new Date().getFullYear()}-${prev.userId}`,
                  title: "OpenGraph Data Annotation Specialist",
                  issuedAt: new Date(),
                  shareableUrl: `https://opengraph.io/certificate/OG-CERT-${new Date().getFullYear()}-${prev.userId}`,
                }
              : prev.certificate,
        };
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update mission");
    } finally {
      setLoading(false);
    }
  };

  const getMissionById = (id: string): Mission | undefined => {
    return userProgress?.missions.find(mission => mission.id === id);
  };

  const getCurrentMission = (): Mission | undefined => {
    return userProgress?.missions.find(mission => mission.status === "active");
  };

  const getNextMission = (): Mission | undefined => {
    if (!userProgress) return undefined;

    const completedMissions = userProgress.missions.filter(m => m.status === "completed");
    const allMissions = userProgress.missions.sort((a, b) => parseInt(a.id) - parseInt(b.id));

    // Return the first mission that's not completed
    return allMissions.find(m => m.status !== "completed");
  };

  const canAccessMission = (missionId: string): boolean => {
    if (!userProgress) return false;

    const mission = getMissionById(missionId);
    if (!mission) return false;

    // 첫 번째 미션은 항상 접근 가능
    const allMissions = userProgress.missions.sort((a, b) => parseInt(a.id) - parseInt(b.id));
    const missionIndex = allMissions.findIndex(m => m.id === missionId);

    if (missionIndex === 0) return true;

    // 이전 미션이 완료되어야 접근 가능
    const previousMission = allMissions[missionIndex - 1];
    return previousMission?.status === "completed";
  };

  const getMissionStatus = (missionId: string): "locked" | "available" | "completed" => {
    const mission = getMissionById(missionId);
    if (!mission) return "locked";

    if (mission.status === "completed") return "completed";

    return canAccessMission(missionId) ? "available" : "locked";
  };

  const resetProgress = async () => {
    setLoading(true);
    try {
      const missions = await getMissions();
      const userId = "user-1"; // TODO: Get from auth context
      
      // 로컬스토리지 완전 초기화
      localStorage.removeItem("opengraph-mission-progress");
      
      // 새로운 진행 상황 생성
      const newProgress = calculateUserMissionProgress(userId, missions);
      setUserProgress(newProgress);
      
      console.log("🔄 Mission progress has been reset");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset progress");
    } finally {
      setLoading(false);
    }
  };

  /**
   * 지갑 연동 시 사용자의 진행 상황을 서버와 동기화합니다.
   */
  const syncProgressWithWallet = async (suiAddress: string) => {
    if (!userProgress) return;

    setLoading(true);
    setError(null);

    try {
      console.log(`🔗 Syncing progress for wallet: ${suiAddress}`);

      // 1. Annotator 및 Score 정보 가져오기
      const result = await annotatorService.getAnnotatorWithScores(suiAddress);

      if (!result) {
        throw new Error("Failed to get annotator information");
      }

      const { annotator, scores } = result;
      setCurrentAnnotator(annotator);

      console.log(`📊 Found annotator ID: ${annotator.id} with ${scores.length} scores`);

      // 2. Score 기반으로 Mission 상태 동기화
      const syncedMissions = syncMissionProgressWithWallet(userProgress.missions, scores);

      // 3. UserProgress 업데이트
      const updatedProgress = calculateUserMissionProgress(userProgress.userId, syncedMissions);

      setUserProgress({
        ...updatedProgress,
        userId: suiAddress, // 지갑 주소를 userId로 사용
      });

      console.log(
        `✅ Mission progress synced. Completed missions:`,
        syncedMissions.filter(m => m.status === "completed").map(m => `Step ${m.id}`)
      );
    } catch (err) {
      console.error("Failed to sync wallet progress:", err);
      setError(err instanceof Error ? err.message : "Failed to sync wallet progress");
    } finally {
      setLoading(false);
    }
  };

  const generateCertificate = () => {
    if (!userProgress || userProgress.overallStatus !== "completed") return;

    const certificate = {
      id: `OG-CERT-${new Date().getFullYear()}-${userProgress.userId}`,
      title: "OpenGraph Data Annotation Specialist",
      issuedAt: new Date(),
      shareableUrl: `https://opengraph.io/certificate/OG-CERT-${new Date().getFullYear()}-${userProgress.userId}`,
    };

    setUserProgress(prev =>
      prev
        ? {
            ...prev,
            certificate,
          }
        : prev
    );
  };

  return {
    userProgress,
    loading,
    error,
    currentAnnotator,
    updateMission,
    getMissionById,
    getCurrentMission,
    getNextMission,
    canAccessMission,
    getMissionStatus,
    resetProgress,
    generateCertificate,
    syncProgressWithWallet,
    isAllCompleted: userProgress?.overallStatus === "completed" || false,
  };
};
