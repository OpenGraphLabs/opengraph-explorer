import { useState, useEffect } from "react";
import { Participation, AnnotationSubmission } from "../types/challenge";
import {
  mockParticipations,
  mockAnnotationSubmissions,
  getParticipationsByUserId,
  getParticipationByChallengeAndUser,
} from "../data/mockChallenges";

// Simulate API delay
const simulateApiDelay = (ms: number = 600) => new Promise(resolve => setTimeout(resolve, ms));

export function useParticipation(userId: string) {
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's participations
  const fetchParticipations = async () => {
    try {
      setLoading(true);
      setError(null);

      await simulateApiDelay();

      const userParticipations = getParticipationsByUserId(userId);
      setParticipations(userParticipations);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch participations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchParticipations();
    }
  }, [userId]);

  // Join a challenge
  const joinChallenge = async (challengeId: string): Promise<boolean> => {
    try {
      await simulateApiDelay(400);

      // Check if already participating
      const existing = getParticipationByChallengeAndUser(challengeId, userId);
      if (existing) {
        throw new Error("Already participating in this challenge");
      }

      // Create new participation
      const newParticipation: Participation = {
        id: `participation-${Date.now()}`,
        challengeId,
        participantId: userId,
        participantAddress: "0xuser...address", // Would come from wallet
        joinedAt: new Date(),
        status: "active",
        progress: {
          label: { completed: 0, total: 50 }, // Would be calculated from challenge requirements
          bbox: { completed: 0, total: 50 },
          segmentation: { completed: 0, total: 50 },
        },
        earnings: {
          pending: 0,
          confirmed: 0,
          paid: 0,
        },
        qualityScore: 0,
        ranking: 0,
      };

      // Add to mock data (in real app, this would be an API call)
      mockParticipations.push(newParticipation);
      setParticipations(prev => [...prev, newParticipation]);

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join challenge");
      return false;
    }
  };

  // Leave a challenge
  const leaveChallenge = async (challengeId: string): Promise<boolean> => {
    try {
      await simulateApiDelay(400);

      const participation = getParticipationByChallengeAndUser(challengeId, userId);
      if (!participation) {
        throw new Error("Not participating in this challenge");
      }

      // Update participation status
      participation.status = "withdrawn";

      setParticipations(prev =>
        prev.map(p => (p.id === participation.id ? { ...p, status: "withdrawn" } : p))
      );

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to leave challenge");
      return false;
    }
  };

  // Update progress for a specific annotation type
  const updateProgress = (
    challengeId: string,
    annotationType: "label" | "bbox" | "segmentation",
    completed: number
  ) => {
    setParticipations(prev =>
      prev.map(p => {
        if (p.challengeId === challengeId) {
          return {
            ...p,
            progress: {
              ...p.progress,
              [annotationType]: {
                ...p.progress[annotationType],
                completed: Math.min(completed, p.progress[annotationType].total),
              },
            },
          };
        }
        return p;
      })
    );
  };

  // Get participation for specific challenge
  const getChallengeParticipation = (challengeId: string): Participation | undefined => {
    return participations.find(p => p.challengeId === challengeId && p.status === "active");
  };

  // Check if user is participating in a challenge
  const isParticipating = (challengeId: string): boolean => {
    return participations.some(p => p.challengeId === challengeId && p.status === "active");
  };

  // Get total earnings across all participations
  const getTotalEarnings = () => {
    return participations.reduce(
      (total, p) => ({
        pending: total.pending + p.earnings.pending,
        confirmed: total.confirmed + p.earnings.confirmed,
        paid: total.paid + p.earnings.paid,
      }),
      { pending: 0, confirmed: 0, paid: 0 }
    );
  };

  // Get average quality score
  const getAverageQualityScore = (): number => {
    const activeParticipations = participations.filter(p => p.qualityScore > 0);
    if (activeParticipations.length === 0) return 0;

    const totalScore = activeParticipations.reduce((sum, p) => sum + p.qualityScore, 0);
    return totalScore / activeParticipations.length;
  };

  // Get participation statistics
  const getParticipationStats = () => {
    const active = participations.filter(p => p.status === "active").length;
    const completed = participations.filter(p => p.status === "completed").length;
    const totalAnnotations = participations.reduce(
      (total, p) =>
        total +
        p.progress.label.completed +
        p.progress.bbox.completed +
        p.progress.segmentation.completed,
      0
    );

    return {
      active,
      completed,
      total: participations.length,
      totalAnnotations,
      averageQualityScore: getAverageQualityScore(),
    };
  };

  return {
    // Data
    participations,
    loading,
    error,

    // Actions
    joinChallenge,
    leaveChallenge,
    updateProgress,
    fetchParticipations,

    // Utilities
    getChallengeParticipation,
    isParticipating,
    getTotalEarnings,
    getAverageQualityScore,
    getParticipationStats,

    // Refetch alias
    refetch: fetchParticipations,
  };
}

// Hook for managing annotation submissions
export function useAnnotationSubmissions(challengeId: string, userId: string) {
  const [submissions, setSubmissions] = useState<AnnotationSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch submissions for this challenge and user
  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);

      await simulateApiDelay(400);

      const userSubmissions = mockAnnotationSubmissions.filter(
        s => s.challengeId === challengeId && s.participantId === userId
      );
      setSubmissions(userSubmissions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch submissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (challengeId && userId) {
      fetchSubmissions();
    }
  }, [challengeId, userId]);

  // Submit annotation
  const submitAnnotation = async (
    dataId: string,
    annotationType: "label" | "bbox" | "segmentation",
    annotationData: any
  ): Promise<boolean> => {
    try {
      setSubmitting(true);
      setError(null);

      await simulateApiDelay(800);

      const newSubmission: AnnotationSubmission = {
        id: `annotation-${Date.now()}`,
        challengeId,
        participantId: userId,
        dataId,
        type: annotationType,
        data: annotationData,
        status: "pending",
        submittedAt: new Date(),
      };

      // Add to mock data
      mockAnnotationSubmissions.push(newSubmission);
      setSubmissions(prev => [...prev, newSubmission]);

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit annotation");
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  // Get submissions by data ID
  const getSubmissionsByDataId = (dataId: string) => {
    return submissions.filter(s => s.dataId === dataId);
  };

  // Get submissions by type
  const getSubmissionsByType = (type: "label" | "bbox" | "segmentation") => {
    return submissions.filter(s => s.type === type);
  };

  // Check if data has been annotated with specific type
  const hasAnnotation = (dataId: string, type: "label" | "bbox" | "segmentation"): boolean => {
    return submissions.some(s => s.dataId === dataId && s.type === type);
  };

  // Get submission statistics
  const getSubmissionStats = () => {
    const pending = submissions.filter(s => s.status === "pending").length;
    const validated = submissions.filter(s => s.status === "validated").length;
    const rejected = submissions.filter(s => s.status === "rejected").length;

    const averageScore =
      submissions
        .filter(s => s.validationScore !== undefined)
        .reduce((sum, s) => sum + (s.validationScore || 0), 0) /
        submissions.filter(s => s.validationScore !== undefined).length || 0;

    return {
      total: submissions.length,
      pending,
      validated,
      rejected,
      averageScore,
    };
  };

  return {
    // Data
    submissions,
    loading,
    error,
    submitting,

    // Actions
    submitAnnotation,
    fetchSubmissions,

    // Utilities
    getSubmissionsByDataId,
    getSubmissionsByType,
    hasAnnotation,
    getSubmissionStats,

    // Refetch alias
    refetch: fetchSubmissions,
  };
}
