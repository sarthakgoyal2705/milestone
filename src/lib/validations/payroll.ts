import { z } from "zod";

export const lineItemSchema = z.object({
  label: z.string().trim().min(1),
  amount: z.coerce.number(),
});

export const lineItemsJsonSchema = z
  .string()
  .transform((value, ctx) => {
    try {
      const parsed = JSON.parse(value);
      const result = z.array(lineItemSchema).safeParse(parsed);
      if (!result.success) {
        ctx.addIssue({ code: "custom", message: "Invalid line items." });
        return z.NEVER;
      }
      return result.data;
    } catch {
      ctx.addIssue({ code: "custom", message: "Invalid line items." });
      return z.NEVER;
    }
  });

export const upsertSalaryStructureSchema = z.object({
  employeeId: z.string().min(1),
  baseSalary: z.coerce.number().min(0, "Base salary must be zero or more."),
  currency: z.string().trim().min(1).max(3).default("USD"),
  allowances: lineItemsJsonSchema,
  deductions: lineItemsJsonSchema,
  effectiveFrom: z.coerce.date(),
});

export const generatePayslipSchema = z
  .object({
    employeeId: z.string().min(1),
    periodStart: z.coerce.date(),
    periodEnd: z.coerce.date(),
  })
  .refine((data) => data.periodEnd >= data.periodStart, {
    message: "Period end must be on or after the start.",
    path: ["periodEnd"],
  });
