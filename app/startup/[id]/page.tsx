import { auth } from "@/app/auth/_lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { startup, meeting, startupAgreement } from "@/drizzle/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { MeetingStatusView } from "./_components/meeting-status-view";
import { NdaSignView } from "./_components/nda-sign-view";
import { Building2, Calendar, FileText } from "lucide-react";

export default async function StartupPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ tab?: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/sign-up");
  }

  // 1. Strict Role Separation: Admins can ONLY access admin dashboard, never founder pages
  const userRole = (session.user as { role?: string }).role;
  if (userRole === "admin") {
    redirect("/admin/dashboard");
  }

  const { id } = await params;
  const query = searchParams ? await searchParams : {};

  // 2. Fetch startup, meetings, and NDA agreement
  const startupData = await db.query.startup.findFirst({
    where: eq(startup.id, id),
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

  if (!startupData) {
    notFound();
  }

  // 3. User Ownership check: Only the founder who created this startup can access their page
  const isOwner = startupData.createdByUserId === session.user.id;
  if (!isOwner) {
    redirect("/startup/new");
  }

  const latestMeeting = startupData.meetings?.[0] || null;
  const ndaAgreement = startupData.agreements?.[0] || null;
  const isMeetingCompleted = latestMeeting?.status === "completed" || !!ndaAgreement;

  // Active view: if meet is done, default to NDA unless user clicks meeting tab
  const activeTab = query.tab || (isMeetingCompleted ? "nda" : "meeting");

  return (
    <main className="min-h-screen bg-[#F9FAFB] text-neutral-900">
      {/* Top Header */}
      <header className="border-b border-neutral-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="font-['Space_Grotesk'] text-sm font-bold tracking-tight text-neutral-900"
            >
              PUNJAB<span className="text-orange-600">TECH</span>
            </Link>
            <span className="text-neutral-300">/</span>
            <div className="flex items-center gap-1.5 font-['Plus_Jakarta_Sans'] text-xs font-medium text-neutral-700">
              <Building2 className="size-3.5 text-neutral-400" />
              <span>{startupData.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-['Inter']">
            <span className="text-neutral-500">
              Founder: <span className="font-medium text-neutral-800">{session.user.name}</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* Stage Navigation Pills if meeting is completed */}
        {isMeetingCompleted && (
          <div className="mb-6 flex items-center gap-2 border-b border-neutral-200/60 pb-3">
            <Link
              href={`/startup/${id}?tab=nda`}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 font-['Plus_Jakarta_Sans'] text-xs font-semibold transition ${
                activeTab === "nda"
                  ? "bg-neutral-900 text-white"
                  : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100"
              }`}
            >
              <FileText className="size-3.5" />
              Stage 02: Mutual NDA {ndaAgreement?.status === "signed" && "✓"}
            </Link>

            <Link
              href={`/startup/${id}?tab=meeting`}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 font-['Plus_Jakarta_Sans'] text-xs font-semibold transition ${
                activeTab === "meeting"
                  ? "bg-neutral-900 text-white"
                  : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100"
              }`}
            >
              <Calendar className="size-3.5" />
              Stage 01: Discovery Call
            </Link>
          </div>
        )}

        {/* View Selection */}
        {activeTab === "nda" && isMeetingCompleted ? (
          <NdaSignView
            startupId={startupData.id}
            startupName={startupData.name}
            founderName={startupData.createdBy.name}
            founderEmail={startupData.createdBy.email}
            agreement={ndaAgreement}
          />
        ) : (
          <MeetingStatusView
            startupId={startupData.id}
            startupName={startupData.name}
            startupIdea={startupData.description}
            submittedAt={startupData.submittedAt || startupData.createdAt}
            status={startupData.status}
            meeting={latestMeeting}
          />
        )}
      </div>
    </main>
  );
}
