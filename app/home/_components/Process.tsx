"use client";

import { motion } from "framer-motion";

const steps = [
  { num: "01", title: "Discovery Call", desc: "We learn about your vision, goals, and requirements." },
  { num: "02", title: "Strategy & Planning", desc: "Custom roadmap with timelines, tech stack, and deliverables." },
  { num: "03", title: "Design & Build", desc: "Our crew designs, develops, and integrates everything in parallel." },
  { num: "04", title: "Launch & Scale", desc: "We launch your startup and provide ongoing growth support." },
];

export default function Process() {
  return (
    <section id="process" className="bg-card py-24">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            How It Works
          </span>
          <h2 className="font-heading text-4xl md:text-5xl">
            From Idea to Launch in 4 Steps
          </h2>
        </motion.div>

        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl border border-border bg-background p-8 transition-all hover:shadow-warm"
            >
              <span className="mb-4 block font-heading text-5xl text-primary/20">
                {step.num}
              </span>
              <h3 className="mb-2 font-heading text-xl text-foreground">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
