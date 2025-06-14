/**
 * Certificate Data Hook
 * 
 * Fetches mission and score data from the server to display in certificate
 */

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/shared/hooks/useAuth";
import { annotatorService } from "@/shared/api/annotatorService";  
import { missionService } from "@/shared/api/missionService";
import { UserMissionProgress, MissionScoreDetail } from "../types/mission";

interface CertificateDataState {
  userProgress: UserMissionProgress | null;
  loading: boolean;
  error: string | null;
}

export function useCertificateData() {
  const { walletAddress } = useAuth();
  const [state, setState] = useState<CertificateDataState>({
    userProgress: null,
    loading: false,
    error: null,
  });

  const fetchCertificateData = useCallback(async () => {
    if (!walletAddress) {
      setState(prev => ({
        ...prev,
        userProgress: null,
        error: "Wallet not connected",
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Get annotator and scores
      let annotatorData = await annotatorService.getAnnotatorWithScores(walletAddress);
      
      if (!annotatorData) {
        // Try to create annotator if it doesn't exist
        console.log("Annotator not found, attempting to create...");
        const newAnnotator = await annotatorService.createAnnotator({
          sui_address: walletAddress,
          nickname: `User_${walletAddress.slice(-8)}`,
        });
        
        if (!newAnnotator) {
          throw new Error("Failed to create annotator");
        }
        
        // Get scores for the new annotator (should be empty)
        const scores = await annotatorService.getAnnotatorScores(newAnnotator.id);
        
        // Set annotatorData for processing
        annotatorData = {
          annotator: newAnnotator,
          scores: scores || [],
        };
      }

      const { annotator, scores } = annotatorData;
      
      // Ensure scores is an array
      const safeScores = Array.isArray(scores) ? scores : [];

      // Get all missions
      const missions = await missionService.getMissions();
      
      if (!missions || missions.length === 0) {
        throw new Error("No missions found");
      }

      // Calculate mission scores and total
      const missionScores: MissionScoreDetail[] = [];
      let totalScore = 0;
      const maxScorePerMission = 100; // Each mission is worth 100 points

      for (const mission of missions) {
        const missionScore = safeScores.find(s => s.mission_id === parseInt(mission.id));
        const score = missionScore ? parseFloat(missionScore.score.toString()) : 0;
        
        missionScores.push({
          missionId: parseInt(mission.id),
          missionName: mission.name,
          score,
          maxScore: maxScorePerMission,
          completedAt: missionScore?.scored_at || missionScore?.submitted_at || new Date().toISOString(),
        });

        totalScore += score;
      }

      const maxPossibleScore = missions.length * maxScorePerMission;
      const completedMissions = missionScores.filter(ms => ms.score > 0);
      const allMissionsCompleted = completedMissions.length === missions.length;

      const userProgress: UserMissionProgress = {
        userId: walletAddress,
        missions,
        missionScores,
        totalScore,
        maxPossibleScore,
        overallStatus: allMissionsCompleted ? "completed" : 
                      completedMissions.length > 0 ? "in_progress" : "not_started",
        completedAt: allMissionsCompleted ? new Date() : undefined,
        certificate: allMissionsCompleted ? {
          id: `OG-${walletAddress.slice(-10).toUpperCase()}`,
          title: "Physical AI Data Specialist",
          issuedAt: new Date(),
        } : undefined,
      };

      setState({
        userProgress,
        loading: false,
        error: null,
      });

    } catch (error) {
      console.error("Failed to fetch certificate data:", error);
      setState({
        userProgress: null,
        loading: false,
        error: error instanceof Error ? error.message : "Failed to load certificate data",
      });
    }
  }, [walletAddress]);

  useEffect(() => {
    fetchCertificateData();
  }, [fetchCertificateData]);

  return {
    ...state,
    refetch: fetchCertificateData,
  };
} 