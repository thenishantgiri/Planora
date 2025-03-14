import { useParams } from "next/navigation";

export const useInviteCode = () => {
  const { inviteCode } = useParams();
  return inviteCode as string;
};
