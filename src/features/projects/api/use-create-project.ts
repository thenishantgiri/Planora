import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client, handleApiResponse } from "@/lib/rpc";
import { CreateProjectRequest, CreateProjectResponse } from "../types";

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation<
    CreateProjectResponse,
    Error,
    { form: CreateProjectRequest }
  >({
    mutationFn: async ({ form }) => {
      const response = await client.api.projects.$post({ form });
      return handleApiResponse<CreateProjectResponse>(response);
    },
    onSuccess: () => {
      toast.success("Project created successfully");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (error) => {
      toast.error(`Failed to create project: ${error.message}`);
      console.error("Error creating project:", error);
    },
  });
};
