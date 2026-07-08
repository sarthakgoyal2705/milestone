import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SalaryStructureDialog } from "@/components/payroll/salary-structure-dialog";
import { GeneratePayslipDialog } from "@/components/payroll/generate-payslip-dialog";
import type { LineItem } from "@/components/payroll/line-items-editor";

export default async function PayrollPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/payslips");

  const employees = await prisma.employee.findMany({
    where: { status: { not: "TERMINATED" } },
    include: { salaryStructure: true, _count: { select: { payslips: true } } },
    orderBy: [{ firstName: "asc" }],
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-powder-100">
          Payroll
        </h1>
        <p className="mt-1 text-muted">Manage salary structures and generate payslips.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Base salary</TableHead>
                <TableHead>Payslips</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => {
                const structure = employee.salaryStructure;
                const employeeName = `${employee.firstName} ${employee.lastName}`;
                return (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium text-powder-100">{employeeName}</TableCell>
                    <TableCell className="text-muted">
                      {structure ? (
                        `${structure.currency} ${Number(structure.baseSalary).toLocaleString()}`
                      ) : (
                        <Badge variant="neutral">Not set</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted">{employee._count.payslips}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <SalaryStructureDialog
                          employeeId={employee.id}
                          employeeName={employeeName}
                          existing={
                            structure
                              ? {
                                  baseSalary: Number(structure.baseSalary),
                                  currency: structure.currency,
                                  allowances: structure.allowances as LineItem[],
                                  deductions: structure.deductions as LineItem[],
                                  effectiveFrom: structure.effectiveFrom,
                                }
                              : undefined
                          }
                        />
                        {structure && (
                          <GeneratePayslipDialog employeeId={employee.id} employeeName={employeeName} />
                        )}
                      </div>
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
