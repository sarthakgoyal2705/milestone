"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, Sparkles, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

function Floaty({
  children,
  className,
  delay = 0,
  distance = 14,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  distance?: number;
}) {
  return (
    <motion.div
      className={`absolute ${className ?? ""}`}
      animate={{ y: [0, -distance, 0] }}
      transition={{ duration: 5 + delay, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}

function HeroVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, rotate: -1 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto aspect-square w-full max-w-md lg:max-w-lg"
    >
      {/* Main diagonal panel */}
      <div
        className="absolute inset-0 overflow-hidden rounded-[2rem] border border-hairline shadow-[0_40px_90px_-40px_rgba(104,59,43,0.45)]"
        style={{
          background:
            "linear-gradient(145deg, #faf6f2 0%, #ded1bd 52%, #d49e8d 100%)",
          clipPath: "polygon(12% 0, 100% 0, 100% 100%, 0 100%)",
        }}
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(104,59,43,0.14) 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
        />
      </div>

      {/* Oversized letterform */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="select-none font-display text-[10rem] font-bold leading-none text-white/45 sm:text-[12rem]">
          M
        </span>
      </div>

      {/* Floating shapes */}
      <Floaty className="left-[-7%] top-[14%]" delay={0}>
        <div className="flex size-16 items-center justify-center rounded-2xl bg-rust text-white shadow-xl shadow-rust/30">
          <Sparkles className="size-7" />
        </div>
      </Floaty>

      <Floaty className="right-[-5%] top-[8%]" delay={1.1} distance={18}>
        <div className="size-14 rounded-full border-[6px] border-rose/80 bg-transparent" />
      </Floaty>

      <Floaty className="bottom-[10%] left-[-4%]" delay={0.6} distance={12}>
        <div className="size-10 rounded-full bg-teal shadow-lg" />
      </Floaty>

      {/* Floating product stat card */}
      <Floaty className="bottom-[6%] right-[-8%]" delay={0.4} distance={16}>
        <div className="w-40 rounded-xl border border-hairline bg-surface p-4 shadow-[0_20px_50px_-20px_rgba(104,59,43,0.4)]">
          <div className="flex items-center gap-2 text-teal">
            <TrendingUp className="size-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">Headcount</span>
          </div>
          <div className="mt-1 font-display text-2xl font-semibold text-powder-100">248</div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-ink-700">
            <motion.div
              className="h-full rounded-full bg-rust"
              initial={{ width: 0 }}
              animate={{ width: "72%" }}
              transition={{ duration: 1.4, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>
      </Floaty>
    </motion.div>
  );
}

export function LandingHero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(55% 55% at 82% 8%, rgba(212,158,141,0.35) 0%, transparent 62%), radial-gradient(45% 50% at 8% 95%, rgba(176,132,1,0.12) 0%, transparent 60%)",
        }}
      />
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 sm:px-10 lg:grid-cols-2 lg:py-24">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col items-start"
        >
          <motion.span
            variants={item}
            className="inline-flex items-center gap-2 rounded-full border border-hairline-strong bg-surface px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal"
          >
            <Sparkles className="size-3.5" /> The people platform for growing teams
          </motion.span>
          <motion.h1
            variants={item}
            className="mt-6 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-powder-100 sm:text-5xl lg:text-6xl"
          >
            Give your people <span className="text-rust">the best</span> place to grow.
          </motion.h1>
          <motion.p variants={item} className="mt-6 max-w-lg text-lg text-muted">
            Goals, leave, attendance, payroll, and recruitment — one warm, unified
            workspace with a single login and a full audit trail. Done stitching
            spreadsheets together.
          </motion.p>
          <motion.div variants={item} className="mt-9 flex flex-wrap items-center gap-4">
            <Button asChild size="lg">
              <Link href="/login">
                Sign in to your workspace <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="#modules">Explore modules</Link>
            </Button>
          </motion.div>
        </motion.div>

        <HeroVisual />
      </div>
    </section>
  );
}
