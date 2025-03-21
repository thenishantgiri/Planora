import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { WorkspaceAnalytics } from "../types";

export const useGetWorkspaceAnalytics = (workspaceId: string) => {
  return useQuery({
    queryKey: ["workspace-analytics", workspaceId],
    queryFn: async () => {
      if (!workspaceId) {
        throw new Error("Project ID is required");
      }

      const response = await client.api.workspaces[":workspaceId"][
        "analytics"
      ].$get({
        param: { workspaceId },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch workspace analytics");
      }

      const result = await response.json();

      if ("error" in result) {
        throw new Error(result.error);
      }

      return result.data as WorkspaceAnalytics;
    },
    enabled: Boolean(workspaceId),
  });
};
