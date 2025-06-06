import { useState, useEffect, useCallback } from "react";
import { modelGraphQLService, ModelObject } from "../api/modelGraphQLService";
import { useList } from "./useList";

/**
 * 모델 목록 훅 반환 타입
 */
interface UseModelsReturn {
  models: ModelObject[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * 단일 모델 훅 반환 타입
 */
interface UseModelByIdReturn {
  model: ModelObject | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * 모든 모델 목록을 가져오는 커스텀 훅
 */
export const useModels = (): UseModelsReturn => {
  const [models, setModels] = useState<ModelObject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchModels = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await modelGraphQLService.getAllModels();
      setModels(data);
    } catch (err) {
      console.error("Error in useModels hook:", err);
      setError(err instanceof Error ? err.message : "Failed to load models");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  return { models, loading, error, refetch: fetchModels };
};

/**
 * 특정 ID의 모델을 가져오는 커스텀 훅
 */
export const useModelById = (modelId: string): UseModelByIdReturn => {
  const [model, setModel] = useState<ModelObject | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchModel = useCallback(async () => {
    if (!modelId) {
      setError("Model ID is required");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await modelGraphQLService.getModelById(modelId);
      setModel(data);
    } catch (err) {
      console.error(`Error in useModelById hook for ID ${modelId}:`, err);
      setError(err instanceof Error ? err.message : "Failed to load model");
    } finally {
      setLoading(false);
    }
  }, [modelId]);

  useEffect(() => {
    fetchModel();
  }, [fetchModel]);

  return { model, loading, error, refetch: fetchModel };
};

/**
 * Model 목록을 리스트 형태로 관리하는 훅 (검색, 페이지네이션, 선택 기능 포함)
 */
export function useModelList() {
  const fetchModels = useCallback(async () => {
    return await modelGraphQLService.getAllModels();
  }, []);

  const modelList = useList<ModelObject>(fetchModels, {
    keyExtractor: (model) => model.id,
  });

  return modelList;
}
