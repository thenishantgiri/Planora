import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<
  (typeof client.api.workspaces)[":workspaceId"]["$delete"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.workspaces)[":workspaceId"]["$delete"]
>;

export const useDeleteWorkspace = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param }) => {
      const response = await client.api.workspaces[":workspaceId"]["$delete"]({
        param,
      });

      if (!response.ok) {
        throw new Error("Failed to delete workspace");
      }

      return await response.json();
    },
    onMutate: async ({ param }) => {
      // Cancel any outgoing refetches for this workspace
      await queryClient.cancelQueries({
        queryKey: ["workspace", param.workspaceId],
      });

      // Remove the workspace from the cache immediately to prevent further queries
      queryClient.removeQueries({ queryKey: ["workspace", param.workspaceId] });
    },
    onSuccess: ({ data }) => {
      toast.success("Workspace deleted successfully");

      // Remove the workspace from the cache completely (don't just invalidate)
      queryClient.removeQueries({ queryKey: ["workspace", data.$id] });

      // Invalidate the workspaces list but don't trigger an immediate refetch
      queryClient.invalidateQueries({
        queryKey: ["workspaces"],
        refetchType: "none",
      });
    },
    onError: (error) => {
      toast.error("Failed to delete workspace");
      console.error(error);
    },
  });

  return mutation;
};
