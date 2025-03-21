import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<(typeof client.api.auth.logout)["$post"]>;

export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error>({
    mutationFn: async () => {
      const response = await client.api.auth.logout["$post"]();
      const result = await response.json();

      if (!response.ok) {
        throw new Error("Failed to log out");
      }

      return result;
    },
    onSuccess: () => {
      toast.success("Logged out successfully");

      router.refresh();
      queryClient.invalidateQueries();
    },
    onError: (error) => {
      toast.error("Failed to log out");
      console.error(error);
    },
  });

  return mutation;
};
