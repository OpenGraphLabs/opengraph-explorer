import { useSingleGet, usePost, usePut } from "@/shared/api/core";

// Base endpoints
const USERS_BASE = "/api/v1/users";

export interface User {
  id: number;
  email: string;
  displayName?: string;
  profileImageUrl?: string;
  suiAddress?: string;
  googleId?: string;
  createdAt: string;
}

export interface UserProfile extends User {
  totalPoints: number;
  datasetCount: number;
  annotationCount: number;
  imagesSubmitted: number;
  imagesApproved: number;
  imagesRejected: number;
  imagesPending: number;
  approvalRate: number;
  nickname?: string;
  gender?: string;
  age?: number;
  country?: string;
  isProfileComplete?: boolean;
}

export interface UserCreateInput {
  email: string;
  google_id?: string; // API expects snake_case
  display_name?: string; // API expects snake_case
  profile_image_url?: string; // API expects snake_case
}

export interface UserUpdateInput {
  email?: string;
  display_name?: string; // API expects snake_case
  profile_image_url?: string; // API expects snake_case
  sui_address?: string; // API expects snake_case
}

interface UserResponse {
  id: number;
  email: string;
  display_name?: string | null;
  profile_image_url?: string | null;
  sui_address?: string | null;
  google_id?: string | null;
  created_at: string;
}

interface UserProfileResponse extends UserResponse {
  total_points: number;
  dataset_count: number;
  annotation_count: number;
  images_submitted: number;
  images_approved: number;
  images_rejected: number;
  images_pending: number;
  approval_rate: number;
  nickname?: string | null;
  gender?: string | null;
  age?: number | null;
  country?: string | null;
  is_profile_complete?: boolean;
}

// Parsing functions to convert API responses to client types
const parseUser = (resp: UserResponse): User => ({
  id: resp.id,
  email: resp.email,
  displayName: resp.display_name || undefined,
  profileImageUrl: resp.profile_image_url || undefined,
  suiAddress: resp.sui_address || undefined,
  googleId: resp.google_id || undefined,
  createdAt: resp.created_at,
});

const parseUserProfile = (resp: UserProfileResponse): UserProfile => ({
  id: resp.id,
  email: resp.email,
  displayName: resp.display_name || undefined,
  profileImageUrl: resp.profile_image_url || undefined,
  suiAddress: resp.sui_address || undefined,
  googleId: resp.google_id || undefined,
  createdAt: resp.created_at,
  totalPoints: resp.total_points,
  datasetCount: resp.dataset_count,
  annotationCount: resp.annotation_count,
  imagesSubmitted: resp.images_submitted,
  imagesApproved: resp.images_approved,
  imagesRejected: resp.images_rejected,
  imagesPending: resp.images_pending,
  approvalRate: resp.approval_rate,
  nickname: resp.nickname || undefined,
  gender: resp.gender || undefined,
  age: resp.age || undefined,
  country: resp.country || undefined,
  isProfileComplete: resp.is_profile_complete || false,
});

// API Hooks

/**
 * Get current authenticated user
 */
export function useCurrentUser(options: { enabled?: boolean } = {}) {
  return useSingleGet<UserResponse, User>({
    url: `${USERS_BASE}/me`,
    enabled: options.enabled,
    authenticated: true,
    parseData: parseUser,
  });
}

/**
 * Get a single user by ID
 */
export function useUser(userId: number, options: { enabled?: boolean } = {}) {
  return useSingleGet<UserResponse, User>({
    url: `${USERS_BASE}/${userId}`,
    enabled: options.enabled && !!userId,
    authenticated: true,
    parseData: parseUser,
  });
}

/**
 * Create a new user
 */
export function useCreateUser() {
  return usePost<UserCreateInput, UserResponse, User>(
    `${USERS_BASE}/`,
    parseUser,
    { authenticated: false } // Usually registration doesn't require auth
  );
}

/**
 * Update user profile
 */
export function useUpdateUser(userId: number) {
  return usePut<UserUpdateInput, UserResponse, User>(`${USERS_BASE}/${userId}`, parseUser, {
    authenticated: true,
  });
}

/**
 * Update current user profile
 */
export function useUpdateCurrentUser() {
  return usePut<UserUpdateInput, UserResponse, User>(`${USERS_BASE}/me`, parseUser, {
    authenticated: true,
  });
}

/**
 * Get current user profile (with statistics)
 */
export function useCurrentUserProfile(options: { enabled?: boolean } = {}) {
  return useSingleGet<UserProfileResponse, UserProfile>({
    url: `${USERS_BASE}/me/profile`,
    enabled: options.enabled,
    authenticated: true,
    parseData: parseUserProfile,
  });
}
