import { redirect } from "next/navigation";

import { WorkspaceIdClient } from "./client";

import { getCurrent } from "@/features/auth/queries";

const WorkspaceIdPage = async () => {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  return <WorkspaceIdClient />;
};

export default WorkspaceIdPage;
