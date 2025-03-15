import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client, handleApiResponse } from "@/lib/rpc";
import { DeleteMemberResponse, MemberIdParam } from "../types";

// Define the params type for this specific mutation
type DeleteMemberParams = {
  param: MemberIdParam;
};

export const useDeleteMember = () => {
  const queryClient = useQueryClient();

  return useMutation<DeleteMemberResponse, Error, DeleteMemberParams>({
    mutationFn: async ({ param }) => {
      const response = await client.api.members[":memberId"].$delete({
        param,
      });

      return handleApiResponse<DeleteMemberResponse>(response);
    },
    onSuccess: () => {
      toast.success("Member deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
    onError: (error) => {
      toast.error(`Failed to delete member: ${error.message}`);
      console.error("Error deleting member:", error);
    },
  });
};
