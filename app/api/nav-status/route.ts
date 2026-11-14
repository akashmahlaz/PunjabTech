import { auth } from "@/app/auth/_lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { startup, meeting, startupAgreement, payment } from "@/drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({
        isAuthenticated: false,
        cta: { label: "Build Startup", href: "/startup/new", isDashboard: false },
        user: null,
      });
    }

    const userRole = (session.user as { role?: string }).role;

    if (userRole === "admin") {
      return NextResponse.json({
        isAuthenticated: true,
        cta: { label: "Admin Console", href: "/admin/dashboard", isDashboard: true },
        user: { name: session.user.name, email: session.user.email, role: "admin" },
      });
    }

    // Live relational query from PostgreSQL (100% database truth, 0 mock)
    const userStartup = await db.query.startup.findFirst({
      where: eq(startup.createdByUserId, session.user.id),
      orderBy: [desc(startup.createdAt)],
      with: {
        meetings: {
          orderBy: [desc(meeting.createdAt)],
          limit: 1,
        },
        agreements: {
          orderBy: [desc(startupAgreement.createdAt)],
        },
        payments: {
          orderBy: [desc(payment.createdAt)],
          limit: 1,
        },
      },
    });

    if (!userStartup) {
      return NextResponse.json({
        isAuthenticated: true,
        cta: { label: "Build Startup", href: "/startup/new", isDashboard: false },
        user: { name: session.user.name, email: session.user.email, role: "user" },
      });
    }

    const latestMeeting = userStartup.meetings?.[0];
    const nda = userStartup.agreements?.find((a) => a.type === "nda");
    const contract = userStartup.agreements?.find((a) => a.type === "contract");
    const latestPayment = userStartup.payments?.[0];

    const isPaidOrPending =
      latestPayment?.status === "completed" || latestPayment?.status === "pending";
    const isContractSigned = contract?.status === "signed";
    const isNdaSigned = nda?.status === "signed";
    const isMeetingCompleted = latestMeeting?.status === "completed" || !!nda;

    let cta = {
      label: "Review In Progress",
      href: `/startup/${userStartup.id}?tab=meeting`,
      isDashboard: false,
    };

    if (isPaidOrPending) {
      // Completed all steps: Direct to Dashboard
      cta = {
        label: "Dashboard",
        href: "/dashboard",
        isDashboard: true,
      };
    } else if (isContractSigned) {
      cta = {
        label: "Token Deposit ($100)",
        href: `/startup/${userStartup.id}?tab=deposit`,
        isDashboard: false,
      };
    } else if (isNdaSigned) {
      cta = {
        label: "Sign Contract",
        href: `/startup/${userStartup.id}?tab=contract`,
        isDashboard: false,
      };
    } else if (isMeetingCompleted) {
      cta = {
        label: "Sign NDA",
        href: `/startup/${userStartup.id}?tab=nda`,
        isDashboard: false,
      };
    } else if (latestMeeting?.status === "scheduled") {
      cta = {
        label: "Discovery Call",
        href: `/startup/${userStartup.id}?tab=meeting`,
        isDashboard: false,
      };
    }

    return NextResponse.json({
      isAuthenticated: true,
      cta,
      user: { name: session.user.name, email: session.user.email, role: "user" },
    });
  } catch (error) {
    console.error("Error in nav-status route:", error);
    return NextResponse.json({
      isAuthenticated: false,
      cta: { label: "Build Startup", href: "/startup/new", isDashboard: false },
      user: null,
    });
  }
}
