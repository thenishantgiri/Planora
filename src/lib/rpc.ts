import { hc } from "hono/client";
import { AppType } from "@/app/api/[[...route]]/route";
import { handleApiResponse } from "@/types/api";

// Type-safe client with base URL
export const client = hc<AppType>(
  process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== "undefined" ? window.location.origin : "")
);

// Re-export the handleApiResponse function for convenience
export { handleApiResponse };
