import { auth } from "@/app/auth/_lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { startup } from "@/drizzle/schema";
import { eq, desc } from "drizzle-orm";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/sign-up");
  }

  const userRole = (session.user as { role?: string }).role;

  // Strict Role Segregation: Admin must go to admin dashboard
  if (userRole === "admin") {
    redirect("/admin/dashboard");
  }

  // Regular user: find their startup and route deterministically
  const userStartup = await db.query.startup.findFirst({
    where: eq(startup.createdByUserId, session.user.id),
    orderBy: [desc(startup.createdAt)],
  });

  if (userStartup) {
    redirect(`/startup/${userStartup.id}`);
  }

  redirect("/startup/new");
}
