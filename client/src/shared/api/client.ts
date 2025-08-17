import axios, { AxiosInstance } from "axios";

export interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

/**
 * Legacy ApiClient for backward compatibility
 * Note: This is now a simple wrapper around axios
 * New code should use the generic API endpoints directly
 */
export class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor(config: ApiClientConfig = {}) {
    const {
      baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
      timeout = 10000,
      headers = {},
    } = config;

    // Create axios instance
    this.axiosInstance = axios.create({
      baseURL,
      timeout,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    });

    // Request interceptor to add auth token and user ID header
    this.axiosInstance.interceptors.request.use(config => {
      // Add JWT token from session storage
      const jwt = sessionStorage.getItem("zklogin-jwt");

      if (jwt) {
        config.headers.Authorization = `Bearer ${jwt}`;
      }

      if (localStorage.getItem("opengraph-user-id")) {
        // Add user ID header (for internal use)
        const userId = localStorage.getItem("opengraph-user-id");
        config.headers["X-Opengraph-User-Id"] = userId;
      }

      return config;
    });

    // Response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      response => response,
      error => {
        console.error("API Error:", error);
        if (error.response?.status === 401) {
          // Handle unauthorized access - clear session data
          sessionStorage.removeItem("zklogin-jwt");
          localStorage.removeItem("opengraph-user-id");
          // Reload to show login screen
          window.location.reload();
        }
        return Promise.reject(error);
      }
    );
  }

  // Get raw axios instance for custom requests
  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }

  // Utility methods
  setAuthHeader(token: string) {
    this.axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  removeAuthHeader() {
    delete this.axiosInstance.defaults.headers.common["Authorization"];
  }

  setUserId(userId: string) {
    localStorage.setItem("opengraph-user-id", userId);
  }

  getUserId(): string | null {
    return localStorage.getItem("opengraph-user-id");
  }
}

// Default API client instance
export const apiClient = new ApiClient();
