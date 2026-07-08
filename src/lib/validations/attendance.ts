import { z } from "zod";

export const clockOutSchema = z.object({
  entryId: z.string().min(1),
  notes: z.string().trim().optional(),
});
