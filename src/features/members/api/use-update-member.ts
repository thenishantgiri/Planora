import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client, handleApiResponse } from "@/lib/rpc";
import {
  MemberIdParam,
  UpdateMemberRequest,
  UpdateMemberResponse,
} from "../types";

// Define the params type for this specific mutation
type UpdateMemberParams = {
  param: MemberIdParam;
  json: UpdateMemberRequest;
};

export const useUpdateMember = () => {
  const queryClient = useQueryClient();

  return useMutation<UpdateMemberResponse, Error, UpdateMemberParams>({
    mutationFn: async ({ param, json }) => {
      const response = await client.api.members[":memberId"].$patch({
        param,
        json,
      });

      return handleApiResponse<UpdateMemberResponse>(response);
    },
    onSuccess: () => {
      toast.success("Member updated successfully");
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
    onError: (error) => {
      toast.error(`Failed to update member: ${error.message}`);
      console.error("Error updating member:", error);
    },
  });
};
