import { auth } from "@/app/auth/_lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import StartupForm from "./startup-form";

export default async function NewStartup() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/auth/sign-up");
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">

            <div className="w-full max-w-xl space-y-8">

                <div className="space-y-3">
                    <p className="text-sm font-medium text-orange-600">
                        GET STARTED
                    </p>

                    <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                        Let&apos;s build your startup.
                    </h1>

                    <p className="text-gray-500">
                        Tell us about your startup. You can complete
                        the remaining details later.
                    </p>
                </div>

                <StartupForm />

            </div>

        </main>
    );
}