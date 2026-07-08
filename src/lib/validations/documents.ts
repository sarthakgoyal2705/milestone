import { z } from "zod";

export const documentCategorySchema = z.enum([
  "ID_PROOF",
  "CONTRACT",
  "CERTIFICATE",
  "PAYSLIP",
  "OTHER",
]);

export const uploadDocumentMetaSchema = z.object({
  employeeId: z.string().min(1),
  category: documentCategorySchema,
});

export const deleteDocumentSchema = z.object({
  documentId: z.string().min(1),
});
