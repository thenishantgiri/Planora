import { useQuery } from "@tanstack/react-query";
import { client, handleApiResponse } from "@/lib/rpc";
import { GetProjectsResponse } from "../types";

interface UseGetProjectsProps {
  workspaceId: string;
}

export const useGetProjects = ({ workspaceId }: UseGetProjectsProps) => {
  return useQuery({
    queryKey: ["projects", { workspaceId }],
    queryFn: async () => {
      const response = await client.api.projects.$get({
        query: { workspaceId },
      });

      return handleApiResponse<GetProjectsResponse>(response).then(
        (res) => res.data
      );
    },
    enabled: !!workspaceId,
  });
};
