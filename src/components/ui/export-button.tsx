"use client";

import { Download, FileSpreadsheet, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { downloadCSV, downloadPDF } from "@/lib/export";

type ExportButtonProps = {
  filename: string;
  title: string;
  headers: string[];
  rows: string[][];
};

export function ExportButton({ filename, title, headers, rows }: ExportButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="sm" className="gap-2">
          <Download className="size-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => downloadCSV(filename, headers, rows)}
          className="gap-2"
        >
          <FileSpreadsheet className="size-4" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => downloadPDF(filename, title, headers, rows)}
          className="gap-2"
        >
          <FileText className="size-4" />
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
