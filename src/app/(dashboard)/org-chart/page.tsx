import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { OrgChartNode, type OrgChartPerson } from "@/components/directory/org-chart-node";

export default async function OrgChartPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const employees = await prisma.employee.findMany({
    where: { status: { not: "TERMINATED" } },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      jobTitle: true,
      managerId: true,
      department: { select: { name: true } },
    },
    orderBy: [{ firstName: "asc" }],
  });

  const nodesById = new Map<string, OrgChartPerson>(
    employees.map((e) => [
      e.id,
      {
        id: e.id,
        firstName: e.firstName,
        lastName: e.lastName,
        jobTitle: e.jobTitle,
        departmentName: e.department?.name ?? null,
        children: [],
      },
    ])
  );

  const roots: OrgChartPerson[] = [];
  for (const employee of employees) {
    const node = nodesById.get(employee.id)!;
    if (employee.managerId && nodesById.has(employee.managerId)) {
      nodesById.get(employee.managerId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-powder-100">
          Org Chart
        </h1>
        <p className="mt-1 text-muted">Reporting lines across the company.</p>
      </div>

      <Card>
        <CardContent className="overflow-x-auto pt-6">
          {roots.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">No employees to show.</p>
          ) : (
            <div className="flex flex-col gap-6">
              {roots.map((root) => (
                <OrgChartNode key={root.id} person={root} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
