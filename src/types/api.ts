// src/types/api.ts
import { Models } from "node-appwrite";

// Standard API response structure
export interface ApiResponse<T> {
  data: T;
  error?: never;
  status?: never;
}

export interface ApiErrorResponse {
  data?: never;
  error: string;
  status: number;
}

export type ApiResult<T> = ApiResponse<T> | ApiErrorResponse;

// Common Document type from Appwrite
export type AppwriteDocument = Models.Document;

// Helper to extract the actual data type from an ApiResponse
export type ExtractDataType<T> = T extends ApiResponse<infer U> ? U : never;

// Helper function to handle API responses
export async function handleApiResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok || "error" in data) {
    throw new Error(data.error || "An error occurred");
  }

  return data as T;
}
