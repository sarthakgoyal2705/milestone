"use client";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Generate and download a CSV file.
 */
export function downloadCSV(
  filename: string,
  headers: string[],
  rows: string[][]
) {
  const escape = (val: string) => {
    if (val.includes(",") || val.includes('"') || val.includes("\n")) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  const csvContent = [
    headers.map(escape).join(","),
    ...rows.map((row) => row.map(escape).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Generate and download a PDF with a table.
 */
export function downloadPDF(
  filename: string,
  title: string,
  headers: string[],
  rows: string[][]
) {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.text(title, 14, 22);

  // Date
  doc.setFontSize(10);
  doc.setTextColor(128);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);

  // Table
  autoTable(doc, {
    startY: 36,
    head: [headers],
    body: rows,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [176, 132, 1] }, // rust color
  });

  doc.save(`${filename}.pdf`);
}
