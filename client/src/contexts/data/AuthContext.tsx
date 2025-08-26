import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from "react";
import { zkLoginService } from "@/shared/services/zkLoginService";

interface User {
  id: string;
  email?: string;
  name?: string;
  picture?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  jwt: string | null;
  suiAddress: string | null;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  handleGoogleCallback: (jwt: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: false,
    user: null,
    jwt: null,
    suiAddress: null,
    error: null,
  });

  // Check for existing session on mount
  useEffect(() => {
    const savedJwt = sessionStorage.getItem("zklogin-jwt");
    if (savedJwt) {
      try {
        const decoded = zkLoginService.decodeJwt(savedJwt);
        const user: User = {
          id: decoded.sub,
          email: (decoded as any).email,
          name: (decoded as any).name,
          picture: (decoded as any).picture,
        };

        setState(prev => ({
          ...prev,
          isAuthenticated: true,
          user,
          jwt: savedJwt,
        }));
      } catch (error) {
        console.error("Failed to restore session:", error);
        sessionStorage.removeItem("zklogin-jwt");
      }
    }
  }, []);

  const handleGoogleCallback = useCallback(async (jwt: string): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Store JWT first (needed for API calls)
      sessionStorage.setItem("zklogin-jwt", jwt);

      // Decode JWT to get basic user info
      const decoded = zkLoginService.decodeJwt(jwt);

      // Fetch full user info from server using the JWT
      const response = await fetch("/api/v1/auth/me", {
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to get user info from server");
      }

      const serverUser = await response.json();

      const user: User = {
        id: decoded.sub,
        email: serverUser.email || (decoded as any).email,
        name: serverUser.display_name,
        picture: serverUser.profile_image_url,
      };

      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        isLoading: false,
        user,
        jwt,
      }));
    } catch (error) {
      console.error("Failed to handle callback:", error);
      // Clear JWT on error
      sessionStorage.removeItem("zklogin-jwt");
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Authentication failed",
      }));
    }
  }, []);

  const logout = useCallback(() => {
    // Clear session storage
    sessionStorage.removeItem("zklogin-jwt");
    zkLoginService.clearSession();

    setState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      jwt: null,
      suiAddress: null,
      error: null,
    });
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const value: AuthContextValue = {
    ...state,
    handleGoogleCallback,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
