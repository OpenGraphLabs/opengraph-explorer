import axios, { AxiosResponse, AxiosRequestConfig } from "axios";

// Environment configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Types for admin requests
interface AdminRequestConfig {
  url: string;
  method?: "get" | "post" | "put" | "delete";
  params?: Record<string, any>;
  body?: any;
  credentials?: {
    username: string;
    password: string;
  };
}

export class AdminApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any
  ) {
    super(message);
    this.name = "AdminApiError";
  }
}

function buildBasicAuthHeader(username: string, password: string): string {
  return `Basic ${btoa(`${username}:${password}`)}`;
}

export async function adminApiRequest<T>({
  url,
  method = "get",
  params,
  body,
  credentials
}: AdminRequestConfig): Promise<T> {
  try {
    const fullUrl = `${API_BASE_URL}${url}`;
    
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Add Basic Auth header if credentials provided
    if (credentials) {
      headers.Authorization = buildBasicAuthHeader(credentials.username, credentials.password);
    }

    const config: AxiosRequestConfig = {
      headers,
      withCredentials: false, // Don't use cookies for admin
      ...(params && method === "get" && { params }),
    };

    let response: AxiosResponse<T>;

    switch (method) {
      case "get":
        response = await axios.get<T>(fullUrl, config);
        break;
      case "post":
        response = await axios.post<T>(fullUrl, body, config);
        break;
      case "put":
        response = await axios.put<T>(fullUrl, body, config);
        break;
      case "delete":
        response = await axios.delete<T>(fullUrl, config);
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }

    return response.data;
  } catch (err: any) {
    console.error(`Admin API error (${method.toUpperCase()} ${url}):`, err);

    let errorMessage = "Admin API request failed";
    let status = 500;
    let data = null;

    if (err.response) {
      status = err.response.status;
      data = err.response.data;
      
      if (status === 401) {
        errorMessage = "Invalid admin credentials";
      } else if (err.response.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.response.data?.message) {
        errorMessage = err.response.data.message;
      } else {
        errorMessage = `Admin API error: ${status}`;
      }
    } else if (err.message) {
      errorMessage = err.message;
    }

    throw new AdminApiError(errorMessage, status, data);
  }
}

// Admin-specific API functions
export const adminApi = {
  // Test authentication
  async testAuth(credentials: { username: string; password: string }): Promise<boolean> {
    try {
      await adminApiRequest({
        url: "/api/v1/admin/images/pending",
        method: "get",
        params: { limit: 1 },
        credentials
      });
      return true;
    } catch (error) {
      if (error instanceof AdminApiError && error.status === 401) {
        return false;
      }
      throw error;
    }
  },

  // Get pending images
  async getPendingImages(
    params: { page: number; limit: number; search?: string },
    credentials: { username: string; password: string }
  ): Promise<any> {
    return adminApiRequest({
      url: "/api/v1/admin/images/pending",
      method: "get",
      params,
      credentials
    });
  },

  // Approve image
  async approveImage(
    imageId: number,
    credentials: { username: string; password: string }
  ): Promise<any> {
    return adminApiRequest({
      url: `/api/v1/admin/images/${imageId}/approve`,
      method: "put",
      credentials
    });
  },

  // Reject image
  async rejectImage(
    imageId: number,
    credentials: { username: string; password: string }
  ): Promise<any> {
    return adminApiRequest({
      url: `/api/v1/admin/images/${imageId}/reject`,
      method: "put",
      credentials
    });
  },

  // Get image details
  async getImageDetails(
    imageId: number,
    credentials: { username: string; password: string }
  ): Promise<any> {
    return adminApiRequest({
      url: `/api/v1/admin/images/${imageId}`,
      method: "get",
      credentials
    });
  }
};