import { useSingleGet, usePost } from "@/shared/api/core";

// Base endpoints
const AUTH_BASE = "/api/v1/auth";

export interface CurrentUser {
  id: number;
  email: string;
  displayName?: string | null;
  profileImageUrl?: string | null;
  suiAddress?: string | null;
  googleId?: string | null;
  zkloginSalt?: string | null;
  nickname?: string | null;
  gender?: string | null;
  age?: number | null;
  country?: string | null;
  isProfileComplete: boolean;
  createdAt: string;
}

export interface ProfileCompleteRequest {
  nickname: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  age: number;
  country: string;
}

export interface ProfileCompleteResponse {
  success: boolean;
  message: string;
  user: {
    id: number;
    email: string;
    googleId?: string | null;
    displayName?: string | null;
    profileImageUrl?: string | null;
    suiAddress?: string | null;
    totalPoints: number;
    nickname?: string | null;
    gender?: string | null;
    age?: number | null;
    country?: string | null;
    isProfileComplete: boolean;
    createdAt: string;
  };
}

// API response interfaces (snake_case from backend)
interface CurrentUserResponse {
  id: number;
  email: string;
  display_name?: string | null;
  profile_image_url?: string | null;
  sui_address?: string | null;
  google_id?: string | null;
  zklogin_salt?: string | null;
  nickname?: string | null;
  gender?: string | null;
  age?: number | null;
  country?: string | null;
  is_profile_complete: boolean;
  created_at: string;
}

interface ProfileCompleteApiResponse {
  success: boolean;
  message: string;
  user: {
    id: number;
    email: string;
    google_id?: string | null;
    display_name?: string | null;
    profile_image_url?: string | null;
    sui_address?: string | null;
    total_points: number;
    nickname?: string | null;
    gender?: string | null;
    age?: number | null;
    country?: string | null;
    is_profile_complete: boolean;
    created_at: string;
  };
}

// Parsing functions to convert API responses to client types
const parseCurrentUser = (resp: CurrentUserResponse): CurrentUser => ({
  id: resp.id,
  email: resp.email,
  displayName: resp.display_name || undefined,
  profileImageUrl: resp.profile_image_url || undefined,
  suiAddress: resp.sui_address || undefined,
  googleId: resp.google_id || undefined,
  zkloginSalt: resp.zklogin_salt || undefined,
  nickname: resp.nickname || undefined,
  gender: resp.gender || undefined,
  age: resp.age || undefined,
  country: resp.country || undefined,
  isProfileComplete: resp.is_profile_complete,
  createdAt: resp.created_at,
});

const parseProfileCompleteResponse = (
  resp: ProfileCompleteApiResponse
): ProfileCompleteResponse => ({
  success: resp.success,
  message: resp.message,
  user: {
    id: resp.user.id,
    email: resp.user.email,
    googleId: resp.user.google_id || undefined,
    displayName: resp.user.display_name || undefined,
    profileImageUrl: resp.user.profile_image_url || undefined,
    suiAddress: resp.user.sui_address || undefined,
    totalPoints: resp.user.total_points,
    nickname: resp.user.nickname || undefined,
    gender: resp.user.gender || undefined,
    age: resp.user.age || undefined,
    country: resp.user.country || undefined,
    isProfileComplete: resp.user.is_profile_complete,
    createdAt: resp.user.created_at,
  },
});

// API Hooks

/**
 * Get current authenticated user with profile completion status
 */
export function useCurrentUser(options: { enabled?: boolean } = {}) {
  return useSingleGet<CurrentUserResponse, CurrentUser>({
    url: `${AUTH_BASE}/me`,
    enabled: options.enabled,
    authenticated: true,
    parseData: parseCurrentUser,
  });
}

/**
 * Complete user profile (nickname, gender, age, country)
 */
export function useCompleteProfile() {
  return usePost<ProfileCompleteRequest, ProfileCompleteApiResponse, ProfileCompleteResponse>(
    `${AUTH_BASE}/profile/complete`,
    parseProfileCompleteResponse,
    { authenticated: true }
  );
}
