export interface DemoLoginState {
  isAuthenticated: boolean;
  user: {
    id: string;
    username: string;
    displayName: string;
  } | null;
  isLoading: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user?: {
    id: string;
    username: string;
    displayName: string;
  };
  error?: string;
}