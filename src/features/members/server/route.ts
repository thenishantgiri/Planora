import { z } from "zod";
import { Hono } from "hono";
import { Query } from "node-appwrite";
import { zValidator } from "@hono/zod-validator";

import { sessionMiddleware } from "@/lib/session-middleware";
import { createAdminClient } from "@/lib/appwrite";
import { getMember } from "../utils";
import { DATABASE_ID, MEMBERS_ID } from "@/config";
import {
  MemberRole,
  GetMembersResponse,
  DeleteMemberResponse,
  UpdateMemberResponse,
  PopulatedMember,
  Member,
} from "../types";
import { AppVariables } from "@/types/context";

// Constants for error messages
const ERRORS = {
  UNAUTHORIZED:
    "Unauthorized. Only admins or the member themselves can perform this action.",
  MEMBER_NOT_FOUND: "Member not found. Please provide a valid member ID.",
  LAST_MEMBER: "Cannot delete or downgrade the last member in the workspace.",
};

// Utility function to check if the current user is authorized
const isAuthorized = (
  member: { $id: string; role: MemberRole },
  memberToActOn: { $id: string },
  allowedRoles = [MemberRole.ADMIN]
) => {
  return member.$id === memberToActOn.$id || allowedRoles.includes(member.role);
};

// Create a typed Hono app
const app = new Hono<{
  Variables: {
    Variables: AppVariables;
  };
}>()

  // GET /?workspaceId=x - Get all members in a workspace
  .get(
    "/",
    sessionMiddleware,
    zValidator("query", z.object({ workspaceId: z.string() })),
    async (c) => {
      const { users } = await createAdminClient();
      const { workspaceId } = c.req.valid("query");
      const databases = c.get("databases");
      const user = c.get("user");

      // Check if the current user is a member of the workspace
      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: ERRORS.UNAUTHORIZED, status: 401 });
      }

      // Fetch all members in the workspace
      const members = await databases.listDocuments(DATABASE_ID, MEMBERS_ID, [
        Query.equal("workspaceId", workspaceId),
      ]);

      // Explicitly type the members.documents as Member[]
      const typedMembers = members.documents as unknown as Member[];

      // Populate member details with user information with explicit typing
      const populatedMembers = await Promise.all(
        typedMembers.map(async (member) => {
          const user = await users.get(member.userId);
          // Create a properly typed populated member
          const populatedMember: PopulatedMember = {
            ...member, // This preserves userId, workspaceId, role
            name: user.name,
            email: user.email,
          };
          return populatedMember;
        })
      );

      // Return the populated members with type safety
      const response: GetMembersResponse = {
        data: {
          ...members,
          documents: populatedMembers,
        },
      };
      return c.json(response);
    }
  )

  // DELETE /:memberId - Delete a member
  .delete("/:memberId", sessionMiddleware, async (c) => {
    const { memberId } = c.req.param();
    const databases = c.get("databases");
    const user = c.get("user");

    // Fetch the member to delete
    const memberToDelete = await databases.getDocument(
      DATABASE_ID,
      MEMBERS_ID,
      memberId
    );

    // Check if the member exists
    if (!memberToDelete) {
      return c.json({ error: ERRORS.MEMBER_NOT_FOUND, status: 404 });
    }

    // Fetch the current user's membership in the workspace
    const member = await getMember({
      databases,
      workspaceId: memberToDelete.workspaceId,
      userId: user.$id,
    });

    // Check if the current user is authorized
    if (!member || !isAuthorized(member, memberToDelete)) {
      return c.json({ error: ERRORS.UNAUTHORIZED, status: 401 });
    }

    // Fetch all members in the workspace
    const allMembersInWorkspace = await databases.listDocuments(
      DATABASE_ID,
      MEMBERS_ID,
      [Query.equal("workspaceId", memberToDelete.workspaceId)]
    );

    // Check if the member to delete is the last member in the workspace
    if (allMembersInWorkspace.documents.length === 1) {
      return c.json({ error: ERRORS.LAST_MEMBER, status: 400 });
    }

    // Delete the member
    await databases.deleteDocument(DATABASE_ID, MEMBERS_ID, memberId);

    // Return success response with type safety
    const response: DeleteMemberResponse = {
      data: { $id: memberToDelete.$id },
    };
    return c.json(response);
  })

  // PATCH /:memberId - Update a member's role
  .patch(
    "/:memberId",
    sessionMiddleware,
    zValidator("json", z.object({ role: z.nativeEnum(MemberRole) })),
    async (c) => {
      const { memberId } = c.req.param();
      const { role } = c.req.valid("json");
      const databases = c.get("databases");
      const user = c.get("user");

      // Fetch the member to update
      const memberToUpdate = await databases.getDocument(
        DATABASE_ID,
        MEMBERS_ID,
        memberId
      );

      // Check if the member exists
      if (!memberToUpdate) {
        return c.json({ error: ERRORS.MEMBER_NOT_FOUND, status: 404 });
      }

      // Fetch the current user's membership in the workspace
      const member = await getMember({
        databases,
        workspaceId: memberToUpdate.workspaceId,
        userId: user.$id,
      });

      // Check if the current user is authorized
      if (!member || !isAuthorized(member, memberToUpdate)) {
        return c.json({ error: ERRORS.UNAUTHORIZED, status: 401 });
      }

      // Prevent from assigning the same role
      if (memberToUpdate.role === role) {
        return c.json({
          error: "The member already has the specified role.",
          status: 400,
        });
      }

      // Prevent non-admins from making anyone an admin
      if (role === MemberRole.ADMIN && member.role !== MemberRole.ADMIN) {
        return c.json({
          error: "Only admins can assign the admin role.",
          status: 403,
        });
      }

      // Prevent users from making themselves admin
      if (member.$id === memberToUpdate.$id && role === MemberRole.ADMIN) {
        return c.json({
          error: "You cannot make yourself an admin.",
          status: 403,
        });
      }

      // Fetch all members in the workspace
      const allMembersInWorkspace = await databases.listDocuments(
        DATABASE_ID,
        MEMBERS_ID,
        [Query.equal("workspaceId", memberToUpdate.workspaceId)]
      );

      // Check if the member to update is the last admin in the workspace
      const admins = allMembersInWorkspace.documents.filter(
        (m) => m.role === MemberRole.ADMIN
      );

      if (
        memberToUpdate.role === MemberRole.ADMIN &&
        admins.length === 1 &&
        admins[0].$id === memberToUpdate.$id
      ) {
        return c.json({
          error: "Cannot downgrade the last admin in the workspace.",
          status: 400,
        });
      }

      // Update the member's role
      await databases.updateDocument(DATABASE_ID, MEMBERS_ID, memberId, {
        role,
      });

      // Return success response with type safety
      const response: UpdateMemberResponse = {
        data: { $id: memberToUpdate.$id },
      };
      return c.json(response);
    }
  );

export default app;

// Export the type for client-side type inference
export type MemberAPI = typeof app;
