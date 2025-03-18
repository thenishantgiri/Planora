import { z } from "zod";
import { getMember } from "@/features/members/utils";
import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import { DATABASE_ID, IMAGES_BUCKET_ID, PROJECTS_ID } from "@/config";
import { createProjectSchema, updateProjectSchema } from "../schemas";
import {
  Project,
  CreateProjectResponse,
  GetProjectsResponse,
  UpdateProjectResponse,
  DeleteProjectResponse,
} from "../types";
import { AppVariables } from "@/types/context";

// Constants for error messages
const ERRORS = {
  UNAUTHORIZED: "Unauthorized. You do not have access to this resource.",
  PROJECT_NOT_FOUND: "Project not found. Please provide a valid project ID.",
  WORKSPACE_REQUIRED: "Workspace ID is required.",
  NOT_MEMBER: "You are not a member of this workspace.",
};

// Create a typed Hono app
const app = new Hono<{
  Variables: AppVariables;
}>()

  // POST / - Create a new project
  .post(
    "/",
    sessionMiddleware,
    zValidator("form", createProjectSchema),
    async (c) => {
      const databases = c.get("databases");
      const storage = c.get("storage");
      const user = c.get("user");

      const { name, image, workspaceId } = c.req.valid("form");

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: ERRORS.UNAUTHORIZED, status: 401 });
      }

      let uploadedImageUrl: string | undefined;

      if (image instanceof File) {
        const file = await storage.createFile(
          IMAGES_BUCKET_ID,
          ID.unique(),
          image
        );

        const arrayBuffer = await storage.getFilePreview(
          IMAGES_BUCKET_ID,
          file.$id
        );

        uploadedImageUrl = `data:image/png;base64,${Buffer.from(
          arrayBuffer
        ).toString("base64")}`;
      }

      const projectDoc = await databases.createDocument(
        DATABASE_ID,
        PROJECTS_ID,
        ID.unique(),
        {
          name,
          imageUrl: uploadedImageUrl,
          workspaceId,
        }
      );

      // Cast the document to Project type
      const project = projectDoc as unknown as Project;

      // Return type-safe response
      const response: CreateProjectResponse = { data: project };
      return c.json(response);
    }
  )

  // GET /?workspaceId=x - Get all projects for a workspace
  .get(
    "/",
    sessionMiddleware,
    zValidator("query", z.object({ workspaceId: z.string() })),
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");

      const { workspaceId } = c.req.valid("query");

      if (!workspaceId) {
        return c.json({ error: ERRORS.WORKSPACE_REQUIRED, status: 400 });
      }

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: ERRORS.NOT_MEMBER, status: 403 });
      }

      const projectsList = await databases.listDocuments(
        DATABASE_ID,
        PROJECTS_ID,
        [Query.equal("workspaceId", workspaceId), Query.orderDesc("$createdAt")]
      );

      // Cast the documents to Project type
      const projects = {
        documents: projectsList.documents as unknown as Project[],
        total: projectsList.total,
      };

      // Return type-safe response
      const response: GetProjectsResponse = { data: projects };
      return c.json(response);
    }
  )

  // GET /:projectId - Get a project
  .get("/:projectId", sessionMiddleware, async (c) => {
    const { projectId } = c.req.param();
    const databases = c.get("databases");
    const user = c.get("user");

    try {
      // Get the project
      const project = await databases.getDocument(
        DATABASE_ID,
        PROJECTS_ID,
        projectId
      );

      // Check if the user is a member of the workspace
      const member = await getMember({
        databases,
        workspaceId: project.workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({
          error: "Unauthorized. You don't have access to this project.",
          status: 401,
        });
      }

      // Return the project with standard response format
      return c.json({ data: project });
    } catch (error) {
      console.error(`Error fetching project ${projectId}:`, error);
      return c.json({ error: "Project not found", status: 404 });
    }
  })

  // PATCH /:projectId - Update a project
  .patch(
    "/:projectId",
    sessionMiddleware,
    zValidator("form", updateProjectSchema),
    async (c) => {
      const databases = c.get("databases");
      const storage = c.get("storage");
      const user = c.get("user");

      const { projectId } = c.req.param();
      const { name, image } = c.req.valid("form");

      // Find the existing project
      const existingProject = await databases.getDocument<Project>(
        DATABASE_ID,
        PROJECTS_ID,
        projectId
      );

      if (!existingProject) {
        return c.json({ error: ERRORS.PROJECT_NOT_FOUND, status: 404 });
      }

      // Check if user is a member of the project's workspace
      const member = await getMember({
        databases,
        workspaceId: existingProject.workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: ERRORS.UNAUTHORIZED, status: 401 });
      }

      // Handle image upload if provided
      let uploadedImageUrl: string | undefined;

      if (image instanceof File) {
        const file = await storage.createFile(
          IMAGES_BUCKET_ID,
          ID.unique(),
          image
        );

        const arrayBuffer = await storage.getFilePreview(
          IMAGES_BUCKET_ID,
          file.$id
        );

        uploadedImageUrl = `data:image/png;base64,${Buffer.from(
          arrayBuffer
        ).toString("base64")}`;
      } else {
        uploadedImageUrl = image;
      }

      // Update the project
      const projectDoc = await databases.updateDocument(
        DATABASE_ID,
        PROJECTS_ID,
        projectId,
        {
          name,
          imageUrl: uploadedImageUrl,
        }
      );

      // Cast the document to Project type
      const project = projectDoc as unknown as Project;

      // Return type-safe response
      const response: UpdateProjectResponse = { data: project };
      return c.json(response);
    }
  )

  // DELETE /:projectId - Delete a project
  .delete("/:projectId", sessionMiddleware, async (c) => {
    const databases = c.get("databases");
    const user = c.get("user");

    const { projectId } = c.req.param();

    // Find the existing project
    const existingProject = await databases.getDocument<Project>(
      DATABASE_ID,
      PROJECTS_ID,
      projectId
    );

    if (!existingProject) {
      return c.json({ error: ERRORS.PROJECT_NOT_FOUND, status: 404 });
    }

    // Check if user is a member of the project's workspace
    const member = await getMember({
      databases,
      workspaceId: existingProject.workspaceId,
      userId: user.$id,
    });

    if (!member) {
      return c.json({ error: ERRORS.UNAUTHORIZED, status: 401 });
    }

    // TODO: Delete tasks

    // Delete the project
    await databases.deleteDocument(DATABASE_ID, PROJECTS_ID, projectId);

    // Return type-safe response
    const response: DeleteProjectResponse = { data: { $id: projectId } };
    return c.json(response);
  })

  // Health check endpoint for API status monitoring
  .get("/status", async (c) => {
    try {
      // Do a lightweight DB operation to verify everything works
      await c
        .get("databases")
        .listDocuments(DATABASE_ID, PROJECTS_ID, [Query.limit(1)]);

      return c.json({
        status: "operational",
        service: "projects-api",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("API Status check failed:", errorMessage);
      return c.json(
        {
          status: "degraded",
          service: "projects-api",
          error: errorMessage,
          timestamp: new Date().toISOString(),
        },
        500
      );
    }
  });

export default app;

// Export the type for client-side type inference
export type ProjectAPI = typeof app;
