"use client";

import { Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { LineItem } from "@/components/payroll/line-items-editor";

type Breakdown = {
  baseSalary: number;
  currency: string;
  allowances: LineItem[];
  deductions: LineItem[];
};

function money(currency: string, amount: number) {
  return `${currency} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function PayslipBreakdownDialog({
  breakdown,
  grossPay,
  netPay,
  periodLabel,
}: {
  breakdown: Breakdown;
  grossPay: number;
  netPay: number;
  periodLabel: string;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary">
          <Eye className="size-4" />
          View
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Payslip breakdown</DialogTitle>
          <DialogDescription>{periodLabel}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 text-sm">
          <div className="flex items-center justify-between border-b border-hairline pb-2">
            <span className="text-muted">Base salary</span>
            <span className="text-powder-100">{money(breakdown.currency, breakdown.baseSalary)}</span>
          </div>

          {breakdown.allowances.length > 0 && (
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Allowances</p>
              {breakdown.allowances.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-muted">{item.label}</span>
                  <span className="text-success">+{money(breakdown.currency, item.amount)}</span>
                </div>
              ))}
            </div>
          )}

          {breakdown.deductions.length > 0 && (
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Deductions</p>
              {breakdown.deductions.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-muted">{item.label}</span>
                  <span className="text-danger">-{money(breakdown.currency, item.amount)}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-hairline pt-2">
            <span className="text-muted">Gross pay</span>
            <span className="text-powder-100">{money(breakdown.currency, grossPay)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-powder-100">Net pay</span>
            <span className="font-display text-lg font-semibold text-teal">
              {money(breakdown.currency, netPay)}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
