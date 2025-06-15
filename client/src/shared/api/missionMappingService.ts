/**
 * Mission Mapping Service
 *
 * Handles mapping between challenges and missions, and manages annotator registration
 */

import { useCurrentAccount } from "@mysten/dapp-kit";

const API_BASE_URL = import.meta.env.VITE_SERVER_BASE_URL || "http://server:8080";

// Mission mapping based on challenge types
export const CHALLENGE_TO_MISSION_MAPPING: Record<string, number> = {
  "challenge-1": 1, // Label annotation mission
  "challenge-2": 2, // BBox annotation mission
};

// Annotator interface (matching backend)
export interface Annotator {
  id: number;
  sui_address: string;
  created_at: string;
  updated_at: string;
}

// Create annotator request
export interface CreateAnnotatorRequest {
  sui_address: string;
}

class MissionMappingApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MissionMappingApiError";
  }
}

/**
 * Hook for managing mission and annotator mapping
 */
export function useMissionMapping() {
  const account = useCurrentAccount();

  /**
   * Get mission ID from challenge ID
   */
  const getMissionIdFromChallenge = (challengeId: string): number => {
    const missionId = CHALLENGE_TO_MISSION_MAPPING[challengeId];
    if (!missionId) {
      throw new Error(`No mission mapping found for challenge: ${challengeId}`);
    }
    return missionId;
  };

  /**
   * Get or create annotator for current account
   */
  const getOrCreateAnnotator = async (): Promise<Annotator> => {
    if (!account?.address) {
      throw new Error("Wallet account not found. Please connect your wallet first.");
    }

    try {
      // First, try to get existing annotator
      const getResponse = await fetch(
        `${API_BASE_URL}/annotators/sui/${encodeURIComponent(account.address)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (getResponse.ok) {
        const annotator: Annotator = await getResponse.json();
        return annotator;
      }

      // If annotator doesn't exist (404), create new one
      if (getResponse.status === 404) {
        const createRequest: CreateAnnotatorRequest = {
          sui_address: account.address,
        };

        const createResponse = await fetch(`${API_BASE_URL}/annotators`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(createRequest),
        });

        if (!createResponse.ok) {
          const errorData = await createResponse.json().catch(() => ({}));
          throw new MissionMappingApiError(
            errorData.message || `Failed to create annotator: HTTP ${createResponse.status}`
          );
        }

        const newAnnotator: Annotator = await createResponse.json();
        return newAnnotator;
      }

      // Other errors
      const errorData = await getResponse.json().catch(() => ({}));
      throw new MissionMappingApiError(
        errorData.message || `Failed to get annotator: HTTP ${getResponse.status}`
      );
    } catch (error) {
      console.error("Error getting or creating annotator:", error);
      if (error instanceof MissionMappingApiError) {
        throw error;
      }
      throw new MissionMappingApiError(
        `Failed to get or create annotator: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  /**
   * Get submission parameters for a challenge
   */
  const getSubmissionParams = async (challengeId: string) => {
    const missionId = getMissionIdFromChallenge(challengeId);
    const annotator = await getOrCreateAnnotator();

    return {
      missionId,
      annotatorId: annotator.id,
      annotator,
    };
  };

  return {
    getMissionIdFromChallenge,
    getOrCreateAnnotator,
    getSubmissionParams,
  };
}
