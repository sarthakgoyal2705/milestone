import "server-only";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.EMAIL_FROM ?? "Milestone <no-reply@milestone.app>";

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  if (!resend) {
    console.log(
      `\n[dev] Password reset requested for ${email}.\n[dev] Reset link: ${resetUrl}\n`
    );
    return;
  }

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Reset your Milestone password",
    html: `
      <p>A password reset was requested for your Milestone account.</p>
      <p><a href="${resetUrl}">Reset your password</a></p>
      <p>This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>
    `,
  });
}
