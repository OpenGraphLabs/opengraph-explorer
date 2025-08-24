import { useSingleGet } from "@/shared/api/core";
import { useQuery } from "@tanstack/react-query";
import { fetchData } from "@/shared/api/core/client";

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
    size?: number;
    enabled?: boolean;
  } = {}
): {
  data: Task[] | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
} {
  const { page = 1, size = 20, enabled = true } = options;

  const queryParams = { page, size };
  const queryKey = [TASKS_BASE, queryParams] as const;

  const { data, isLoading, error, refetch } = useQuery<{items: TaskResponse[]}, Error, Task[]>({
    queryKey,
    queryFn: async () =>
      fetchData<typeof queryParams, {items: TaskResponse[]}>({
        url: TASKS_BASE,
        method: "get",
        params: queryParams,
        authenticated: false, // Tasks are public
      }),
    select: resp => resp.items.map(parseTask),
    enabled,
    retry: false,
  });

  return {
    data: data ?? null,
    isLoading,
    error,
    refetch,
  };
}
