import { Mission, UserMissionProgress, MissionStatus } from "../types/mission";

// Mock missions for onboarding
export const mockMissions: Mission[] = [
  {
    id: "mission-1",
    type: "label",
    title: "Step 1: Sea Animal Classification",
    description: "Complete 10 sea animal classification annotations",
    challengeId: "challenge-1", // Sea Animal Classification
    requiredCount: 10,
    completedCount: 10,
    status: "completed",
    order: 1,
    reward: {
      type: "badge",
      name: "Label Master",
      description: "Successfully completed label annotation training"
    }
  },
  {
    id: "mission-2", 
    type: "bbox",
    title: "Step 2: Urban Traffic Image Bounding Box",
    description: "Complete 3 bounding box annotations",
    challengeId: "challenge-2", // Urban Traffic Image Annotation
    requiredCount: 3,
    completedCount: 3,
    status: "completed",
    order: 2,
    reward: {
      type: "certificate",
      name: "OpenGraph Data Annotator",
      description: "Certified data annotator for AI/ML datasets"
    }
  }
];

// Mock user mission progress
export const mockUserMissionProgress: UserMissionProgress = {
  userId: "user-1",
  missions: [...mockMissions],
  overallStatus: "completed",
  completedAt: new Date("2024-01-15"),
  certificate: {
    id: "OG-CERT-2024-001",
    title: "OpenGraph Data Annotation Specialist",
    issuedAt: new Date("2024-01-15"),
    shareableUrl: "https://opengraph.io/certificate/OG-CERT-2024-001"
  }
};

// Helper functions
export const getMissionById = (id: string): Mission | undefined => {
  return mockMissions.find(mission => mission.id === id);
};

export const getMissionsByType = (type: "label" | "bbox"): Mission[] => {
  return mockMissions.filter(mission => mission.type === type);
};

export const updateMissionProgress = (
  missionId: string, 
  completedCount: number
): Mission => {
  const mission = getMissionById(missionId);
  if (!mission) {
    throw new Error(`Mission ${missionId} not found`);
  }

  const status: MissionStatus = completedCount >= mission.requiredCount ? "completed" : 
                                completedCount > 0 ? "in_progress" : "not_started";

  const updatedMission = {
    ...mission,
    completedCount,
    status
  };

  return updatedMission;
};

export const checkAllMissionsCompleted = (missions: Mission[]): boolean => {
  return missions.every(mission => mission.status === "completed");
}; 