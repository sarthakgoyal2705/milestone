import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JobPostingDialog } from "@/components/recruitment/job-posting-dialog";

export default async function RecruitmentPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role === "EMPLOYEE") redirect("/dashboard");

  const [postings, departments] = await Promise.all([
    prisma.jobPosting.findMany({
      include: { department: true, _count: { select: { candidates: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.department.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-powder-100">
            Recruitment
          </h1>
          <p className="mt-1 text-muted">Open roles and their candidate pipelines.</p>
        </div>
        <JobPostingDialog departments={departments} />
      </div>

      {postings.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-muted">No job postings yet.</CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {postings.map((posting) => (
          <Link key={posting.id} href={`/recruitment/${posting.id}`}>
            <Card className="h-full transition-colors hover:border-teal/40">
              <CardContent className="flex h-full flex-col gap-3 pt-6">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-lg font-semibold text-powder-100">
                    {posting.title}
                  </h3>
                  <Badge variant={posting.isOpen ? "success" : "neutral"}>
                    {posting.isOpen ? "Open" : "Closed"}
                  </Badge>
                </div>
                <p className="text-sm text-muted">{posting.department?.name ?? "No department"}</p>
                <p className="mt-auto text-sm text-muted">
                  {posting._count.candidates} candidate{posting._count.candidates === 1 ? "" : "s"}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
