import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { client, handleApiResponse } from "@/lib/rpc";
import { DeleteProjectResponse, ProjectIdParam } from "../types";

type DeleteProjectParams = {
  param: ProjectIdParam;
};

export const useDeleteProject = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation<DeleteProjectResponse, Error, DeleteProjectParams>({
    mutationFn: async ({ param }) => {
      const response = await client.api.projects[":projectId"].$delete({
        param,
      });
      return handleApiResponse<DeleteProjectResponse>(response);
    },
    onSuccess: (result) => {
      toast.success("Project deleted successfully");
      router.refresh();

      // Use optional chaining and nullish coalescing for type safety
      const projectId = result?.data?.$id;
      queryClient.invalidateQueries({ queryKey: ["projects"] });

      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      }
    },
    onError: (error) => {
      toast.error(`Failed to delete project: ${error.message}`);
      console.error("Error deleting project:", error);
    },
  });
};
