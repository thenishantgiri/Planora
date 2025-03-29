"use client";

import Link from "next/link";
import { ArrowLeftIcon, Loader, MoreVerticalIcon } from "lucide-react";
import { Fragment } from "react";

import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { useUpdateMember } from "@/features/members/api/use-update-member";
import { useDeleteMember } from "@/features/members/api/use-delete-member";

import { Button } from "@/components/ui/button";
import { useConfirm } from "@/hooks/use-confirm";
import { Separator } from "@/components/ui/separator";
import { DottedSeparator } from "@/components/dotted-separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MemberRole } from "@/features/members/types";
import { Badge } from "@/components/ui/badge";
import { snakeCaseToTitleCase } from "@/lib/utils";

export const MembersList = () => {
  const [ConfirmDialog, confirm] = useConfirm(
    "Remove member",
    "Are you sure you want to remove this member?",
    "destructive"
  );

  const workspaceId = useWorkspaceId();

  const { data, isLoading } = useGetMembers({ workspaceId });
  const { mutate: updateMember, isPending: isUpdatingMember } =
    useUpdateMember();
  const { mutate: deleteMember, isPending: isDeletingMember } =
    useDeleteMember();

  const handleUpdateMember = (memberId: string, role: MemberRole) => {
    updateMember({ json: { role }, param: { memberId } });
  };

  const handleDeleteMember = async (memberId: string) => {
    const ok = await confirm();
    if (!ok) return;

    deleteMember(
      { param: { memberId } },
      {
        onSuccess: () => {
          window.location.reload();
        },
      }
    );
  };

  return (
    <Card className="w-full h-full border-none shadow-none">
      <ConfirmDialog />
      <CardHeader className="flex flex-row items-center gap-x-4 p-7 space-y-0">
        <Button asChild variant="secondary" size="sm">
          <Link href={`/workspaces/${workspaceId}`}>
            <ArrowLeftIcon className="size-4 mr-2" />
            Back
          </Link>
        </Button>
        <CardTitle className="text-xl font-bold">Members List</CardTitle>
      </CardHeader>
      <div className="px-7">
        <DottedSeparator />
      </div>

      <CardContent className="p-7">
        {isLoading ? (
          <div className="w-full border rounded-lg h-[200px] flex flex-col items-center justify-center">
            <Loader className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          data?.documents.map((member, index) => (
            <Fragment key={member.$id}>
              <div className="flex items-center gap-4">
                <MemberAvatar
                  className="size-10"
                  fallbackClassName="text-lg"
                  name={member.name}
                />
                <div className="flex flex-col">
                  <p className="text-sm font-medium">{member.name}</p>
                  <Badge variant={MemberRole[member.role]}>
                    {snakeCaseToTitleCase(member.role)}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    {member.email}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="ml-auto" variant="secondary" size="icon">
                      <MoreVerticalIcon className="size-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="bottom" align="end">
                    <DropdownMenuItem
                      className="font-medium"
                      onClick={() => {
                        handleUpdateMember(member.$id, MemberRole.ADMIN);
                      }}
                      disabled={isUpdatingMember}
                    >
                      Set as Administrator
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="font-medium"
                      onClick={() => {
                        handleUpdateMember(member.$id, MemberRole.MEMBER);
                      }}
                      disabled={isUpdatingMember}
                    >
                      Set as Member
                    </DropdownMenuItem>
                    <DottedSeparator />
                    <DropdownMenuItem
                      className="font-medium text-amber-700"
                      onClick={() => {
                        handleDeleteMember(member.$id);
                      }}
                      disabled={isDeletingMember}
                    >
                      Remove {member.name}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {index < data.documents.length - 1 && (
                <Separator className="my-2.5" />
              )}
            </Fragment>
          ))
        )}
      </CardContent>
    </Card>
  );
};
