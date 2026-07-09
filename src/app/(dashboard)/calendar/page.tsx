import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { CalendarWrapper } from "@/components/calendar/calendar-wrapper";

export default async function CalendarPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return <CalendarWrapper role={session.user.role} />;
}
