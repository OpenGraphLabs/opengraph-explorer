import { useSingleGet, usePaginatedGet } from "@/shared/api/core";
import type { ApiListResponse } from "@/shared/api/core";

const TASKS_BASE = "/api/v1/tasks";

export interface Task {
  id: number;
  name: string;
  createdAt: string;
}

interface TaskResponse {
  id: number;
  name: string;
  created_at: string;
}

interface TaskListResponse extends ApiListResponse<TaskResponse> {}

// Parsing functions to convert API responses to client types
const parseTask = (resp: TaskResponse): Task => ({
  id: resp.id,
  name: resp.name,
  createdAt: resp.created_at,
});

// API Hooks

/**
 * Get a single task by ID
 */
export function useTask(taskId: number, options: { enabled?: boolean } = {}) {
  return useSingleGet<TaskResponse, Task>({
    url: `${TASKS_BASE}/${taskId}`,
    enabled: options.enabled && !!taskId,
    authenticated: false, // Tasks are public
    parseData: parseTask,
  });
}

/**
 * Get all tasks with pagination
 */
export function useTasks(
  options: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    enabled?: boolean;
    setTotalPages?: (total: number) => void;
  } = {}
) {
  const { page = 1, limit = 20, search, sortBy, enabled = true, setTotalPages } = options;

  return usePaginatedGet<TaskResponse, TaskListResponse, Task>({
    url: TASKS_BASE,
    page,
    limit,
    search,
    sortBy,
    enabled,
    authenticated: false, // Tasks are public
    parseData: parseTask,
    setTotalPages,
  });
}
