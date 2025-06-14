import { useState, useEffect } from "react";
import { Mission, UserMissionProgress, MissionStatus } from "../types/mission";
import { 
  mockMissions, 
  mockUserMissionProgress, 
  updateMissionProgress,
  checkAllMissionsCompleted 
} from "../data/mockMissions";

export const useMissions = () => {
  const [userProgress, setUserProgress] = useState<UserMissionProgress>(mockUserMissionProgress);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user progress from localStorage on mount
  useEffect(() => {
    const savedProgress = localStorage.getItem("opengraph-mission-progress");
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress);
        // Convert date strings back to Date objects
        parsed.completedAt = parsed.completedAt ? new Date(parsed.completedAt) : undefined;
        parsed.certificate = parsed.certificate ? {
          ...parsed.certificate,
          issuedAt: new Date(parsed.certificate.issuedAt)
        } : undefined;
        setUserProgress(parsed);
      } catch (err) {
        console.error("Failed to load mission progress:", err);
      }
    }
  }, []);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("opengraph-mission-progress", JSON.stringify(userProgress));
  }, [userProgress]);

  const updateMission = (missionId: string, completedCount: number) => {
    setLoading(true);
    setError(null);

    try {
      const updatedMission = updateMissionProgress(missionId, completedCount);
      
      setUserProgress(prev => {
        const updatedMissions = prev.missions.map(mission => 
          mission.id === missionId ? updatedMission : mission
        );

        const allCompleted = checkAllMissionsCompleted(updatedMissions);
        const overallStatus: MissionStatus = allCompleted ? "completed" : 
                                           updatedMissions.some(m => m.status === "in_progress") ? "in_progress" : "not_started";

        return {
          ...prev,
          missions: updatedMissions,
          overallStatus,
          completedAt: allCompleted ? new Date() : prev.completedAt
        };
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update mission");
    } finally {
      setLoading(false);
    }
  };

  const getMissionById = (id: string): Mission | undefined => {
    return userProgress.missions.find(mission => mission.id === id);
  };

  const getCurrentMission = (): Mission | undefined => {
    return userProgress.missions.find(mission => mission.status !== "completed");
  };

  const getNextMission = (): Mission | undefined => {
    const currentMission = getCurrentMission();
    if (!currentMission) return undefined;
    
    const currentIndex = userProgress.missions.findIndex(m => m.id === currentMission.id);
    return userProgress.missions[currentIndex + 1];
  };

  const canAccessMission = (missionId: string): boolean => {
    const mission = getMissionById(missionId);
    if (!mission) return false;
    
    // Step 1은 항상 접근 가능
    if (mission.order === 1) return true;
    
    // Step 2는 Step 1이 완료되어야 접근 가능
    if (mission.order === 2) {
      const step1Mission = userProgress.missions.find(m => m.order === 1);
      return step1Mission?.status === "completed";
    }
    
    return false;
  };

  const getMissionStatus = (missionId: string): "locked" | "available" | "completed" => {
    const mission = getMissionById(missionId);
    if (!mission) return "locked";
    
    if (mission.status === "completed") return "completed";
    
    return canAccessMission(missionId) ? "available" : "locked";
  };

  const resetProgress = () => {
    setUserProgress(mockUserMissionProgress);
    localStorage.removeItem("opengraph-mission-progress");
  };

  const generateCertificate = () => {
    if (userProgress.overallStatus !== "completed") return;

    const certificate = {
      id: `cert-${Date.now()}`,
      title: "OpenGraph Data Annotator Certificate",
      issuedAt: new Date(),
      shareableUrl: `https://opengraph.io/certificate/${Date.now()}`
    };

    setUserProgress(prev => ({
      ...prev,
      certificate
    }));
  };

  return {
    userProgress,
    loading,
    error,
    updateMission,
    getMissionById,
    getCurrentMission,
    getNextMission,
    canAccessMission,
    getMissionStatus,
    resetProgress,
    generateCertificate,
    isAllCompleted: userProgress.overallStatus === "completed"
  };
}; 