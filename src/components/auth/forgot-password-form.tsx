"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";

import { requestPasswordResetAction, type ActionState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    requestPasswordResetAction,
    undefined
  );

  if (state?.success) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-powder-100">
          If an account exists for that email, we&apos;ve sent a password reset link. It expires
          in 1 hour.
        </p>
        <Link href="/login" className="flex items-center gap-1.5 text-sm text-teal hover:underline">
          <ArrowLeft className="size-4" /> Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@milestone.app"
            className="pl-9"
            required
          />
        </div>
      </div>

      {state?.error && (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Sending…" : "Send reset link"}
      </Button>

      <Link href="/login" className="flex items-center gap-1.5 text-sm text-muted hover:text-teal">
        <ArrowLeft className="size-4" /> Back to sign in
      </Link>
    </form>
  );
}
