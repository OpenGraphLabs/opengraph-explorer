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
  datasetCount: number;
  annotationCount: number;
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
  dataset_count: number;
  annotation_count: number;
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
  datasetCount: resp.dataset_count,
  annotationCount: resp.annotation_count,
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
    USERS_BASE,
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
