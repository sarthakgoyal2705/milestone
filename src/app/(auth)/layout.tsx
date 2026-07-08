import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, rgba(212,158,141,0.30) 0%, transparent 72%)",
        }}
      />
      <Link
        href="/"
        className="relative z-10 mb-10 flex items-center gap-2.5 font-display text-lg font-semibold tracking-tight text-powder-100"
      >
        <span className="flex size-8 items-center justify-center rounded-md bg-rust text-sm text-white">
          M
        </span>
        Milestone
      </Link>
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}
