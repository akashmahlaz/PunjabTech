"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CTA() {
  return (
    <section id="contact" className="py-24">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-2xl border border-border bg-card p-12 text-center md:p-20"
        >
          <div className="relative">
            <h2 className="mb-4 font-heading text-4xl md:text-5xl">
              Ready to <em className="text-primary">Build Your Startup?</em>
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-lg text-muted-foreground">
              Book a free, no-strings call. We&apos;ll map out your app, tech
              stack, timeline, and budget.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="https://wa.me/917814002784?text=Hi%20Akash%2C%20I%27d%20like%20to%20chat%20about%20a%20project"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 rounded-full bg-gradient-warm px-8 py-4 font-body text-base font-semibold text-primary-foreground transition-shadow hover:shadow-warm"
              >
                Chat on WhatsApp
                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              </a>
              <Link
                href="/contact"
                className="rounded-full border border-foreground/20 px-8 py-4 font-body text-base font-medium text-foreground transition-colors hover:border-foreground/40"
              >
                Start a Project
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
