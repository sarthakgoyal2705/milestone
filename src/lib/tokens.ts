import "server-only";
import { randomBytes, createHash } from "node:crypto";

export function generateResetToken() {
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashResetToken(rawToken);
  return { rawToken, tokenHash };
}

export function hashResetToken(rawToken: string) {
  return createHash("sha256").update(rawToken).digest("hex");
}
