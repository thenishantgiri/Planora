import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { ProjectAnalytics } from "../types";

export const useGetProjectAnalytics = (projectId: string) => {
  return useQuery({
    queryKey: ["project-analytics", projectId],
    queryFn: async () => {
      if (!projectId) {
        throw new Error("Project ID is required");
      }

      const response = await client.api.projects[":projectId"][
        "analytics"
      ].$get({
        param: { projectId },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch project analytics");
      }

      const result = await response.json();

      if ("error" in result) {
        throw new Error(result.error);
      }

      return result.data as ProjectAnalytics;
    },
    enabled: Boolean(projectId),
  });
};
