import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { format } from "date-fns";
import { Mail, Phone, Calendar, Building2 } from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EditEmployeeDialog } from "@/components/directory/edit-employee-dialog";
import { UploadDocumentDialog } from "@/components/documents/upload-document-dialog";
import { DocumentList } from "@/components/documents/document-list";
import type { EmploymentStatus } from "@/generated/prisma/enums";

const STATUS_VARIANT: Record<EmploymentStatus, "success" | "warning" | "danger"> = {
  ACTIVE: "success",
  ON_LEAVE: "warning",
  TERMINATED: "danger",
};

function initials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}

export default async function EmployeeProfilePage({
  params,
}: {
  params: Promise<{ employeeId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { employeeId } = await params;

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: {
      user: true,
      department: true,
      manager: true,
      directReports: { orderBy: [{ firstName: "asc" }] },
    },
  });

  if (!employee) notFound();

  const isAdmin = session.user.role === "ADMIN";
  const isSelf = session.user.employeeId === employee.id;
  const isManager = employee.managerId === session.user.employeeId;
  const canManageDocuments = isAdmin || isSelf || isManager;

  const [departments, managers, documents] = await Promise.all([
    isAdmin ? prisma.department.findMany({ orderBy: { name: "asc" } }) : Promise.resolve([]),
    isAdmin
      ? prisma.employee.findMany({
          select: { id: true, firstName: true, lastName: true },
          orderBy: [{ firstName: "asc" }],
        })
      : Promise.resolve([]),
    canManageDocuments
      ? prisma.document.findMany({ where: { employeeId: employee.id }, orderBy: { createdAt: "desc" } })
      : Promise.resolve([]),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarFallback className="text-lg">
              {initials(employee.firstName, employee.lastName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-powder-100">
              {employee.firstName} {employee.lastName}
            </h1>
            <p className="mt-0.5 text-muted">{employee.jobTitle}</p>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="neutral">{employee.user.role}</Badge>
              <Badge variant={STATUS_VARIANT[employee.status]}>
                {employee.status.replace("_", " ")}
              </Badge>
            </div>
          </div>
        </div>
        {isAdmin && (
          <EditEmployeeDialog employee={employee} departments={departments} managers={managers} />
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contact & role</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted">
              <Mail className="size-4" />
              {employee.user.email}
            </div>
            {employee.phone && (
              <div className="flex items-center gap-2 text-muted">
                <Phone className="size-4" />
                {employee.phone}
              </div>
            )}
            <div className="flex items-center gap-2 text-muted">
              <Building2 className="size-4" />
              {employee.department?.name ?? "No department"}
            </div>
            <div className="flex items-center gap-2 text-muted">
              <Calendar className="size-4" />
              Hired {format(employee.hireDate, "MMM d, yyyy")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Manager</CardTitle>
          </CardHeader>
          <CardContent>
            {employee.manager ? (
              <Link
                href={`/directory/${employee.manager.id}`}
                className="flex items-center gap-3 text-sm font-medium text-powder-100 hover:text-teal"
              >
                <Avatar>
                  <AvatarFallback>
                    {initials(employee.manager.firstName, employee.manager.lastName)}
                  </AvatarFallback>
                </Avatar>
                {employee.manager.firstName} {employee.manager.lastName}
              </Link>
            ) : (
              <p className="text-sm text-muted">No manager assigned.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Direct reports ({employee.directReports.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {employee.directReports.length === 0 && (
              <p className="text-sm text-muted">No direct reports.</p>
            )}
            {employee.directReports.map((report) => (
              <Link
                key={report.id}
                href={`/directory/${report.id}`}
                className="flex items-center gap-3 text-sm font-medium text-powder-100 hover:text-teal"
              >
                <Avatar>
                  <AvatarFallback>{initials(report.firstName, report.lastName)}</AvatarFallback>
                </Avatar>
                {report.firstName} {report.lastName}
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      {canManageDocuments && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Documents</CardTitle>
            <UploadDocumentDialog employeeId={employee.id} />
          </CardHeader>
          <CardContent>
            <DocumentList documents={documents} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
