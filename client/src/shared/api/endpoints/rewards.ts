import { useSingleGet, usePaginatedGet, usePost } from "../core/hooks";
import { ApiListResponse, PaginationParams } from "../core/types/pagination";

// Types matching backend schemas
export interface RewardType {
  IMAGE_APPROVED: "IMAGE_APPROVED";
  TASK_COMPLETED: "TASK_COMPLETED";
  BONUS: "BONUS";
  PENALTY: "PENALTY";
}

export interface UserReward {
  id: number;
  user_id: number;
  reward_type: keyof RewardType;
  points: number;
  description: string | null;
  image_id: number | null;
  task_id: number | null;
  created_at: string;
}

export interface UserContributionStats {
  total_points: number;
  total_images_submitted: number;
  total_images_approved: number;
  total_images_rejected: number;
  total_images_pending: number;
  approval_rate: number;
  recent_rewards: UserReward[];
}

export interface LeaderboardEntry {
  user_id: number;
  display_name: string | null;
  email: string;
  total_points: number;
  total_contributions: number;
  rank: number;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  total_users: number;
  page: number;
  size: number;
  pages: number;
}

interface RewardFilterParams extends PaginationParams {
  reward_type?: keyof RewardType;
}

// Hook for getting user's rewards
export function useUserRewards(userId: number, options: RewardFilterParams = {}) {
  const { page = 1, limit = 25, reward_type } = options;
  
  return usePaginatedGet<UserReward, ApiListResponse<UserReward>, UserReward>({
    url: `/api/v1/rewards/user/${userId}`,
    page,
    limit,
    reward_type,
    enabled: !!userId,
    authenticated: true,
    parseData: (reward) => reward,
  });
}

// Hook for getting current user's rewards
export function useMyRewards(options: RewardFilterParams = {}) {
  const { page = 1, limit = 25, reward_type } = options;
  
  return usePaginatedGet<UserReward, ApiListResponse<UserReward>, UserReward>({
    url: "/api/v1/rewards/my-rewards",
    page,
    limit,
    reward_type,
    enabled: true,
    authenticated: true,
    parseData: (reward) => reward,
  });
}

// Hook for getting user contribution statistics
export function useUserContributionStats(userId: number) {
  return useSingleGet<UserContributionStats, UserContributionStats>({
    url: `/api/v1/rewards/user/${userId}/stats`,
    enabled: !!userId,
    authenticated: true,
    parseData: (data) => data,
  });
}

// Hook for getting current user's contribution statistics  
export function useMyContributionStats() {
  return useSingleGet<UserContributionStats, UserContributionStats>({
    url: "/api/v1/rewards/my-stats",
    enabled: true,
    authenticated: true,
    parseData: (data) => data,
  });
}

// Hook for getting leaderboard
export function useLeaderboard(page: number = 1, limit: number = 25) {
  return useSingleGet<LeaderboardResponse, LeaderboardResponse>({
    url: "/api/v1/rewards/leaderboard",
    queryParams: { page, limit },
    enabled: true,
    authenticated: false, // Public endpoint
    parseData: (data) => data,
  });
}