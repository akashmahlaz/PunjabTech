"use server";

import { auth } from "@/app/auth/_lib/auth";

// Change this import if your Drizzle client is stored elsewhere.
import { db } from "@/lib/db";
import { startup } from "@/drizzle/schema";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { randomUUID } from "node:crypto";
import { z } from "zod";


const startupSchema = z.object({

    name: z.string()
        .trim()
        .min(2, "Startup name must contain at least 2 characters")
        .max(80, "Startup name cannot exceed 80 characters"),

    description: z.string()
        .trim()
        .min(10, "Description must contain at least 10 characters")
        .max(1000, "Description cannot exceed 1000 characters"),

});


export type StartupState = {
    fieldErrors?: {
        name?: string[];
        description?: string[];
    };

    message?: string;
};


export async function createStartup(
    previousState: StartupState,
    formData: FormData
): Promise<StartupState> {

    // 1. Get authenticated session

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/signup");
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

                // Always get user ID from Better Auth.
                createdByUserId: session.user.id,

                status: "draft",
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