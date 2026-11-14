"use server";

import { auth } from "@/app/auth/_lib/auth";
import { db } from "@/lib/db";
import { startup, startupAgreement, agreementSignature } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";
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
