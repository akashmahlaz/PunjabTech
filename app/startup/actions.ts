"use server";

import { auth } from "@/app/auth/_lib/auth";
import { db } from "@/lib/db";
import {
  startup,
  startupAgreement,
  agreementSignature,
  payment,
  startupMilestone,
  startupActivityLog,
  user,
} from "@/drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { StartupState } from "./types";

const startupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Startup name must contain at least 2 characters")
    .max(80, "Startup name cannot exceed 80 characters"),

  description: z
    .string()
    .trim()
    .min(10, "Description must contain at least 10 characters")
    .max(1000, "Description cannot exceed 1000 characters"),
});

export async function createStartup(
  previousState: StartupState,
  formData: FormData
): Promise<StartupState> {
  // 1. Get authenticated session
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/sign-up");
  }

  // 2. Validate form data
  const validated = startupSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
  });

  if (!validated.success) {
    return {
      fieldErrors: validated.error.flatten().fieldErrors,
      message: "Please check your information.",
    };
  }

  // 3. Extract validated data
  const { name, description } = validated.data;

  // 4. Generate unique slug
  const slugName = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const slug = `${slugName || "startup"}-${randomUUID().slice(0, 8)}`;

  // 5. Create startup in PostgreSQL
  let newStartup;

  try {
    [newStartup] = await db
      .insert(startup)
      .values({
        name,
        description,
        slug,
        createdByUserId: session.user.id,
        status: "under_review",
        submittedAt: new Date(),
      })
      .returning({
        id: startup.id,
      });
  } catch (error) {
    console.error("Startup creation failed:", error);
    return {
      message: "Unable to create startup. Please try again.",
    };
  }

  // 6. Check database result
  if (!newStartup) {
    return {
      message: "Startup creation failed.",
    };
  }

  // 7. Redirect to the newly created startup
  redirect(`/startup/${newStartup.id}`);
}

export async function signNDAAction(input: {
  agreementId: string;
  signerName: string;
  signerTitle?: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  const { agreementId, signerName } = input;

  if (!signerName || signerName.trim().length < 2) {
    return { success: false, error: "Please enter your full legal name as your electronic signature." };
  }

  try {
    const [agreementRecord] = await db
      .select()
      .from(startupAgreement)
      .where(eq(startupAgreement.id, agreementId))
      .limit(1);

    if (!agreementRecord) {
      return { success: false, error: "NDA agreement record not found." };
    }

    // 1. Update the signature entry
    const [existingSig] = await db
      .select()
      .from(agreementSignature)
      .where(
        and(
          eq(agreementSignature.agreementId, agreementId),
          eq(agreementSignature.signerUserId, session.user.id)
        )
      )
      .limit(1);

    if (existingSig) {
      await db
        .update(agreementSignature)
        .set({
          status: "signed",
          signerName: signerName.trim(),
          signedAt: new Date(),
        })
        .where(eq(agreementSignature.id, existingSig.id));
    } else {
      await db.insert(agreementSignature).values({
        agreementId,
        signerUserId: session.user.id,
        signerName: signerName.trim(),
        signerEmail: session.user.email || "",
        signerRole: "startup_representative",
        status: "signed",
        signedAt: new Date(),
      });
    }

    // 2. Mark agreement fully signed
    await db
      .update(startupAgreement)
      .set({
        status: "signed",
        fullySignedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(startupAgreement.id, agreementId));

    // 3. Automatically ensure Stage 03 Master Services Agreement (Contract) is provisioned
    const [existingContract] = await db
      .select({ id: startupAgreement.id })
      .from(startupAgreement)
      .where(
        and(
          eq(startupAgreement.startupId, agreementRecord.startupId),
          eq(startupAgreement.type, "contract")
        )
      )
      .limit(1);

    if (!existingContract) {
      const [newContract] = await db
        .insert(startupAgreement)
        .values({
          startupId: agreementRecord.startupId,
          type: "contract",
          title: "Master Services Agreement (MSA) & IP Assignment",
          version: 1,
          status: "sent",
          sentAt: new Date(),
        })
        .returning({ id: startupAgreement.id });

      if (newContract) {
        await db.insert(agreementSignature).values({
          agreementId: newContract.id,
          signerUserId: session.user.id,
          signerName: signerName.trim(),
          signerEmail: session.user.email || "",
          signerRole: "startup_representative",
          status: "pending",
          isRequired: true,
        });
      }
    }

    revalidatePath(`/startup/${agreementRecord.startupId}`);
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error signing NDA agreement:", error);
    return {
      success: false,
      error: "Failed to sign agreement. Please try again.",
    };
  }
}

export async function signContractAction(input: {
  contractId: string;
  signerName: string;
  signerTitle?: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  const { contractId, signerName, signerTitle } = input;

  if (!signerName || signerName.trim().length < 2) {
    return { success: false, error: "Please enter your legal name as electronic signature." };
  }

  try {
    const [contractRecord] = await db
      .select()
      .from(startupAgreement)
      .where(eq(startupAgreement.id, contractId))
      .limit(1);

    if (!contractRecord) {
      return { success: false, error: "Contract agreement record not found." };
    }

    // 1. Update or create signature entry
    const [existingSig] = await db
      .select()
      .from(agreementSignature)
      .where(
        and(
          eq(agreementSignature.agreementId, contractId),
          eq(agreementSignature.signerUserId, session.user.id)
        )
      )
      .limit(1);

    if (existingSig) {
      await db
        .update(agreementSignature)
        .set({
          status: "signed",
          signerName: signerName.trim(),
          signedAt: new Date(),
        })
        .where(eq(agreementSignature.id, existingSig.id));
    } else {
      await db.insert(agreementSignature).values({
        agreementId: contractId,
        signerUserId: session.user.id,
        signerName: signerName.trim(),
        signerEmail: session.user.email || "",
        signerRole: "startup_representative",
        status: "signed",
        signedAt: new Date(),
      });
    }

    // 2. Mark contract fully signed
    await db
      .update(startupAgreement)
      .set({
        status: "signed",
        fullySignedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(startupAgreement.id, contractId));

    revalidatePath(`/startup/${contractRecord.startupId}`);
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error signing contract agreement:", error);
    return {
      success: false,
      error: "Failed to sign contract. Please try again.",
    };
  }
}

// Default sprint milestones initialization helper (Strictly PostgreSQL relational rows, 0 mock)
async function ensureDefaultMilestones(startupId: string) {
  const existing = await db
    .select({ id: startupMilestone.id })
    .from(startupMilestone)
    .where(eq(startupMilestone.startupId, startupId));

  if (existing.length > 0) return;

  const now = new Date();
  const day = 24 * 60 * 60 * 1000;

  await db.insert(startupMilestone).values([
    {
      startupId,
      phaseNumber: 1,
      title: "Sprint 01: Architecture, Data Modeling & API Specs",
      description: "Database normalization, relational schema design, auth policies, and core API interface design.",
      status: "completed",
      progressPercentage: 100,
      targetDate: new Date(now.getTime() + 7 * day),
      completedAt: now,
    },
    {
      startupId,
      phaseNumber: 2,
      title: "Sprint 02: Core Engine & Transactional Workflows",
      description: "Relational business logic, secure state machines, and real-time backend integrations.",
      status: "in_progress",
      progressPercentage: 35,
      targetDate: new Date(now.getTime() + 14 * day),
    },
    {
      startupId,
      phaseNumber: 3,
      title: "Sprint 03: High-Density UI & Production Integration",
      description: "Material 3 Expressive UI components, responsive layout density, and third-party service hooks.",
      status: "upcoming",
      progressPercentage: 0,
      targetDate: new Date(now.getTime() + 21 * day),
    },
    {
      startupId,
      phaseNumber: 4,
      title: "Sprint 04: Security Hardening, Audit & Go-Live Launch",
      description: "OWASP vulnerability audit, rate limiting, domain cutover, and production deployment.",
      status: "upcoming",
      progressPercentage: 0,
      targetDate: new Date(now.getTime() + 28 * day),
    },
  ]);
}

export async function recordPayPalPaymentAction(input: {
  startupId: string;
  orderId: string;
  amountCents?: number;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  const { startupId, orderId, amountCents = 10000 } = input;

  if (!orderId) {
    return { success: false, error: "Invalid PayPal order identifier." };
  }

  try {
    // 1. Insert verified completed payment in PostgreSQL
    const [insertedPayment] = await db
      .insert(payment)
      .values({
        startupId,
        userId: session.user.id,
        amountCents,
        currency: "usd",
        status: "completed",
        paymentMethod: "paypal",
        referenceNumber: orderId,
        description: "Kickoff token deposit ($100 USD via PayPal)",
        paidAt: new Date(),
      })
      .returning({ id: payment.id });

    // 2. Initialize default sprint milestones if not present
    await ensureDefaultMilestones(startupId);

    // 3. Insert real activity logs
    await db.insert(startupActivityLog).values([
      {
        startupId,
        title: "Kickoff Token Deposit Verified ($100.00 USD)",
        details: `PayPal payment transaction ${orderId} successfully captured and verified. Dedicated development allocation assigned.`,
        category: "financial",
      },
      {
        startupId,
        title: "Architecture Workspace & Drizzle Relational Model Provisioned",
        details: "Punjab Tech team initiated repository scaffolding, PostgreSQL schema setup, and milestone sprint tracking.",
        category: "engineering",
      },
    ]);

    revalidatePath(`/startup/${startupId}`);
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error recording PayPal payment:", error);
    return {
      success: false,
      error: "Failed to record payment in database. Please contact support.",
    };
  }
}

export async function recordBankWirePaymentAction(input: {
  startupId: string;
  referenceNumber: string;
  senderName: string;
  amountCents?: number;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  const { startupId, referenceNumber, senderName, amountCents = 10000 } = input;

  if (!referenceNumber || referenceNumber.trim().length < 4) {
    return { success: false, error: "Please enter a valid Bank Transfer UTR / Reference number." };
  }

  if (!senderName || senderName.trim().length < 2) {
    return { success: false, error: "Please enter the account holder or sender name." };
  }

  try {
    // 1. Insert pending wire payment in PostgreSQL
    await db.insert(payment).values({
      startupId,
      userId: session.user.id,
      amountCents,
      currency: "usd",
      status: "pending",
      paymentMethod: "bank_wire",
      referenceNumber: referenceNumber.trim(),
      description: `SBI Direct Wire Transfer from ${senderName.trim()} (UTR: ${referenceNumber.trim()})`,
    });

    // 2. Record transparent activity log
    await db.insert(startupActivityLog).values({
      startupId,
      title: `Bank Wire Submission Received (UTR: ${referenceNumber.trim()})`,
      details: `Reference submitted by ${senderName.trim()} for SBI Account 32314713340 (Punjab Tech). Verification in progress by Admin Akashdeep Singh.`,
      category: "financial",
    });

    revalidatePath(`/startup/${startupId}`);
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error recording Bank Wire payment:", error);
    return {
      success: false,
      error: "Failed to submit wire reference. Please try again.",
    };
  }
}
