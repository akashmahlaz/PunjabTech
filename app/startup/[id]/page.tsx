import { auth } from "@/app/auth/_lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function StartupPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/auth/sign-up");
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
            <div className="w-full max-w-xl text-center">
                <h1 className="text-3xl font-bold text-gray-900">
                    Startup Workspace
                </h1>
                <p className="mt-4 text-gray-500">
                    This page will be implemented in the next step.
                </p>
            </div>
        </main>
    );
}