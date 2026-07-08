import { z } from "zod";

export const createTemplateSchema = z.object({
  name: z.string().trim().min(1, "Template name is required."),
});

export const addTaskSchema = z.object({
  templateId: z.string().min(1),
  title: z.string().trim().min(1, "Task title is required."),
});

export const deleteTaskSchema = z.object({
  taskId: z.string().min(1),
});

export const toggleTaskInstanceSchema = z.object({
  instanceId: z.string().min(1),
  isComplete: z.coerce.boolean(),
});
