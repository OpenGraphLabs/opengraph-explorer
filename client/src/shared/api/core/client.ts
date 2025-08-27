import axios, { AxiosResponse, AxiosHeaders, AxiosRequestConfig } from "axios";

type RequestMethod = "get" | "put" | "post" | "delete";

// Environment configuration
const API_BASE_URL = import.meta.env.VITE_SERVER_BASE_URL || "http://localhost:8000";
console.log("VITE_SERVER_BASE_URL: ", import.meta.env.VITE_SERVER_BASE_URL);

// Types for request configuration
interface BaseRequestConfig {
  fullUrl?: string;
  url?: string;
  authenticated?: boolean;
  headers?: Record<string, string>;
}

interface GetRequestConfig<TParams> extends BaseRequestConfig {
  method?: "get";
  params?: TParams;
}

interface PostRequestConfig<TQuery, TBody> extends BaseRequestConfig {
  method?: "post" | "put" | "delete";
  queryParams?: TQuery;
  body?: TBody;
}

// Auth service interface
interface AuthService {
  getAccessToken(): string | null;
  getAuthHeaders(): Record<string, string>;
  clearAuthState(): void;
}

// Auth service implementation matching the existing client.ts pattern
const authService: AuthService = {
  getAccessToken: () => sessionStorage.getItem("zklogin-jwt"),
  getAuthHeaders: () => {
    const headers: Record<string, string> = {};

    // Add JWT token from session storage
    const jwt = sessionStorage.getItem("zklogin-jwt");
    if (jwt) {
      headers.Authorization = `Bearer ${jwt}`;
    }

    // Add user ID header (for internal use)
    const userId = localStorage.getItem("opengraph-user-id");
    if (userId) {
      headers["X-Opengraph-User-Id"] = userId;
    }

    return headers;
  },
  clearAuthState: () => {
    // Clear session data matching existing client.ts pattern
    sessionStorage.removeItem("zklogin-jwt");
    localStorage.removeItem("opengraph-user-id");
  },
};

function normalizeHeaders(headersInit: Record<string, string> = {}): AxiosHeaders {
  const headers = new AxiosHeaders();

  Object.entries(headersInit).forEach(([key, value]) => {
    if (value !== undefined) {
      headers.set(key, value);
    }
  });

  return headers;
}

function requireAuth(authenticated: boolean) {
  if (authenticated && !authService.getAccessToken()) {
    console.error("Authenticated request attempted without valid access token");
    throw new Error("Authentication required. Please connect your wallet.");
  }
}

function resolveUrl(fullUrl?: string, url?: string): { url: string; withCredentials: boolean } {
  const withCredentials = fullUrl ? false : true;
  return {
    url: fullUrl ?? `${API_BASE_URL}${url}`,
    withCredentials,
  };
}

function buildHeaders(
  authenticated: boolean,
  customHeaders: Record<string, string> = {}
): Record<string, string> {
  const authHeaders = authenticated ? authService.getAuthHeaders() : {};
  const defaultHeaders = {
    "Content-Type": "application/json",
    ...authHeaders,
    ...customHeaders,
  };
  return defaultHeaders;
}

async function handleError(err: any, method: string, url?: string, authenticated?: boolean) {
  console.error(`API error (${method.toUpperCase()} ${url}):`, err);

  // Log detailed error information for debugging
  if (err.response) {
    console.error("Error response status:", err.response.status);
    console.error("Error response data:", err.response.data);
    console.error("Error response headers:", err.response.headers);
  }

  if (err.response?.status === 401 && authenticated) {
    console.error("Authentication error (401), forcing reauthentication");
    // Handle unauthorized access - clear session data and reload
    authService.clearAuthState();
    // Reload to show login screen (matching existing client.ts behavior)
    window.location.reload();
    err.message = "Authentication required. Please connect your wallet.";
  }

  throw err;
}

export async function fetchData<TParams, TResponse>({
  fullUrl,
  url,
  method = "get",
  params,
  authenticated = false,
  headers: customHeaders = {},
}: GetRequestConfig<TParams>): Promise<TResponse> {
  try {
    requireAuth(authenticated);

    const headers = buildHeaders(authenticated, customHeaders);
    const { url: resolvedUrl, withCredentials } = resolveUrl(fullUrl, url);

    const config: AxiosRequestConfig = {
      headers,
      withCredentials,
      ...(params && { params }),
    };

    let response: AxiosResponse<TResponse>;

    switch (method) {
      case "get":
        response = await axios.get<TResponse>(resolvedUrl, config);
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }

    return response.data;
  } catch (err: any) {
    await handleError(err, method, url, authenticated);
    throw err;
  }
}

export async function postData<TQuery, TBody, TResponse>({
  fullUrl,
  url,
  method = "post",
  queryParams,
  body,
  authenticated = false,
  headers: customHeaders = {},
}: PostRequestConfig<TQuery, TBody>): Promise<TResponse> {
  try {
    requireAuth(authenticated);

    const headers = buildHeaders(authenticated, customHeaders);
    const { url: resolvedUrl, withCredentials } = resolveUrl(fullUrl, url);

    const config: AxiosRequestConfig = {
      headers,
      withCredentials,
      ...(queryParams && { params: queryParams }),
    };

    let response: AxiosResponse<TResponse>;

    switch (method) {
      case "post":
        response = await axios.post<TResponse>(resolvedUrl, body, config);
        break;
      case "put":
        response = await axios.put<TResponse>(resolvedUrl, body, config);
        break;
      case "delete":
        response = await axios.delete<TResponse>(resolvedUrl, config);
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }

    return response.data;
  } catch (err: any) {
    await handleError(err, method, url, authenticated);
    throw err;
  }
}

// Export auth service for use in hooks
export { authService };
