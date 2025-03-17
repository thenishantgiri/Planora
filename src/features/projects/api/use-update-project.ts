import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { client, handleApiResponse } from "@/lib/rpc";
import {
  ProjectIdParam,
  UpdateProjectRequest,
  UpdateProjectResponse,
} from "../types";

type UpdateProjectParams = {
  param: ProjectIdParam;
  form: UpdateProjectRequest;
};

export const useUpdateProject = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation<UpdateProjectResponse, Error, UpdateProjectParams>({
    mutationFn: async ({ form, param }) => {
      const response = await client.api.projects[":projectId"].$patch({
        form,
        param,
      });
      return handleApiResponse<UpdateProjectResponse>(response);
    },
    onSuccess: (result) => {
      toast.success("Project updated successfully");
      router.refresh();

      // Use optional chaining and nullish coalescing for type safety
      const projectId = result?.data?.$id;
      queryClient.invalidateQueries({ queryKey: ["projects"] });

      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      }
    },
    onError: (error) => {
      toast.error(`Failed to update project: ${error.message}`);
      console.error("Error updating project:", error);
    },
  });
};
