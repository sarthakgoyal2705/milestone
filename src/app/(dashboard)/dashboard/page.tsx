import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const employee = await prisma.employee.findUnique({
    where: { userId: session.user.id },
    include: { department: true, directReports: true },
  });

  const firstName = employee?.firstName ?? session.user.email;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-powder-100">
          Welcome back, {firstName}
        </h1>
        <p className="mt-1 text-muted">
          {employee ? `${employee.jobTitle}${employee.department ? ` · ${employee.department.name}` : ""}` : session.user.role}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Role</CardDescription>
            <CardTitle>{session.user.role}</CardTitle>
          </CardHeader>
        </Card>
        {employee?.directReports && employee.directReports.length > 0 && (
          <Card>
            <CardHeader>
              <CardDescription>Direct reports</CardDescription>
              <CardTitle>{employee.directReports.length}</CardTitle>
            </CardHeader>
          </Card>
        )}
        <Card>
          <CardHeader>
            <CardDescription>Account status</CardDescription>
            <CardTitle>Active</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardContent className="py-10 text-center text-sm text-muted">
          The HR modules for this account will appear here as they come online — goals,
          leave, attendance, payroll, recruitment, and more.
        </CardContent>
      </Card>
    </div>
  );
}
