import { useState } from "react";

export interface UseLeaderboardPageOptions {
  limit?: number;
}

export function useLeaderboardPage(options: UseLeaderboardPageOptions = {}) {
  const { limit = 25 } = options;

  // Page-specific UI state
  const [currentPage, setCurrentPage] = useState(1);

  // TODO: Implement when useLeaderboard hook is available
  // const {
  //   data: leaderboardData,
  //   isLoading,
  //   error,
  // } = useLeaderboard(currentPage, limit);

  // Mock data for now
  const mockLeaderboardData = {
    entries: [
      {
        user_id: 1,
        display_name: "OpenGraph Hero",
        email: "hero@opengraph.ai",
        total_points: 12540,
        total_contributions: 247,
        rank: 1,
      },
      {
        user_id: 2,
        display_name: "Data Explorer",
        email: "explorer@example.com",
        total_points: 9830,
        total_contributions: 185,
        rank: 2,
      },
      {
        user_id: 3,
        display_name: "Vision Specialist",
        email: "vision@example.com",
        total_points: 8750,
        total_contributions: 163,
        rank: 3,
      },
      {
        user_id: 4,
        display_name: "ML Contributor",
        email: "ml@example.com",
        total_points: 7290,
        total_contributions: 142,
        rank: 4,
      },
      {
        user_id: 5,
        display_name: "AI Annotator",
        email: "ai@example.com",
        total_points: 6540,
        total_contributions: 128,
        rank: 5,
      },
    ],
    total_users: 156,
    page: currentPage,
    size: limit,
    pages: Math.ceil(156 / limit),
  };

  // Page control handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return {
    // Data
    leaderboardData: mockLeaderboardData,
    currentPage,
    totalPages: mockLeaderboardData.pages,

    // Loading states
    isLoading: false,
    error: null,

    // Page control
    handlePageChange,
  };
}
