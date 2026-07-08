import { z } from "zod";

export const createJobPostingSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  departmentId: z.string().optional().nullable(),
  description: z.string().trim().min(1, "Description is required."),
});

export const toggleJobPostingSchema = z.object({
  jobPostingId: z.string().min(1),
  isOpen: z.coerce.boolean(),
});

export const createCandidateSchema = z.object({
  jobPostingId: z.string().min(1),
  name: z.string().trim().min(1, "Name is required."),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  resumeUrl: z.string().trim().url().optional().or(z.literal("")),
  notes: z.string().trim().optional(),
});

export const advanceCandidateSchema = z.object({
  candidateId: z.string().min(1),
  stage: z.enum(["APPLIED", "SCREENING", "INTERVIEW", "OFFER", "REJECTED"]),
});

export const hireCandidateSchema = z.object({
  candidateId: z.string().min(1),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .regex(/[0-9]/, "Password must contain at least one number."),
  jobTitle: z.string().trim().min(1, "Job title is required."),
  departmentId: z.string().optional().nullable(),
  managerId: z.string().optional().nullable(),
  hireDate: z.coerce.date(),
  onboardingTemplateId: z.string().optional().nullable(),
});
