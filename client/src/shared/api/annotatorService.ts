const API_BASE_URL = import.meta.env.VITE_SERVER_BASE_URL || "http://localhost:8080";

export class AnnotatorApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AnnotatorApiError";
  }
}

// API 응답 타입 정의
export interface Annotator {
  id: number;
  sui_address: string;
  nickname?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAnnotatorRequest {
  sui_address: string;
  nickname?: string;
}

export interface Score {
  id: number;
  annotator_id: number;
  mission_id: number;
  submission_data: any;
  score: number;
  submitted_at: string;
  scored_at?: string;
}

export const annotatorService = {
  /**
   * Get annotator by Sui address
   */
  async getAnnotatorBySuiAddress(suiAddress: string): Promise<Annotator | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/annotators/sui/${suiAddress}`);

      if (response.status === 404) {
        return null; // Annotator not found
      }

      if (!response.ok) {
        throw new AnnotatorApiError(`Failed to fetch annotator: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof AnnotatorApiError) {
        throw error;
      }
      throw new AnnotatorApiError("An error occurred while fetching annotator.");
    }
  },

  /**
   * Create a new annotator
   */
  async createAnnotator(request: CreateAnnotatorRequest): Promise<Annotator> {
    try {
      const response = await fetch(`${API_BASE_URL}/annotators`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new AnnotatorApiError(errorData.message || "Failed to create annotator");
      }

      return await response.json();
    } catch (error) {
      if (error instanceof AnnotatorApiError) {
        throw error;
      }
      throw new AnnotatorApiError("An error occurred while creating annotator.");
    }
  },

  /**
   * Get scores for an annotator
   */
  async getAnnotatorScores(annotatorId: number): Promise<Score[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/annotators/${annotatorId}/scores`);

      if (!response.ok) {
        if (response.status === 404) {
          return []; // No scores found
        }
        throw new AnnotatorApiError(`Failed to fetch scores: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof AnnotatorApiError) {
        throw error;
      }
      throw new AnnotatorApiError("An error occurred while fetching scores.");
    }
  },

  /**
   * Get annotator and their scores in one call
   */
  async getAnnotatorWithScores(suiAddress: string): Promise<{
    annotator: Annotator;
    scores: Score[];
  } | null> {
    try {
      let annotator = await this.getAnnotatorBySuiAddress(suiAddress);
      
      // If annotator doesn't exist, create one
      if (!annotator) {
        annotator = await this.createAnnotator({
          sui_address: suiAddress,
          nickname: `User_${suiAddress.slice(-8)}`, // Generate a default nickname
        });
      }

      // Get scores for the annotator
      const scores = await this.getAnnotatorScores(annotator.id);

      return {
        annotator,
        scores,
      };
    } catch (error) {
      console.error("Error getting annotator with scores:", error);
      return null;
    }
  },
}; 