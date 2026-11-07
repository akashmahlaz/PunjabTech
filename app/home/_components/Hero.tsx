"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-hero pt-28 pb-16">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-3xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-primary"
          >
            Startup Studio in Punjab, India
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 font-heading text-5xl leading-[1.1] md:text-7xl"
          >
            We Help Startups{" "}
            <em className="text-primary">Launch &amp; Scale</em>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mb-6 max-w-xl text-lg text-muted-foreground"
          >
            We build mobile apps, websites, CRMs, brands &amp; growth engines
            — one crew, one package, everything your startup needs to launch.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link
              href="/contact"
              className="group flex items-center gap-2 rounded-full bg-gradient-warm px-8 py-4 font-body text-base font-semibold text-primary-foreground transition-shadow hover:shadow-warm"
            >
              Start Your Journey
              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
            <a
              href="#services"
              className="rounded-full border border-foreground/20 px-8 py-4 font-body text-base font-medium text-foreground transition-colors hover:border-foreground/40"
            >
              What We Do
            </a>
          </motion.div>
        </div>

        {/* Team Group Photo */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mx-auto mt-16 max-w-5xl"
        >
          <div className="relative aspect-[1774/887] overflow-hidden rounded-2xl shadow-soft">
            <Image
              src="/our.png"
              alt="The Punjab Tech team"
              fill
              className="object-cover"
              priority
            />
          </div>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Our team of designers, developers, strategists &amp; growth experts
            — ready to launch your vision.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-8 md:grid-cols-4"
        >
          {[
            { value: "50+", label: "Projects Delivered" },
            { value: "40+", label: "Happy Clients" },
            { value: "7", label: "Apps on Play Store" },
            { value: "4 wks", label: "Avg. MVP Time" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-heading text-3xl text-foreground md:text-4xl">
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
