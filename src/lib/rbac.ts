import "server-only";
import { auth } from "@/auth";
import type { Role } from "@/generated/prisma/enums";

export class UnauthorizedError extends Error {
  constructor(message = "You must be signed in to do this.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "You do not have permission to do this.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/** Resolves the current session or throws. Use at the top of every Server Action. */
export async function requireSession() {
  const session = await auth();
  if (!session?.user) throw new UnauthorizedError();
  return session;
}

/** Resolves the current session and enforces role membership, or throws. */
export async function requireRole(roles: Role[]) {
  const session = await requireSession();
  if (!roles.includes(session.user.role)) throw new ForbiddenError();
  return session;
}
