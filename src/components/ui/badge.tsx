import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { TaskStatus } from "@/features/tasks/types";

import { cn } from "@/lib/utils";
import { MemberRole } from "@/features/members/types";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 w-fit",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
        [TaskStatus.BACKLOG]:
          "border-transparent bg-pink-200 text-pink-600 hover:bg-pink-200/90",
        [TaskStatus.TODO]:
          "border-transparent bg-red-200 text-red-600 hover:bg-red-200/90",
        [TaskStatus.IN_PROGRESS]:
          "border-transparent bg-yellow-200 text-yellow-600 hover:bg-yellow-200/90",
        [TaskStatus.IN_REVIEW]:
          "border-transparent bg-blue-200 text-blue-600 hover:bg-blue-200/90",
        [TaskStatus.DONE]:
          "border-transparent bg-emerald-200 text-emerald-600 hover:bg-emerald-200/90",
        [MemberRole.ADMIN]:
          "border-transparent bg-gray-800 text-white hover:bg-gray-700",
        [MemberRole.MEMBER]:
          "border-transparent bg-gray-300 text-gray-800 hover:bg-gray-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
