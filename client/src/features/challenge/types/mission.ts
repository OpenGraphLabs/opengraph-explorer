export type MissionStatus = "active" | "completed" | "inactive";

export type MissionType = "label_annotation" | "bbox_annotation";

export interface ServerMission {
  id: number;
  name: string;
  description: string;
  mission_type: MissionType;
  total_items: number;
  status: MissionStatus;
  created_at: string;
  updated_at: string;
}

export interface Mission {
  id: string;
  name: string;
  description: string;
  mission_type: MissionType;
  total_items: number;
  status: MissionStatus;
  created_at: string;
  updated_at: string;
  challengeId: string;
}

export const MISSION_CHALLENGE_MAPPING: Record<string, string> = {
  label_annotation: "challenge-1",
  bbox_annotation: "challenge-2",
};

export interface UserMissionProgress {
  userId: string;
  missions: Mission[];
  missionScores: MissionScoreDetail[];
  totalScore: number;
  maxPossibleScore: number;
  overallStatus: "not_started" | "in_progress" | "completed";
  completedAt?: Date;
  certificate?: {
    id: string;
    title: string;
    issuedAt: Date;
    shareableUrl?: string;
  };
}

export interface MissionScoreDetail {
  missionId: number;
  missionName: string;
  score: number;
  maxScore: number;
  completedAt: string;
}

export interface MissionCompletion {
  missionId: string;
  completedAt: Date;
  annotations: string[];
  qualityScore: number;
}

export interface CreateMissionRequest {
  name: string;
  description: string;
  mission_type: MissionType;
  total_items: number;
}

export interface UpdateMissionStatusRequest {
  status: MissionStatus;
}

export interface ListMissionsQuery {
  status?: MissionStatus;
  limit?: number;
  offset?: number;
}
