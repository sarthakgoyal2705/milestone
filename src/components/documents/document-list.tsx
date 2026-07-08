"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { FileText, Trash2 } from "lucide-react";
import { format } from "date-fns";

import { deleteDocumentAction } from "@/actions/documents";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { DocumentCategory } from "@/generated/prisma/enums";

const CATEGORY_LABELS: Record<DocumentCategory, string> = {
  ID_PROOF: "ID proof",
  CONTRACT: "Contract",
  CERTIFICATE: "Certificate",
  PAYSLIP: "Payslip",
  OTHER: "Other",
};

export type DocumentItem = {
  id: string;
  fileName: string;
  blobUrl: string;
  category: DocumentCategory;
  createdAt: Date;
};

function DeleteDocumentButton({ documentId }: { documentId: string }) {
  const [pending, startTransition] = useTransition();

  function run() {
    const formData = new FormData();
    formData.set("documentId", documentId);
    startTransition(async () => {
      const result = await deleteDocumentAction(undefined, formData);
      if (result?.success) toast.success("Document deleted.");
      else if (result?.error) toast.error(result.error);
    });
  }

  return (
    <Button size="icon" variant="ghost" onClick={run} disabled={pending}>
      <Trash2 className="size-4 text-danger" />
    </Button>
  );
}

export function DocumentList({ documents }: { documents: DocumentItem[] }) {
  if (documents.length === 0) {
    return <p className="py-6 text-center text-sm text-muted">No documents yet.</p>;
  }

  return (
    <div className="flex flex-col divide-y divide-hairline">
      {documents.map((document) => (
        <div key={document.id} className="flex items-center justify-between gap-3 py-3">
          <a
            href={document.blobUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-w-0 items-center gap-3 text-sm font-medium text-powder-100 hover:text-teal"
          >
            <FileText className="size-4 shrink-0 text-muted" />
            <span className="truncate">{document.fileName}</span>
          </a>
          <div className="flex shrink-0 items-center gap-3">
            <Badge variant="neutral">{CATEGORY_LABELS[document.category]}</Badge>
            <span className="text-xs text-muted">{format(document.createdAt, "MMM d, yyyy")}</span>
            <DeleteDocumentButton documentId={document.id} />
          </div>
        </div>
      ))}
    </div>
  );
}
