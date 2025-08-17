import { useState } from "react";
import { postData } from "../client";
import { UsePostOptions } from "../types/pagination";

export type PostResult<TBody, TParsedResponse> = {
  post: (
    body: TBody,
    onSuccess?: (response: TParsedResponse) => void,
    onFailure?: (error: string) => void
  ) => Promise<void>;
  isPosting: boolean;
  error: string | null;
};

export function usePost<TBody, TRawResponse, TParsedResponse>(
  url: string,
  parseResponse: (raw: TRawResponse) => TParsedResponse,
  options: Pick<
    UsePostOptions<TBody, TRawResponse, TParsedResponse>,
    "authenticated" | "enabled"
  > = {}
): PostResult<TBody, TParsedResponse> {
  const { authenticated = false, enabled = true } = options;
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const post = async (
    body: TBody,
    onSuccess?: (response: TParsedResponse) => void,
    onFailure?: (error: string) => void
  ) => {
    if (!enabled) {
      return;
    }

    setIsPosting(true);
    setError(null);

    try {
      const response = await postData<{}, TBody, { success?: boolean; data: TRawResponse }>({
        url,
        body,
        authenticated,
      });

      const parsedResponse = parseResponse(response.data);
      onSuccess?.(parsedResponse);
    } catch (err: any) {
      console.error("Failed to post request:", err);

      // Extract error message from API response
      let errorMessage = "Request failed";

      if (err?.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      onFailure?.(errorMessage);
    } finally {
      setIsPosting(false);
    }
  };

  return { post, isPosting, error };
}

// Additional hooks for PUT and DELETE operations
export function usePut<TBody, TRawResponse, TParsedResponse>(
  url: string,
  parseResponse: (raw: TRawResponse) => TParsedResponse,
  options: Pick<
    UsePostOptions<TBody, TRawResponse, TParsedResponse>,
    "authenticated" | "enabled"
  > = {}
): PostResult<TBody, TParsedResponse> {
  const { authenticated = false, enabled = true } = options;
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const post = async (
    body: TBody,
    onSuccess?: (response: TParsedResponse) => void,
    onFailure?: (error: string) => void
  ) => {
    if (!enabled) {
      return;
    }

    setIsPosting(true);
    setError(null);

    try {
      const response = await postData<{}, TBody, { success?: boolean; data: TRawResponse }>({
        url,
        method: "put",
        body,
        authenticated,
      });

      const parsedResponse = parseResponse(response.data);
      onSuccess?.(parsedResponse);
    } catch (err: any) {
      console.error("Failed to put request:", err);

      let errorMessage = "Request failed";
      if (err?.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      onFailure?.(errorMessage);
    } finally {
      setIsPosting(false);
    }
  };

  return { post, isPosting, error };
}

export function useDelete<TRawResponse, TParsedResponse>(
  url: string,
  parseResponse: (raw: TRawResponse) => TParsedResponse,
  options: { authenticated?: boolean; enabled?: boolean } = {}
) {
  const { authenticated = false, enabled = true } = options;
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteItem = async (
    onSuccess?: (response: TParsedResponse) => void,
    onFailure?: (error: string) => void
  ) => {
    if (!enabled) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const response = await postData<{}, undefined, { success?: boolean; data: TRawResponse }>({
        url,
        method: "delete",
        authenticated,
      });

      const parsedResponse = parseResponse(response.data);
      onSuccess?.(parsedResponse);
    } catch (err: any) {
      console.error("Failed to delete request:", err);

      let errorMessage = "Request failed";
      if (err?.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      onFailure?.(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteItem, isDeleting, error };
}
