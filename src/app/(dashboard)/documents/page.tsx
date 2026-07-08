import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { UploadDocumentDialog } from "@/components/documents/upload-document-dialog";
import { DocumentList } from "@/components/documents/document-list";

export default async function DocumentsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (!session.user.employeeId) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-powder-100">
          Documents
        </h1>
        <Card>
          <CardContent className="py-10 text-center text-muted">
            No employee profile is linked to this account.
          </CardContent>
        </Card>
      </div>
    );
  }

  const documents = await prisma.document.findMany({
    where: { employeeId: session.user.employeeId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-powder-100">
            Documents
          </h1>
          <p className="mt-1 text-muted">Your personal files and records.</p>
        </div>
        <UploadDocumentDialog employeeId={session.user.employeeId} />
      </div>

      <Card>
        <CardContent className="pt-6">
          <DocumentList documents={documents} />
        </CardContent>
      </Card>
    </div>
  );
}
