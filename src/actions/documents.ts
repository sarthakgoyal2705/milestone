"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/rbac";
import { uploadFile } from "@/lib/storage";
import { uploadDocumentMetaSchema, deleteDocumentSchema } from "@/lib/validations/documents";

export type ActionState = { error?: string; success?: boolean } | undefined;

const MAX_FILE_SIZE = 10 * 1024 * 1024;

async function requireManagerOfEmployee(
  session: Awaited<ReturnType<typeof requireSession>>,
  employeeId: string
) {
  if (session.user.role === "ADMIN") return true;
  if (session.user.employeeId === employeeId) return true;
  const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
  return employee?.managerId === session.user.employeeId;
}

export async function uploadDocumentAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireSession();

  const parsed = uploadDocumentMetaSchema.safeParse({
    employeeId: formData.get("employeeId"),
    category: formData.get("category"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const allowed = await requireManagerOfEmployee(session, parsed.data.employeeId);
  if (!allowed) return { error: "You cannot upload documents for this employee." };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a file to upload." };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { error: "File must be under 10MB." };
  }

  const { url } = await uploadFile(file, `documents/${parsed.data.employeeId}`);

  const employee = await prisma.employee.findUnique({ where: { id: parsed.data.employeeId } });
  if (!employee) return { error: "Employee not found." };

  await prisma.document.create({
    data: {
      employeeId: parsed.data.employeeId,
      category: parsed.data.category,
      fileName: file.name,
      blobUrl: url,
      uploadedById: session.user.id,
    },
  });

  if (employee.userId !== session.user.id) {
    await prisma.notification.create({
      data: {
        userId: employee.userId,
        type: "DOCUMENT_UPLOADED",
        title: "New document uploaded",
        body: `A new document (${file.name}) was added to your profile.`,
        linkUrl: "/documents",
      },
    });
  }

  revalidatePath("/documents");
  revalidatePath(`/directory/${parsed.data.employeeId}`);
  return { success: true };
}

export async function deleteDocumentAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireSession();
  const parsed = deleteDocumentSchema.safeParse({ documentId: formData.get("documentId") });
  if (!parsed.success) return { error: "Invalid input." };

  const document = await prisma.document.findUnique({ where: { id: parsed.data.documentId } });
  if (!document) return { error: "Document not found." };

  const allowed = await requireManagerOfEmployee(session, document.employeeId);
  if (!allowed) return { error: "You cannot delete this document." };

  await prisma.document.delete({ where: { id: document.id } });

  revalidatePath("/documents");
  revalidatePath(`/directory/${document.employeeId}`);
  return { success: true };
}
