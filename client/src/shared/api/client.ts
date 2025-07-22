import { Configuration, ConfigurationParameters } from './generated';
import {
  DatasetsApi,
  UsersApi,
  AnnotationsApi,
  ImagesApi,
  CategoriesApi,
  DictionariesApi,
  DictionaryCategoriesApi,
  DefaultApi
} from './generated';
import axios, { AxiosInstance } from 'axios';

export interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export class ApiClient {
  private configuration: Configuration;
  private axiosInstance: AxiosInstance;

  // API instances
  public readonly datasets: DatasetsApi;
  public readonly users: UsersApi;
  public readonly annotations: AnnotationsApi;
  public readonly images: ImagesApi;
  public readonly categories: CategoriesApi;
  public readonly dictionaries: DictionariesApi;
  public readonly dictionaryCategories: DictionaryCategoriesApi;
  public readonly default: DefaultApi;

  constructor(config: ApiClientConfig = {}) {
    const {
      baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
      timeout = 10000,
      headers = {}
    } = config;

    // Create axios instance
    this.axiosInstance = axios.create({
      baseURL,
      timeout,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    });

    // Request interceptor to add user ID header
    this.axiosInstance.interceptors.request.use((config) => {
      const userId = localStorage.getItem('opengraph-user-id') || '1'; // Default to user ID 1 for testing
      config.headers['X-Opengraph-User-Id'] = userId;
      return config;
    });

    // Response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error);
        if (error.response?.status === 401) {
          // Handle unauthorized access
          localStorage.removeItem('opengraph-user-id');
          // You can add redirect to login here
        }
        return Promise.reject(error);
      }
    );

    // Create configuration for OpenAPI clients
    const configParams: ConfigurationParameters = {
      basePath: baseURL,
      // Note: We set axios instance separately for each API
    };
    this.configuration = new Configuration(configParams);

    // Initialize API instances with custom axios
    this.datasets = new DatasetsApi(this.configuration, baseURL, this.axiosInstance);
    this.users = new UsersApi(this.configuration, baseURL, this.axiosInstance);
    this.annotations = new AnnotationsApi(this.configuration, baseURL, this.axiosInstance);
    this.images = new ImagesApi(this.configuration, baseURL, this.axiosInstance);
    this.categories = new CategoriesApi(this.configuration, baseURL, this.axiosInstance);
    this.dictionaries = new DictionariesApi(this.configuration, baseURL, this.axiosInstance);
    this.dictionaryCategories = new DictionaryCategoriesApi(this.configuration, baseURL, this.axiosInstance);
    this.default = new DefaultApi(this.configuration, baseURL, this.axiosInstance);
  }

  // Get raw axios instance for custom requests
  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }

  // Get configuration for custom API instances
  getConfiguration(): Configuration {
    return this.configuration;
  }

  // Utility methods
  setAuthHeader(token: string) {
    this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  removeAuthHeader() {
    delete this.axiosInstance.defaults.headers.common['Authorization'];
  }

  setUserId(userId: string) {
    localStorage.setItem('opengraph-user-id', userId);
  }

  getUserId(): string | null {
    return localStorage.getItem('opengraph-user-id');
  }
}

// Default API client instance
export const apiClient = new ApiClient(); 