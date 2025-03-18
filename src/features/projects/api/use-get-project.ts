import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { Project } from "../types";

interface GetProjectResponse {
  data: Project;
}

interface GetProjectError {
  error: string;
  status: number;
}

type Response = GetProjectResponse | GetProjectError;

export const useGetProject = (projectId: string) => {
  return useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      if (!projectId) {
        throw new Error("Project ID is required");
      }

      const response = await client.api.projects[":projectId"].$get({
        param: { projectId },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch project");
      }

      const result = (await response.json()) as Response;

      if ("error" in result) {
        throw new Error(result.error);
      }

      return result.data;
    },
    enabled: Boolean(projectId),
  });
};
