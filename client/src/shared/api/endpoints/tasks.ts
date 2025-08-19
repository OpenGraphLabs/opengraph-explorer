import { useSingleGet } from "@/shared/api/core";
import { useQuery } from "@tanstack/react-query";
import { fetchData } from "@/shared/api/core/client";

const TASKS_BASE = "/api/v1/tasks";

export interface Task {
  id: string;
  title: string;
  description: string;
  space: string;
  icon?: string;
  targetObjects?: string[];
  requiredCount?: number;
  createdAt: string;
}

interface TaskResponse {
  id: string;
  title: string;
  description: string;
  space: string;
  icon?: string;
  target_objects?: string[];
  required_count?: number;
  created_at: string;
}

// Parsing functions to convert API responses to client types
const parseTask = (resp: TaskResponse): Task => ({
  id: resp.id,
  title: resp.title,
  description: resp.description,
  space: resp.space,
  icon: resp.icon,
  targetObjects: resp.target_objects,
  requiredCount: resp.required_count,
  createdAt: resp.created_at,
});

// API Hooks

/**
 * Get a single task by ID
 */
export function useTask(taskId: string, options: { enabled?: boolean } = {}) {
  return useSingleGet<TaskResponse, Task>({
    url: `${TASKS_BASE}/${taskId}`,
    enabled: options.enabled && !!taskId,
    authenticated: false, // Tasks are public
    parseData: parseTask,
  });
}

/**
 * Get all tasks
 */
export function useTasks(
  options: {
    space?: string;
    enabled?: boolean;
  } = {}
): {
  data: Task[] | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
} {
  const { space, enabled = true } = options;

  const queryParams = space ? { space } : {};
  const queryKey = [TASKS_BASE, queryParams] as const;

  const { data, isLoading, error, refetch } = useQuery<TaskResponse[], Error, Task[]>({
    queryKey,
    queryFn: async () =>
      fetchData<typeof queryParams, TaskResponse[]>({
        url: TASKS_BASE,
        method: "get",
        params: queryParams,
        authenticated: false, // Tasks are public
      }),
    select: resp => resp.map(parseTask),
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
