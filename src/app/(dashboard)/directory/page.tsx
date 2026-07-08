import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmployeeFilters } from "@/components/directory/employee-filters";
import { AddEmployeeDialog } from "@/components/directory/add-employee-dialog";
import { Settings2 } from "lucide-react";
import type { EmploymentStatus } from "@/generated/prisma/enums";

const STATUS_VARIANT: Record<EmploymentStatus, "success" | "warning" | "danger"> = {
  ACTIVE: "success",
  ON_LEAVE: "warning",
  TERMINATED: "danger",
};

function initials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; department?: string; status?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { q, department, status } = await searchParams;
  const isAdmin = session.user.role === "ADMIN";

  const employees = await prisma.employee.findMany({
    where: {
      ...(q
        ? {
            OR: [
              { firstName: { contains: q, mode: "insensitive" } },
              { lastName: { contains: q, mode: "insensitive" } },
              { jobTitle: { contains: q, mode: "insensitive" } },
              { user: { email: { contains: q, mode: "insensitive" } } },
            ],
          }
        : {}),
      ...(department && department !== "all" ? { departmentId: department } : {}),
      ...(status && status !== "all" ? { status: status as EmploymentStatus } : {}),
    },
    include: { department: true, manager: true, user: true },
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
  });

  const departments = await prisma.department.findMany({ orderBy: { name: "asc" } });
  const managers = await prisma.employee.findMany({
    select: { id: true, firstName: true, lastName: true },
    orderBy: [{ firstName: "asc" }],
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-powder-100">
            Directory
          </h1>
          <p className="mt-1 text-muted">
            {employees.length} {employees.length === 1 ? "person" : "people"} across{" "}
            {departments.length} {departments.length === 1 ? "department" : "departments"}
          </p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="md" asChild>
              <Link href="/directory/departments">
                <Settings2 className="size-4" />
                Departments
              </Link>
            </Button>
            <AddEmployeeDialog departments={departments} managers={managers} />
          </div>
        )}
      </div>

      <EmployeeFilters departments={departments} />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Job title</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted">
                    No one matches these filters.
                  </TableCell>
                </TableRow>
              )}
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <Link
                      href={`/directory/${employee.id}`}
                      className="flex items-center gap-3 font-medium text-powder-100 hover:text-teal"
                    >
                      <Avatar>
                        <AvatarFallback>
                          {initials(employee.firstName, employee.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      {employee.firstName} {employee.lastName}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted">{employee.jobTitle}</TableCell>
                  <TableCell className="text-muted">
                    {employee.department?.name ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted">
                    {employee.manager
                      ? `${employee.manager.firstName} ${employee.manager.lastName}`
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="neutral">{employee.user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[employee.status]}>
                      {employee.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
