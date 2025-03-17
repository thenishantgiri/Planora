import { createSessionClient } from "@/lib/appwrite";
import { getMember } from "@/features/members/utils";
import { DATABASE_ID, PROJECTS_ID } from "@/config";
import { Project } from "./types";
import { Query } from "node-appwrite";

interface GetProjectProps {
  projectId: string;
}

/**
 * Server-side query to get a project by ID
 * Checks if the current user is a member of the project's workspace
 *
 * @param projectId The ID of the project to retrieve
 * @returns The project if the user has access
 * @throws Error if user is not authorized or project is not found
 */
export const getProject = async ({
  projectId,
}: GetProjectProps): Promise<Project> => {
  const { databases, account } = await createSessionClient();

  const user = await account.get();

  const project = await databases.getDocument<Project>(
    DATABASE_ID,
    PROJECTS_ID,
    projectId
  );

  if (!project) {
    throw new Error("Project not found");
  }

  const member = await getMember({
    databases,
    workspaceId: project.workspaceId,
    userId: user.$id,
  });

  if (!member) {
    throw new Error("Unauthorized. You do not have access to this project.");
  }

  return project;
};

/**
 * Server-side query to get all projects for a workspace
 *
 * @param workspaceId ID of the workspace
 * @returns Array of projects
 * @throws Error if user is not authorized
 */
export const getProjects = async (
  workspaceId: string
): Promise<{ documents: Project[]; total: number }> => {
  const { databases, account } = await createSessionClient();

  const user = await account.get();

  const member = await getMember({
    databases,
    workspaceId,
    userId: user.$id,
  });

  if (!member) {
    throw new Error("Unauthorized. You are not a member of this workspace.");
  }

  const projects = await databases.listDocuments(DATABASE_ID, PROJECTS_ID, [
    Query.equal("workspaceId", workspaceId),
  ]);

  return {
    documents: projects.documents as Project[],
    total: projects.total,
  };
};
