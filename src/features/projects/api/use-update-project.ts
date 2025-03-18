import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();

  return useMutation<UpdateProjectResponse, Error, UpdateProjectParams>({
    mutationFn: async ({ form, param }) => {
      const response = await client.api.projects[":projectId"].$patch({
        form,
        param,
      });
      return handleApiResponse<UpdateProjectResponse>(response);
    },
    onSuccess: ({ data }) => {
      toast.success("Project updated successfully");

      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({
        queryKey: ["project", data?.$id],
      });
    },
    onError: (error) => {
      toast.error(`Failed to update project: ${error.message}`);
      console.error("Error updating project:", error);
    },
  });
};
