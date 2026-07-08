import { z } from "zod";

export const leaveTypeSchema = z.object({
  name: z.string().trim().min(1, "Leave type name is required."),
  defaultAnnualDays: z.coerce.number().min(0, "Must be zero or more."),
});

export const renameLeaveTypeSchema = leaveTypeSchema.extend({
  leaveTypeId: z.string().min(1),
});

export const deleteLeaveTypeSchema = z.object({
  leaveTypeId: z.string().min(1),
});

export const allocateBalancesSchema = z.object({
  leaveTypeId: z.string().min(1),
  year: z.coerce.number().int(),
});

export const createLeaveRequestSchema = z
  .object({
    leaveTypeId: z.string().min(1),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    reason: z.string().trim().optional(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date must be on or after the start date.",
    path: ["endDate"],
  });

export const leaveRequestIdSchema = z.object({
  requestId: z.string().min(1),
});
