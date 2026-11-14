"use client";

import { useActionState } from "react";
import { createStartup } from "../actions";
import { ArrowRight, Loader2 } from "lucide-react";

export default function StartupForm() {
  const [state, formAction, pending] = useActionState(createStartup, {});

  return (
    <form action={formAction} className="space-y-6">
      {/* Startup Name */}
      <div className="space-y-2">
        <label
          htmlFor="name"
          className="font-['Plus_Jakarta_Sans'] text-xs font-semibold uppercase tracking-wider text-neutral-700"
        >
          Startup Name
        </label>

        <input
          id="name"
          name="name"
          type="text"
          placeholder="e.g. Acme Health AI"
          required
          maxLength={80}
          className="w-full rounded-2xl border border-neutral-200 bg-neutral-50/60 px-4 py-3.5 font-['Inter'] text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-900 focus:bg-white"
        />

        {state.fieldErrors?.name && (
          <p className="font-['Inter'] text-xs font-medium text-rose-500">{state.fieldErrors.name[0]}</p>
        )}
      </div>

      {/* Startup Idea / Description */}
      <div className="space-y-2">
        <label
          htmlFor="description"
          className="font-['Plus_Jakarta_Sans'] text-xs font-semibold uppercase tracking-wider text-neutral-700"
        >
          Startup Idea
        </label>

        <textarea
          id="description"
          name="description"
          placeholder="Describe your startup idea, what problem it solves, and your vision..."
          required
          minLength={10}
          maxLength={1500}
          rows={5}
          className="w-full resize-none rounded-2xl border border-neutral-200 bg-neutral-50/60 p-4 font-['Inter'] text-sm leading-relaxed text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-900 focus:bg-white"
        />

        {state.fieldErrors?.description && (
          <p className="font-['Inter'] text-xs font-medium text-rose-500">{state.fieldErrors.description[0]}</p>
        )}
      </div>

      {/* General Error */}
      {state.message && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3.5 font-['Inter'] text-xs text-rose-600">
          {state.message}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={pending}
        className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-neutral-900 px-6 py-4 font-['Plus_Jakarta_Sans'] text-sm font-semibold text-white shadow-2xs transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            <span>Submitting details...</span>
          </>
        ) : (
          <>
            <span>Continue</span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </button>
    </form>
  );
}
