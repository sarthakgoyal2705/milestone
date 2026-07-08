import { redirect } from "next/navigation";
import { format } from "date-fns";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PayslipBreakdownDialog } from "@/components/payroll/payslip-breakdown-dialog";
import type { LineItem } from "@/components/payroll/line-items-editor";

export default async function PayslipsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (!session.user.employeeId) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-powder-100">
          Payslips
        </h1>
        <Card>
          <CardContent className="py-10 text-center text-muted">
            No employee profile is linked to this account.
          </CardContent>
        </Card>
      </div>
    );
  }

  const payslips = await prisma.payslip.findMany({
    where: { employeeId: session.user.employeeId },
    orderBy: { periodStart: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-powder-100">
          Payslips
        </h1>
        <p className="mt-1 text-muted">Your pay history.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Gross pay</TableHead>
                <TableHead>Net pay</TableHead>
                <TableHead>Generated</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {payslips.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted">
                    No payslips yet.
                  </TableCell>
                </TableRow>
              )}
              {payslips.map((payslip) => {
                const breakdown = payslip.breakdown as {
                  baseSalary: number;
                  currency: string;
                  allowances: LineItem[];
                  deductions: LineItem[];
                };
                const periodLabel = `${format(payslip.periodStart, "MMM d, yyyy")} – ${format(payslip.periodEnd, "MMM d, yyyy")}`;
                return (
                  <TableRow key={payslip.id}>
                    <TableCell className="font-medium text-powder-100">{periodLabel}</TableCell>
                    <TableCell className="text-muted">
                      {breakdown.currency} {Number(payslip.grossPay).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-muted">
                      {breakdown.currency} {Number(payslip.netPay).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-muted">
                      {format(payslip.generatedAt, "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <PayslipBreakdownDialog
                        breakdown={breakdown}
                        grossPay={Number(payslip.grossPay)}
                        netPay={Number(payslip.netPay)}
                        periodLabel={periodLabel}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
