import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(1, "Required").max(50).trim(),
  image: z
    .union([
      z.instanceof(File),
      z.string().transform((value) => (value === "" ? undefined : value)),
    ])
    .optional(),
  workspaceId: z.string(),
});

export const updateProjectSchema = z.object({
  name: z
    .string()
    .min(1, "Minimum 1 character required")
    .max(50)
    .trim()
    .optional(),
  image: z
    .union([
      z.instanceof(File),
      z.string().transform((value) => (value === "" ? undefined : value)),
    ])
    .optional(),
});
