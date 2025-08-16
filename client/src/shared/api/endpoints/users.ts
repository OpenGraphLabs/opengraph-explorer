import { useSingleGet, usePost, usePut } from '../core/hooks';
import type { 
  UserRead, 
  UserCreate,
  UserUpdate,
  CurrentUserResponse 
} from '../generated/models';

// Base endpoints
const USERS_BASE = '/api/v1/users';
const AUTH_BASE = '/api/v1/auth';

// Type mappings for better UX
export interface User {
  id: number;
  email: string;
  displayName?: string;
  profileImageUrl?: string;
  suiAddress?: string;
  googleId?: string;
  createdAt: string;
}

export interface UserCreateInput {
  email: string;
  googleId?: string;
  displayName?: string;
  profileImageUrl?: string;
}

export interface UserUpdateInput {
  email?: string;
  displayName?: string;
  profileImageUrl?: string;
  suiAddress?: string;
}

// Parsing functions
const parseUser = (raw: UserRead): User => ({
  id: raw.id,
  email: raw.email,
  displayName: raw.display_name || undefined,
  profileImageUrl: raw.profile_image_url || undefined,
  suiAddress: raw.sui_address || undefined,
  googleId: raw.google_id || undefined,
  createdAt: raw.created_at,
});

const parseCurrentUser = (raw: CurrentUserResponse): User => ({
  id: raw.id,
  email: raw.email,
  displayName: raw.display_name || undefined,
  profileImageUrl: raw.profile_image_url || undefined,
  suiAddress: raw.sui_address || undefined,
  googleId: raw.google_id || undefined,
  createdAt: raw.created_at,
});

// API Hooks

/**
 * Get current authenticated user
 */
export function useCurrentUser(options: { enabled?: boolean } = {}) {
  return useSingleGet<CurrentUserResponse, User>({
    url: `${AUTH_BASE}/me`,
    enabled: options.enabled,
    authenticated: true,
    parseData: parseCurrentUser,
  });
}

/**
 * Get a single user by ID
 */
export function useUser(userId: number, options: { enabled?: boolean } = {}) {
  return useSingleGet<UserRead, User>({
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
  return usePost<UserCreateInput, UserRead, User>(
    USERS_BASE,
    parseUser,
    { authenticated: false } // Usually registration doesn't require auth
  );
}

/**
 * Update user profile
 */
export function useUpdateUser(userId: number) {
  return usePut<UserUpdateInput, UserRead, User>(
    `${USERS_BASE}/${userId}`,
    parseUser,
    { authenticated: true }
  );
}