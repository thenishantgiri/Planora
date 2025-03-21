"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";

import { UserButton } from "@/features/auth/components/user-button";
import { MobileSidebar } from "./mobile-sidebar";

// Move outside component to prevent recreation on each render
const PATHNAME_MAP = {
  tasks: {
    title: "Tasks",
    description: "Create, assign, and manage tasks for your projects.",
  },
  projects: {
    title: "Projects",
    description: "Create, manage, and track progress on your projects.",
  },
} as const;

const DEFAULT_MAP = {
  title: "Home",
  description:
    "Effortlessly plan, track, and manage all your projects in one place.",
} as const;

export const Navbar = () => {
  const pathname = usePathname();

  // Use useMemo to prevent unnecessary recalculations on re-renders
  const { title, description } = useMemo(() => {
    // URLs like:
    // /workspaces/:workspaceId
    // /workspaces/:workspaceId/projects
    // /workspaces/:workspaceId/projects/:projectId
    // /workspaces/:workspaceId/tasks
    // /workspaces/:workspaceId/tasks/:taskId

    const pathnameParts = pathname.split("/");

    // For a URL like /workspaces/:workspaceId/projects/:projectId
    // pathnameParts would be ['', 'workspaces', ':workspaceId', 'projects', ':projectId']
    // We want to identify the section (projects, tasks) which is at index 3

    const key = pathnameParts[3];

    if (key && key in PATHNAME_MAP) {
      return PATHNAME_MAP[key as keyof typeof PATHNAME_MAP];
    }

    return DEFAULT_MAP;
  }, [pathname]);

  return (
    <nav className="pt-4 px-6 flex items-center justify-between">
      <div className="flex-col hidden lg:flex">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <MobileSidebar />
      <UserButton />
    </nav>
  );
};
