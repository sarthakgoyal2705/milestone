import { z } from "zod";

export const uomEnum = z.enum(["MIN", "MAX", "TIMELINE", "ZERO"]);

export const createGoalSchema = z.object({
  thrustArea: z.string().trim().min(1, "Thrust area is required."),
  title: z.string().trim().min(1, "Title is required."),
  description: z.string().trim().min(1, "Description is required."),
  target: z.string().trim().min(1, "Target is required."),
  uom: uomEnum,
  weightage: z.coerce.number().int().min(1, "Weightage must be at least 1.").max(100),
});

export const updateGoalSchema = createGoalSchema.extend({
  goalId: z.string().min(1),
});

export const goalIdSchema = z.object({
  goalId: z.string().min(1),
});

export const deployGoalSchema = createGoalSchema.extend({
  employeeId: z.string().min(1),
});

export const checkInSchema = z.object({
  goalId: z.string().min(1),
  actual: z.string().trim().min(1, "Actual progress is required."),
  score: z.coerce.number().min(0).max(10).optional(),
});

export const createCycleSchema = z.object({
  name: z.string().trim().min(1, "Cycle name is required."),
});

export const activateCycleSchema = z.object({
  cycleId: z.string().min(1),
});
