// Export legacy API client (backward compatibility only)
export { ApiClient, apiClient, type ApiClientConfig } from "./services";

// Export new generic API layer (primary API interface)
export * from "./core";
export * from "./endpoints";
