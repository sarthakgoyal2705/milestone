import { z } from "zod";

export const updateEmployeeSchema = z.object({
  employeeId: z.string().min(1),
  firstName: z.string().trim().min(1, "First name is required."),
  lastName: z.string().trim().min(1, "Last name is required."),
  jobTitle: z.string().trim().min(1, "Job title is required."),
  phone: z.string().trim().optional().nullable(),
  role: z.enum(["EMPLOYEE", "MANAGER", "ADMIN"]),
  status: z.enum(["ACTIVE", "ON_LEAVE", "TERMINATED"]),
  departmentId: z.string().optional().nullable(),
  managerId: z.string().optional().nullable(),
  hireDate: z.coerce.date(),
});

export const departmentNameSchema = z.object({
  name: z.string().trim().min(1, "Department name is required."),
});

export const renameDepartmentSchema = departmentNameSchema.extend({
  departmentId: z.string().min(1),
});

export const deleteDepartmentSchema = z.object({
  departmentId: z.string().min(1),
});
