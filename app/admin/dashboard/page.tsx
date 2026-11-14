import { auth } from "@/app/auth/_lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { startup, meeting, startupAgreement } from "@/drizzle/schema";
import { desc, eq } from "drizzle-orm";
import { AppSidebar } from "./_components/app-sidebar";
import { SiteHeader } from "./_components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { StartupsTable } from "./_components/startups-table";
import { Calendar, Clock, Layers, FileCheck } from "lucide-react";

const SUPER_ADMIN_EMAIL = "akashdalla406@gmail.com";

export default async function AdminDashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Strict Super Admin Access: Only akashdalla406@gmail.com with admin role can access
  const isSuperAdmin =
    session?.user?.email === SUPER_ADMIN_EMAIL &&
    (session?.user as { role?: string })?.role === "admin";

  if (!session || !isSuperAdmin) {
    redirect("/startup/new");
  }

  // 1. Fetch live startups with relations (creator, latest meetings, and NDA agreements)
  const rawStartups = await db.query.startup.findMany({
    orderBy: [desc(startup.createdAt)],
    with: {
      createdBy: true,
      meetings: {
        orderBy: [desc(meeting.createdAt)],
        limit: 1,
      },
      agreements: {
        where: eq(startupAgreement.type, "nda"),
        orderBy: [desc(startupAgreement.createdAt)],
        limit: 1,
        with: {
          signatures: true,
        },
      },
    },
  });

  const formattedStartups = rawStartups.map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    description: s.description,
    status: s.status,
    submittedAt: s.submittedAt,
    createdAt: s.createdAt,
    user: s.createdBy
      ? {
          id: s.createdBy.id,
          name: s.createdBy.name,
          email: s.createdBy.email,
          image: s.createdBy.image,
        }
      : null,
    meeting: s.meetings?.[0]
      ? {
          id: s.meetings[0].id,
          scheduledAt: s.meetings[0].scheduledAt,
          meetingLink: s.meetings[0].meetingLink,
          durationMinutes: s.meetings[0].durationMinutes,
          notes: s.meetings[0].notes,
          status: s.meetings[0].status,
          completedAt: s.meetings[0].completedAt,
        }
      : null,
    agreement: s.agreements?.[0]
      ? {
          id: s.agreements[0].id,
          title: s.agreements[0].title,
          status: s.agreements[0].status,
          fullySignedAt: s.agreements[0].fullySignedAt,
          sentAt: s.agreements[0].sentAt,
          signatures: s.agreements[0].signatures || [],
        }
      : null,
  }));

  const totalCount = formattedStartups.length;
  const underReviewCount = formattedStartups.filter(
    (s) => !s.meeting || s.meeting.status !== "completed"
  ).length;
  const ndaActiveCount = formattedStartups.filter(
    (s) => !!s.agreement && s.agreement.status === "signed"
  ).length;

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col bg-[#F9FAFB]">
          <div className="@container/main flex flex-1 flex-col gap-6 p-4 lg:p-6">
            {/* Header & Overview Stats */}
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1 font-['JetBrains_Mono'] text-xs font-medium text-neutral-600 shadow-2xs">
                Admin Console: {session.user.email}
              </div>
              <h1 className="mt-2.5 font-['Space_Grotesk'] text-2xl font-bold tracking-tight text-neutral-900">
                Startup Intake, Discovery &amp; NDA Operations
              </h1>
              <p className="font-['Inter'] text-xs text-neutral-500">
                Review submitted ideas, schedule discovery video sessions, mark meetings successful, and issue mutual NDAs.
              </p>
            </div>

            {/* Metric Cards (M3 Elevated) */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-neutral-200/80 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between text-neutral-500">
                  <span className="font-['Plus_Jakarta_Sans'] text-xs font-semibold uppercase tracking-wider text-neutral-400">Total Submissions</span>
                  <Layers className="size-4 text-neutral-400" />
                </div>
                <div className="mt-2 font-['Space_Grotesk'] text-3xl font-bold tabular-nums text-neutral-900">
                  {totalCount}
                </div>
                <div className="mt-1 font-['Inter'] text-xs text-neutral-400">All registered startup ventures</div>
              </div>

              <div className="rounded-3xl border border-neutral-200/80 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between text-neutral-500">
                  <span className="font-['Plus_Jakarta_Sans'] text-xs font-semibold uppercase tracking-wider text-neutral-400">In Discovery Pipeline</span>
                  <Clock className="size-4 text-amber-500" />
                </div>
                <div className="mt-2 font-['Space_Grotesk'] text-3xl font-bold tabular-nums text-amber-600">
                  {underReviewCount}
                </div>
                <div className="mt-1 font-['Inter'] text-xs text-neutral-400">Awaiting call completion / NDA stage</div>
              </div>

              <div className="rounded-3xl border border-neutral-200/80 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between text-neutral-500">
                  <span className="font-['Plus_Jakarta_Sans'] text-xs font-semibold uppercase tracking-wider text-neutral-400">NDAs Executed</span>
                  <FileCheck className="size-4 text-emerald-500" />
                </div>
                <div className="mt-2 font-['Space_Grotesk'] text-3xl font-bold tabular-nums text-emerald-600">
                  {ndaActiveCount}
                </div>
                <div className="mt-1 font-['Inter'] text-xs text-neutral-400">Legally signed mutual agreements</div>
              </div>
            </div>

            {/* Main Interactive Table */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-['Space_Grotesk'] text-sm font-semibold text-neutral-900">
                  Registered Startups &amp; Lifecycle Stages
                </h2>
              </div>
              <StartupsTable initialStartups={formattedStartups} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
