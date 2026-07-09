import { redirect } from "next/navigation";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogTimeDialog } from "@/components/timesheets/log-time-dialog";
import { ExportButton } from "@/components/ui/export-button";

export default async function TimesheetsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (!session.user.employeeId) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-powder-100">
          Timesheets
        </h1>
        <Card>
          <CardContent className="py-10 text-center text-muted">
            No employee profile is linked to this account.
          </CardContent>
        </Card>
      </div>
    );
  }

  const entries = await prisma.timesheetEntry.findMany({
    where: { employeeId: session.user.employeeId },
    orderBy: { date: "desc" },
    take: 50,
  });

  const thisWeekStart = startOfWeek(new Date());
  const thisWeekEnd = endOfWeek(new Date());
  
  const thisWeekHours = entries
    .filter(e => e.date >= thisWeekStart && e.date <= thisWeekEnd)
    .reduce((sum, e) => sum + e.hours, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-powder-100">
            Timesheets
          </h1>
          <p className="mt-1 text-muted">Track your hours spent on projects.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="teal" className="text-sm px-3 py-1">
            This week: {thisWeekHours} hrs
          </Badge>
          <ExportButton 
            filename="timesheets"
            title="My Timesheets"
            headers={["Date", "Project", "Hours", "Description"]}
            rows={entries.map(e => [
              format(e.date, "MMM d, yyyy"),
              e.project,
              e.hours.toString(),
              e.description || ""
            ])}
          />
          <LogTimeDialog />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {entries.length === 0 ? (
            <div className="py-20 text-center text-muted">
              No time entries yet.
            </div>
          ) : (
            <div className="divide-y divide-hairline">
              {entries.map((entry) => (
                <div key={entry.id} className="flex items-start justify-between p-4 hover:bg-surface-hover/50 transition-colors">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-powder-100">{entry.project}</span>
                    <span className="text-sm text-muted">{format(entry.date, "EEEE, MMM d, yyyy")}</span>
                    {entry.description && (
                      <span className="text-sm text-muted mt-1">{entry.description}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-powder-100 text-lg">{entry.hours} <span className="text-sm font-normal text-muted">hrs</span></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
