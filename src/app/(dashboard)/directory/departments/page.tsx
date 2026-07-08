import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DepartmentManager } from "@/components/directory/department-manager";

export default async function DepartmentsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/directory");

  const departments = await prisma.department.findMany({
    include: { _count: { select: { employees: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-powder-100">
          Departments
        </h1>
        <p className="mt-1 text-muted">Create, rename, or remove departments.</p>
      </div>

      <DepartmentManager departments={departments} />
    </div>
  );
}
