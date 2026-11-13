"use client";

import { useActionState } from "react";
import { createStartup } from "../_lib/actions";
export default function StartupForm() {

    const [state, formAction, pending] = useActionState(
        createStartup,
        {}
    );

    return (
        <form action={formAction} className="space-y-6">

            {/* Startup Name */}
            <div className="space-y-2">

                <label
                    htmlFor="name"
                    className="text-sm font-medium text-gray-700"
                >
                    Startup name
                </label>

                <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="e.g. Punjab Tech"
                    required
                    maxLength={80}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-orange-500"
                />

                {state.fieldErrors?.name && (
                    <p className="text-sm text-red-500">
                        {state.fieldErrors.name[0]}
                    </p>
                )}

            </div>

            {/* Startup Description */}
            <div className="space-y-2">

                <label
                    htmlFor="description"
                    className="text-sm font-medium text-gray-700"
                >
                    What does your startup do?
                </label>

                <textarea
                    id="description"
                    name="description"
                    placeholder="Describe your startup and the problem you're solving..."
                    required
                    minLength={10}
                    maxLength={1000}
                    rows={5}
                    className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-orange-500"
                />

                {state.fieldErrors?.description && (
                    <p className="text-sm text-red-500">
                        {state.fieldErrors.description[0]}
                    </p>
                )}

            </div>

            {/* General Error */}
            {state.message && (
                <p className="text-sm text-red-500">
                    {state.message}
                </p>
            )}

            {/* Submit */}
            <button
                type="submit"
                disabled={pending}
                className="w-full rounded-xl bg-black px-6 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {pending ? "Creating startup..." : "Create startup"}
            </button>

        </form>
    );
}