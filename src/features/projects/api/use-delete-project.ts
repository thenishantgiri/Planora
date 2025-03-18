import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client, handleApiResponse } from "@/lib/rpc";
import { DeleteProjectResponse, ProjectIdParam } from "../types";

type DeleteProjectParams = {
  param: ProjectIdParam;
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation<DeleteProjectResponse, Error, DeleteProjectParams>({
    mutationFn: async ({ param }) => {
      const response = await client.api.projects[":projectId"].$delete({
        param,
      });
      return handleApiResponse<DeleteProjectResponse>(response);
    },
    onMutate: async ({ param }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["project", param.projectId],
      });

      // Remove the project from the cache immediately to prevent further queries
      queryClient.removeQueries({ queryKey: ["project", param.projectId] });
    },
    onSuccess: ({ data }) => {
      toast.success("Project deleted successfully");

      // Invalidate projects list (but don't refetch right away)
      queryClient.invalidateQueries({
        queryKey: ["projects"],
        refetchType: "none",
      });

      // Remove the deleted project from the cache permanently
      queryClient.removeQueries({ queryKey: ["project", data?.$id] });
    },
    onError: (error) => {
      toast.error(`Failed to delete project: ${error.message}`);
      console.error("Error deleting project:", error);
    },
  });
};
