import { auth } from "@/app/auth/_lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { startup } from "@/drizzle/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import StartupForm from "./startup-form";
import { Sparkles } from "lucide-react";

export default async function NewStartup({
  searchParams,
}: {
  searchParams?: Promise<{ force?: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/sign-up");
  }

  // Strict Role Separation: Admins can ONLY access admin dashboard, never founder onboarding
  const userRole = (session.user as { role?: string }).role;
  if (userRole === "admin") {
    redirect("/admin/dashboard");
  }

  const query = searchParams ? await searchParams : {};

  // Deterministic stage routing: If user already submitted a startup and didn't pass ?force=true,
  // route them directly to their active workspace!
  if (!query.force) {
    const existing = await db.query.startup.findFirst({
      where: eq(startup.createdByUserId, session.user.id),
      orderBy: [desc(startup.createdAt)],
    });

    if (existing) {
      redirect(`/startup/${existing.id}`);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#F9FAFB] px-6 py-12">
      <div className="w-full max-w-xl space-y-8">
        {/* Navigation & Branding */}
        <div className="flex items-center justify-between border-b border-neutral-200/80 pb-4">
          <Link
            href="/"
            className="font-['Space_Grotesk'] text-sm font-bold tracking-tight text-neutral-900"
          >
            PUNJAB<span className="text-orange-600">TECH</span>
          </Link>
          <div className="font-['Plus_Jakarta_Sans'] text-xs font-medium text-neutral-400">
            Step 02 of 03 — Intake
          </div>
        </div>

        {/* Title & Prompt */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/20 bg-orange-50 px-3 py-1 font-['Plus_Jakarta_Sans'] text-xs font-semibold text-orange-700">
            <Sparkles className="size-3.5" />
            Project Onboarding
          </div>

          <h1 className="font-['Space_Grotesk'] text-3xl font-bold tracking-tight text-neutral-900">
            Enter your startup name &amp; idea
          </h1>

          <p className="font-['Inter'] text-sm leading-relaxed text-neutral-500">
            Tell us what you want to build. Our engineering leads will review your concept, prepare an architectural roadmap, and schedule a discovery session.
          </p>
        </div>

        {/* Form Container */}
        <div className="rounded-3xl border border-neutral-200/80 bg-white p-8 shadow-xs">
          <StartupForm />
        </div>
      </div>
    </main>
  );
}
