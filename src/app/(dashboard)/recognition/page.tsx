import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { GiveKudosDialog } from "@/components/recognition/give-kudos-dialog";
import { KudosCard } from "@/components/recognition/kudos-card";
import { Card, CardContent } from "@/components/ui/card";

export default async function RecognitionPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [recognitions, allEmployees] = await Promise.all([
    prisma.recognition.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        fromUser: {
          select: {
            email: true,
            employee: { select: { firstName: true, lastName: true, avatarUrl: true } }
          }
        },
        toEmployee: {
          select: { firstName: true, lastName: true, jobTitle: true, avatarUrl: true }
        }
      }
    }),
    prisma.employee.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, firstName: true, lastName: true },
      orderBy: { firstName: "asc" }
    })
  ]);

  const employeeOptions = allEmployees.map(e => ({
    id: e.id,
    name: `${e.firstName} ${e.lastName}`
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-powder-100">
            Recognition
          </h1>
          <p className="mt-1 text-muted">Celebrate your colleagues and team wins.</p>
        </div>
        <GiveKudosDialog employees={employeeOptions} />
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        {recognitions.length === 0 ? (
          <Card>
            <CardContent className="py-20 text-center text-muted">
              <p className="text-lg font-medium text-powder-100">No kudos yet.</p>
              <p className="mt-1 text-sm">Be the first to recognize a colleague!</p>
            </CardContent>
          </Card>
        ) : (
          recognitions.map((r) => <KudosCard key={r.id} recognition={r} />)
        )}
      </div>
    </div>
  );
}
