export type MissionStatus = "not_started" | "in_progress" | "completed";

export type MissionType = "label" | "bbox";

export interface Mission {
  id: string;
  type: MissionType;
  title: string;
  description: string;
  challengeId: string;
  requiredCount: number;
  completedCount: number;
  status: MissionStatus;
  order: number; // 1 for Step 1, 2 for Step 2
  reward?: {
    type: "certificate" | "badge" | "points";
    name: string;
    description: string;
  };
}

export interface UserMissionProgress {
  userId: string;
  missions: Mission[];
  overallStatus: "not_started" | "in_progress" | "completed";
  completedAt?: Date;
  certificate?: {
    id: string;
    title: string;
    issuedAt: Date;
    shareableUrl?: string;
  };
}

export interface MissionCompletion {
  missionId: string;
  completedAt: Date;
  annotations: string[]; // annotation IDs that contributed to completion
  qualityScore: number;
} 