import { AppwriteDocument, ApiResult } from "@/types/api";
import { z } from "zod";
import { createProjectSchema, updateProjectSchema } from "./schemas";

// Base Project Type
export type Project = AppwriteDocument & {
  name: string;
  imageUrl: string;
  workspaceId: string;
};

// Response Types
export type GetProjectsResponse = ApiResult<{
  documents: Project[];
  total: number;
}>;

export type GetProjectResponse = ApiResult<Project>;

export type CreateProjectResponse = ApiResult<Project>;

export type UpdateProjectResponse = ApiResult<Project>;

export type DeleteProjectResponse = ApiResult<{ $id: string }>;

// Request Types
export type CreateProjectRequest = z.infer<typeof createProjectSchema>;

export type UpdateProjectRequest = z.infer<typeof updateProjectSchema>;

// Params
export type ProjectIdParam = {
  projectId: string;
};

export type GetProjectsQuery = {
  workspaceId: string;
};

// Route Types for type inference
export type ProjectRouteTypes = {
  // POST /
  createProject: {
    form: CreateProjectRequest;
    response: CreateProjectResponse;
  };
  // GET /?workspaceId=x
  getProjects: {
    query: GetProjectsQuery;
    response: GetProjectsResponse;
  };
  // PATCH /:projectId
  updateProject: {
    param: ProjectIdParam;
    form: UpdateProjectRequest;
    response: UpdateProjectResponse;
  };
  // DELETE /:projectId
  deleteProject: {
    param: ProjectIdParam;
    response: DeleteProjectResponse;
  };
};
