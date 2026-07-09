"use client";

import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadPDF } from "@/lib/export";

type GenerateOfferLetterButtonProps = {
  candidateName: string;
  jobTitle: string;
};

export function GenerateOfferLetterButton({ candidateName, jobTitle }: GenerateOfferLetterButtonProps) {
  
  const handleGenerate = () => {
    // Generate a simple mock offer letter PDF using our existing PDF utility
    const title = `Offer of Employment: ${jobTitle}`;
    
    // We mock the details. In a real app we'd prompt for salary, start date, etc.
    const details = [
      ["Candidate Name", candidateName],
      ["Position", jobTitle],
      ["Start Date", new Date(Date.now() + 14 * 86400000).toLocaleDateString()],
      ["Base Salary", "$120,000 / year"],
      ["Status", "Full-time, Exempt"],
    ];

    downloadPDF(
      `${candidateName.replace(/\s+/g, "_")}_Offer_Letter`,
      title,
      ["Term", "Details"],
      details
    );
  };

  return (
    <Button size="sm" variant="outline" className="gap-2" onClick={handleGenerate}>
      <FileText className="size-4" />
      Generate Offer Letter
    </Button>
  );
}
