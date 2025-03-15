// src/features/members/types.ts
import { AppwriteDocument, ApiResult } from "@/types/api";

export enum MemberRole {
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
}

// Base Member type
export type Member = AppwriteDocument & {
  userId: string;
  workspaceId: string;
  role: MemberRole;
};

// Enhanced member with user information
// This explicitly extends Member to ensure all Member properties are included
export type PopulatedMember = Member & {
  name: string;
  email: string;
};

// Response Types
export type GetMembersResponse = ApiResult<{
  documents: PopulatedMember[];
  total: number;
}>;

export type DeleteMemberResponse = ApiResult<{ $id: string }>;

export type UpdateMemberResponse = ApiResult<{ $id: string }>;

// Request Types
export type GetMembersRequest = {
  workspaceId: string;
};

export type UpdateMemberRequest = {
  role: MemberRole;
};

// Params
export type MemberIdParam = {
  memberId: string;
};

// Route Types for type inference
export type MemberRouteTypes = {
  // GET /?workspaceId=x
  getMembers: {
    query: GetMembersRequest;
    response: GetMembersResponse;
  };
  // DELETE /:memberId
  deleteMember: {
    param: MemberIdParam;
    response: DeleteMemberResponse;
  };
  // PATCH /:memberId
  updateMember: {
    param: MemberIdParam;
    json: UpdateMemberRequest;
    response: UpdateMemberResponse;
  };
};
