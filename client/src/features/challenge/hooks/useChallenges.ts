import { useState, useEffect, useMemo } from "react";
import { Challenge, ChallengeFilters, ChallengeStatus, ChallengePhase } from "../types/challenge";
import { mockChallenges } from "../data/mockChallenges";

// Simulate API delay
const simulateApiDelay = (ms: number = 800) => new Promise(resolve => setTimeout(resolve, ms));

export function useChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const [filters, setFilters] = useState<ChallengeFilters>({
    status: "all",
    phase: "all",
    difficulty: "all",
    sortBy: "createdAt",
    sortOrder: "desc",
    searchQuery: "",
    tags: [],
  });

  // Fetch challenges (simulated API call)
  const fetchChallenges = async () => {
    try {
      setLoading(true);
      setError(null);

      await simulateApiDelay();

      // Simulate API response
      setChallenges(mockChallenges);
      setIsLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch challenges");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchChallenges();
  }, []);

  // Filter and sort challenges
  const filteredChallenges = useMemo(() => {
    let filtered = [...challenges];

    // Status filter
    if (filters.status !== "all") {
      filtered = filtered.filter(challenge => challenge.status === filters.status);
    }

    // Phase filter
    if (filters.phase !== "all") {
      filtered = filtered.filter(challenge => challenge.currentPhase === filters.phase);
    }

    // Difficulty filter
    if (filters.difficulty !== "all") {
      filtered = filtered.filter(challenge => challenge.difficulty === filters.difficulty);
    }

    // Search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        challenge =>
          challenge.title.toLowerCase().includes(query) ||
          challenge.description.toLowerCase().includes(query) ||
          challenge.datasetName.toLowerCase().includes(query) ||
          challenge.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Tags filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter(challenge =>
        filters.tags.some(tag => challenge.tags.includes(tag))
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (filters.sortBy) {
        case "createdAt":
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
          break;
        case "bounty":
          aValue = a.bounty.totalAmount;
          bValue = b.bounty.totalAmount;
          break;
        case "participants":
          aValue = a.stats.totalParticipants;
          bValue = b.stats.totalParticipants;
          break;
        case "deadline":
          aValue = a.timeline.endDate.getTime();
          bValue = b.timeline.endDate.getTime();
          break;
        default:
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
      }

      if (filters.sortOrder === "asc") {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

    return filtered;
  }, [challenges, filters]);

  // Get all unique tags from challenges
  const getAllUniqueTags = () => {
    const allTags = challenges.flatMap(challenge => challenge.tags);
    return [...new Set(allTags)].sort();
  };

  // Update specific filter
  const updateFilter = <K extends keyof ChallengeFilters>(key: K, value: ChallengeFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Toggle tag selection
  const toggleTag = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag],
    }));
  };

  // Clear all tags
  const clearTags = () => {
    setFilters(prev => ({ ...prev, tags: [] }));
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      status: "all",
      phase: "all",
      difficulty: "all",
      sortBy: "createdAt",
      sortOrder: "desc",
      searchQuery: "",
      tags: [],
    });
  };

  // Get challenges by status
  const getChallengesByStatus = (status: ChallengeStatus) => {
    return challenges.filter(challenge => challenge.status === status);
  };

  // Get challenges by phase
  const getChallengesByPhase = (phase: ChallengePhase) => {
    return challenges.filter(challenge => challenge.currentPhase === phase);
  };

  // Get trending challenges (high participation, recent)
  const getTrendingChallenges = () => {
    return challenges
      .filter(challenge => challenge.status === "active")
      .sort((a, b) => {
        // Weighted score: participants * recency * bounty
        const aScore =
          a.stats.totalParticipants *
          (1 / ((Date.now() - a.createdAt.getTime()) / (1000 * 60 * 60 * 24))) *
          (a.bounty.totalAmount / 1000);
        const bScore =
          b.stats.totalParticipants *
          (1 / ((Date.now() - b.createdAt.getTime()) / (1000 * 60 * 60 * 24))) *
          (b.bounty.totalAmount / 1000);
        return bScore - aScore;
      })
      .slice(0, 5);
  };

  return {
    // Data
    challenges,
    filteredChallenges,
    loading,
    error,
    isLoaded,
    filters,

    // Actions
    fetchChallenges,
    updateFilter,
    toggleTag,
    clearTags,
    resetFilters,

    // Utilities
    getAllUniqueTags,
    getChallengesByStatus,
    getChallengesByPhase,
    getTrendingChallenges,

    // Refetch alias
    refetch: fetchChallenges,
  };
}

// Hook for individual challenge
export function useChallenge(challengeId: string) {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChallenge = async () => {
    try {
      setLoading(true);
      setError(null);

      await simulateApiDelay(400);

      const foundChallenge = mockChallenges.find(c => c.id === challengeId);
      if (!foundChallenge) {
        throw new Error("Challenge not found");
      }

      setChallenge(foundChallenge);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch challenge");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (challengeId) {
      fetchChallenge();
    }
  }, [challengeId]);

  return {
    challenge,
    loading,
    error,
    refetch: fetchChallenge,
  };
}
