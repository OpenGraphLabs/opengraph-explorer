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
      // Decode JWT to get user info
      const decoded = zkLoginService.decodeJwt(jwt);

      const user: User = {
        id: decoded.sub,
        email: (decoded as any).email,
        name: (decoded as any).name,
        picture: (decoded as any).picture,
      };

      // Store JWT in session storage
      sessionStorage.setItem("zklogin-jwt", jwt);

      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        isLoading: false,
        user,
        jwt,
      }));

      console.log("Authentication successful:", user);
    } catch (error) {
      console.error("Failed to handle Google callback:", error);
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
