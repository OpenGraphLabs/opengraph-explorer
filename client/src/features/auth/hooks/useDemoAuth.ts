import { useState, useEffect } from "react";
import { DEMO_ACCOUNTS } from "../constants/demo";
import { DemoLoginState, LoginCredentials, LoginResponse } from "../types";

const STORAGE_KEY = "opengraph-demo-auth";

export const useDemoAuth = (): DemoLoginState & {
  login: (credentials: LoginCredentials) => Promise<LoginResponse>;
  logout: () => void;
} => {
  const [state, setState] = useState<DemoLoginState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
  });

  useEffect(() => {
    // Check for existing session on mount
    const savedAuth = localStorage.getItem(STORAGE_KEY);
    if (savedAuth) {
      try {
        const { user } = JSON.parse(savedAuth);
        setState({
          isAuthenticated: true,
          user,
          isLoading: false,
        });
      } catch (error) {
        localStorage.removeItem(STORAGE_KEY);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const account = DEMO_ACCOUNTS.find(
      acc => acc.username === credentials.username && acc.password === credentials.password
    );

    if (!account) {
      return {
        success: false,
        error: "Invalid credentials. Please check your username and password.",
      };
    }

    const user = {
      id: account.id,
      username: account.username,
      displayName: account.displayName,
    };

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user }));
    localStorage.setItem("opengraph-user-id", account.userId);

    setState({
      isAuthenticated: true,
      user,
      isLoading: false,
    });

    return {
      success: true,
      user,
    };
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("opengraph-user-id");
    setState({
      isAuthenticated: false,
      user: null,
      isLoading: false,
    });
  };

  return {
    ...state,
    login,
    logout,
  };
};
