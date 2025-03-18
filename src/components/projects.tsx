"use client";

import { RiAddCircleFill } from "react-icons/ri";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";

import { cn } from "@/lib/utils";

import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useCreateProjectModal } from "@/features/projects/hooks/use-create-project-modal";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { Project } from "@/features/projects/types";

// Helper function to create project routes
const createProjectRoute = (workspaceId: string, projectId: string) => ({
  path: `/workspaces/${workspaceId}/projects/${projectId}`,
  href: `/workspaces/${workspaceId}/projects/${projectId}?projectId=${projectId}`,
});

const Projects = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { open } = useCreateProjectModal();
  const workspaceId = useWorkspaceId();
  const { data } = useGetProjects({ workspaceId });

  // Function to check if a project is active
  const isProjectActive = (projectId: string) => {
    // Check both path and query parameter to determine if active
    const isPathActive = pathname.includes(`/projects/${projectId}`);
    const isQueryActive = searchParams.get("projectId") === projectId;

    return isPathActive || isQueryActive;
  };

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase text-neutral-500">Projects</p>
        <RiAddCircleFill
          onClick={open}
          className="size-5 text-neutral-500 cursor-pointer hover:opacity-75 transition"
        />
      </div>
      {data?.documents.map((project: Project) => {
        const { href } = createProjectRoute(workspaceId, project.$id);
        const isActive = isProjectActive(project.$id);

        return (
          <Link href={href} key={project.$id}>
            <div
              className={cn(
                "flex items-center gap-2.5 p-2.5 rounded-md hover:opacity-75 transition cursor-pointer text-neutral-500",
                isActive && "bg-white shadow-sm hover:opacity-100 text-primary"
              )}
            >
              <ProjectAvatar image={project.imageUrl} name={project.name} />
              <span className="truncate">{project.name}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default Projects;
