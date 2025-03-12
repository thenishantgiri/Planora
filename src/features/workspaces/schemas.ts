import { z } from "zod";

export const createWorkspaceSchema = z.object({
  name: z.string().nonempty().min(1, "Required"),
});
