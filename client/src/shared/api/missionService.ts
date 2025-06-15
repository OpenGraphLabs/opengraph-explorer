import {
  Mission,
  ServerMission,
  CreateMissionRequest,
  UpdateMissionStatusRequest,
  ListMissionsQuery,
  MISSION_CHALLENGE_MAPPING,
} from "../../features/challenge/types/mission";

const API_BASE_URL = import.meta.env.VITE_SERVER_BASE_URL || "http://localhost:8080";

export class MissionApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MissionApiError";
  }
}

// ServerMission을 클라이언트 Mission으로 변환하는 함수
const transformServerMission = (serverMission: ServerMission): Mission => {
  return {
    id: serverMission.id.toString(),
    name: serverMission.name,
    description: serverMission.description,
    mission_type: serverMission.mission_type,
    total_items: serverMission.total_items,
    status: serverMission.status,
    created_at: serverMission.created_at,
    updated_at: serverMission.updated_at,
    challengeId:
      MISSION_CHALLENGE_MAPPING[serverMission.mission_type] || `challenge-${serverMission.id}`,
  };
};

export const missionService = {
  /**
   * Get all missions with optional filters
   */
  async getMissions(query?: ListMissionsQuery): Promise<Mission[]> {
    try {
      const params = new URLSearchParams();
      if (query?.status) params.append("status", query.status);
      if (query?.limit) params.append("limit", query.limit.toString());
      if (query?.offset) params.append("offset", query.offset.toString());

      const url = `${API_BASE_URL}/server/v1/missions${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new MissionApiError(`Failed to fetch missions: ${response.statusText}`);
      }

      const serverMissions: ServerMission[] = await response.json();
      return serverMissions.map(transformServerMission);
    } catch (error) {
      if (error instanceof MissionApiError) {
        throw error;
      }
      throw new MissionApiError("An error occurred while fetching missions.");
    }
  },

  /**
   * Get a single mission by ID
   */
  async getMissionById(id: string): Promise<Mission> {
    try {
      const response = await fetch(`${API_BASE_URL}/server/v1/missions/${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new MissionApiError("Mission not found");
        }
        throw new MissionApiError(`Failed to fetch mission: ${response.statusText}`);
      }

      const serverMission: ServerMission = await response.json();
      return transformServerMission(serverMission);
    } catch (error) {
      if (error instanceof MissionApiError) {
        throw error;
      }
      throw new MissionApiError("An error occurred while fetching the mission.");
    }
  },

  /**
   * Create a new mission
   */
  async createMission(request: CreateMissionRequest): Promise<Mission> {
    try {
      const response = await fetch(`${API_BASE_URL}/server/v1/missions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new MissionApiError(errorData.message || "Failed to create mission");
      }

      const serverMission: ServerMission = await response.json();
      return transformServerMission(serverMission);
    } catch (error) {
      if (error instanceof MissionApiError) {
        throw error;
      }
      throw new MissionApiError("An error occurred while creating the mission.");
    }
  },

  /**
   * Update mission status
   */
  async updateMissionStatus(id: string, request: UpdateMissionStatusRequest): Promise<Mission> {
    try {
      const response = await fetch(`${API_BASE_URL}/server/v1/missions/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new MissionApiError("Mission not found");
        }
        const errorData = await response.json();
        throw new MissionApiError(errorData.message || "Failed to update mission status");
      }

      const serverMission: ServerMission = await response.json();
      return transformServerMission(serverMission);
    } catch (error) {
      if (error instanceof MissionApiError) {
        throw error;
      }
      throw new MissionApiError("An error occurred while updating the mission status.");
    }
  },
};
