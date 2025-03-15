import { useQuery } from "@tanstack/react-query";
import { client, handleApiResponse } from "@/lib/rpc";
import { GetMembersRequest, GetMembersResponse } from "../types";

export const useGetMembers = (request: GetMembersRequest) => {
  return useQuery({
    queryKey: ["members", request],
    queryFn: async () => {
      const response = await client.api.members.$get({
        query: request,
      });

      return handleApiResponse<GetMembersResponse>(response).then(
        (res) => res.data
      );
    },
    enabled: !!request.workspaceId,
  });
};
