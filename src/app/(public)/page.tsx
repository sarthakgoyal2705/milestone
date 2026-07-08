import Link from "next/link";
import {
  ArrowRight,
  Target,
  Users,
  CalendarClock,
  Clock,
  Wallet,
  Briefcase,
  FileText,
  ShieldCheck,
  Mail,
  Phone,
  Globe,
  AtSign,
  Share2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/marketing/fade-in";
import { LandingHero } from "@/components/marketing/landing-hero";

const modules = [
  {
    icon: Target,
    title: "Goals & performance",
    desc: "Cascade KPIs across roles with weighted goal sheets, review cycles, and a full manager approval trail.",
  },
  {
    icon: Users,
    title: "People directory & org chart",
    desc: "One record per employee — department, manager, role — rendered as a live reporting tree.",
  },
  {
    icon: CalendarClock,
    title: "Leave & PTO",
    desc: "Balances, requests, and approvals, with a team view so managers see coverage at a glance.",
  },
  {
    icon: Clock,
    title: "Attendance & timesheets",
    desc: "Clock in and out, roll up into timesheets, no spreadsheets required.",
  },
  {
    icon: Wallet,
    title: "Payroll",
    desc: "Salary structures, payroll runs, and generated payslips employees can download on demand.",
  },
  {
    icon: Briefcase,
    title: "Recruitment & onboarding",
    desc: "Job postings, a candidate pipeline, and an automatic checklist the moment someone is hired.",
  },
  {
    icon: FileText,
    title: "Documents & notifications",
    desc: "Employee files stored per person, with real-time alerts when something needs attention.",
  },
  {
    icon: ShieldCheck,
    title: "Audit & governance",
    desc: "Every approval, override, and status change is logged — visible to admins, not just implied.",
  },
];

const navLinks = [
  { label: "Modules", href: "#modules" },
  { label: "Platform", href: "#platform" },
  { label: "Security", href: "#security" },
];

export default function LandingPage() {
  return (
    <>
      {/* Utility bar */}
      <div className="hidden border-b border-hairline bg-ink-950/60 px-6 py-2 text-xs text-muted sm:block sm:px-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <Mail className="size-3.5 text-rust" /> hello@milestone.app
            </span>
            <span className="flex items-center gap-1.5">
              <Phone className="size-3.5 text-rust" /> +1 987 654 32 10
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="#" aria-label="Website" className="transition-colors hover:text-teal">
              <Globe className="size-3.5" />
            </Link>
            <Link href="#" aria-label="Social" className="transition-colors hover:text-teal">
              <AtSign className="size-3.5" />
            </Link>
            <Link href="#" aria-label="Share" className="transition-colors hover:text-teal">
              <Share2 className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Primary nav */}
      <nav className="sticky top-0 z-50 border-b border-hairline bg-ink-900/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-10">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-display text-lg font-semibold tracking-tight text-powder-100"
          >
            <span className="flex size-8 items-center justify-center rounded-md bg-rust text-sm text-white">
              M
            </span>
            Milestone
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted transition-colors hover:text-powder-100"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <Button asChild variant="secondary">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </nav>

      <LandingHero />

      {/* Stats */}
      <section
        id="platform"
        className="border-y border-hairline bg-surface px-6 py-12 sm:px-10"
      >
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 text-center sm:grid-cols-4">
          {[
            { v: "8", l: "HR modules" },
            { v: "3", l: "Role levels" },
            { v: "100%", l: "Server-verified actions" },
            { v: "1", l: "Source of truth" },
          ].map((s, i) => (
            <FadeIn key={s.l} delay={i * 0.08}>
              <div className="font-display text-4xl font-semibold text-rust">{s.v}</div>
              <div className="mt-1 text-xs font-medium uppercase tracking-wide text-muted">
                {s.l}
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Modules */}
      <section id="modules" className="px-6 py-24 sm:px-10">
        <FadeIn className="mx-auto mb-14 max-w-xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-teal">
            Everything in one place
          </span>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-powder-100 sm:text-4xl">
            Everything HR needs, none of the sprawl
          </h2>
          <p className="mt-3 text-muted">
            Every module shares the same employees, roles, and audit log — so nothing drifts
            out of sync.
          </p>
        </FadeIn>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {modules.map((m, i) => (
            <FadeIn key={m.title} delay={(i % 4) * 0.06}>
              <div className="group h-full rounded-2xl border border-hairline bg-surface p-6 transition-all duration-200 ease-out-confident hover:-translate-y-1 hover:border-rose hover:shadow-[0_24px_50px_-30px_rgba(104,59,43,0.4)]">
                <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-rust-100 text-rust transition-colors group-hover:bg-rust group-hover:text-white">
                  <m.icon className="size-5" />
                </div>
                <h3 className="font-display text-base font-semibold text-powder-100">{m.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{m.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="security" className="px-6 pb-24 sm:px-10">
        <FadeIn className="mx-auto max-w-5xl">
          <div
            className="rounded-[2rem] px-8 py-16 text-center shadow-[0_40px_90px_-40px_rgba(104,59,43,0.55)] sm:px-16"
            style={{
              background:
                "linear-gradient(135deg, #683b2b 0%, #964734 55%, #b08401 100%)",
            }}
          >
            <ShieldCheck className="mx-auto mb-5 size-9 text-white/90" />
            <h2 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Your HR administrator sets you up — you sign in and get to work.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-white/75">
              Accounts are provisioned by your organization&apos;s admin. Every action is
              server-verified and logged.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-8 bg-white text-rust hover:bg-white/90 hover:shadow-[0_8px_20px_rgba(0,0,0,0.2)]"
            >
              <Link href="/login">
                Sign in <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </FadeIn>
      </section>

      {/* Footer */}
      <footer className="border-t border-hairline bg-surface px-6 py-8 sm:px-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2 font-medium text-powder-100">
            <span className="flex size-6 items-center justify-center rounded-sm bg-rust text-xs text-white">
              M
            </span>
            Milestone
          </div>
          <span className="text-sm text-muted">
            © {new Date().getFullYear()} Milestone. All rights reserved.
          </span>
        </div>
      </footer>
    </>
  );
}
