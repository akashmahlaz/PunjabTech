"use client";

import { motion } from "framer-motion";
import {
  Phone, MapPin, Lightbulb, PenTool, Code, Rocket,
  CheckCircle2, ArrowRight, Clock, Users, Target,
  Palette, Smartphone, Globe, BarChart3
} from "lucide-react";
import Navbar from "@/app/home/_components/Navbar";
import Footer from "../home/_components/Footer";

const timeline = [
  {
    phase: "Phase 1",
    title: "Discovery & Strategy",
    duration: "Week 1",
    items: [
      "Initial consultation to understand your vision",
      "Market research and competitor analysis",
      "Define core features and MVP scope",
      "Create project roadmap and timeline",
      "Tech stack recommendation",
    ],
    icon: Lightbulb,
  },
  {
    phase: "Phase 2",
    title: "Design & Planning",
    duration: "Week 2",
    items: [
      "Wireframes and user flow design",
      "UI/UX design and branding",
      "Interactive prototypes",
      "Technical architecture planning",
      "Development sprint planning",
    ],
    icon: PenTool,
  },
  {
    phase: "Phase 3",
    title: "Development",
    duration: "Weeks 3-6",
    items: [
      "Frontend development (React Native/Web)",
      "Backend API development",
      "Database design and integration",
      "Third-party integrations",
      "Regular progress updates",
    ],
    icon: Code,
  },
  {
    phase: "Phase 4",
    title: "Testing & Launch",
    duration: "Weeks 7-8",
    items: [
      "Comprehensive QA testing",
      "Bug fixes and optimizations",
      "App Store & Play Store preparation",
      "Launch and deployment",
      "Performance monitoring setup",
    ],
    icon: Rocket,
  },
];

const methodologies = [
  { title: "Agile Development", desc: "Iterative approach with bi-weekly sprints for continuous improvement and flexibility." },
  { title: "Transparent Comm", desc: "Regular updates, clear communication, and full project visibility." },
  { title: "Quality First", desc: "Rigorous testing and code reviews to ensure high-quality deliverables." },
  { title: "User-Centric", desc: "Every decision made with your end users in mind." },
];

export default function ProcessPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-block mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              Our Process
            </span>
            <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl mb-6">
              From Idea to Launch in 4 Steps
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A proven, streamlined process designed to minimize risk and maximize results. No jargon, no confusion — just clear progress toward your goal.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="font-heading text-4xl md:text-5xl">How We Work</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              A clear, predictable timeline from kickoff to launch.
            </p>
          </motion.div>

          <div className="relative">
            {/* Connection Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-primary/50 to-secondary -translate-x-1/2 hidden lg:block" />

            <div className="space-y-12 lg:space-y-0">
              {timeline.map((phase, i) => (
                <motion.div
                  key={phase.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`lg:flex lg:items-center lg:justify-between ${i % 2 === 0 ? "" : "lg:flex-row-reverse"}`}
                >
                  <div className={`lg:w-[45%] ${i % 2 === 0 ? "lg:text-right" : "lg:text-left"}`}>
                    <div className={`inline-flex items-center gap-2 text-sm font-medium text-primary mb-2 ${i % 2 === 0 ? "lg:justify-end" : "lg:justify-start"}`}>
                      <Clock size={14} />
                      {phase.duration}
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-8 hover:shadow-warm transition-all">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                          <phase.icon size={24} className="text-primary" />
                        </div>
                        <div>
                          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {phase.phase}
                          </span>
                          <h3 className="font-heading text-xl">{phase.title}</h3>
                        </div>
                      </div>
                      <ul className="space-y-3">
                        {phase.items.map((item) => (
                          <li key={item} className={`flex items-start gap-2 text-sm text-muted-foreground`}>
                            <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Center Icon */}
                  <div className="hidden lg:flex lg:w-[10%] lg:justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-warm border-4 border-background shadow-warm">
                      <span className="font-heading text-lg text-primary-foreground">{i + 1}</span>
                    </div>
                  </div>

                  <div className="lg:w-[45%]" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What to Expect */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <span className="inline-block mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              What to Expect
            </span>
            <h2 className="font-heading text-4xl md:text-5xl">Working With Us</h2>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {methodologies.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-border bg-background p-8 text-center hover:shadow-warm transition-all"
              >
                <Users className="w-10 h-10 mx-auto mb-4 text-primary" />
                <h3 className="font-heading text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Deliverables */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <span className="inline-block mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              What You Get
            </span>
            <h2 className="font-heading text-4xl md:text-5xl">Deliverables</h2>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Smartphone, title: "Mobile App", desc: "Production-ready iOS & Android apps" },
              { icon: Globe, title: "Web Dashboard", desc: "Admin panel for content & user management" },
              { icon: Code, title: "Source Code", desc: "Full ownership of clean, documented code" },
              { icon: Palette, title: "Design Files", desc: "Figma files with complete design system" },
              { icon: BarChart3, title: "Analytics Setup", desc: "Tracking configured for key metrics" },
              { icon: Target, title: "Launch Checklist", desc: "App Store & Play Store ready assets" },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4 rounded-2xl border border-border bg-card p-6 hover:shadow-warm transition-all"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <item.icon size={22} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-heading text-lg">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-b from-card to-background">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <Phone className="w-16 h-16 mx-auto mb-6 text-primary" />
            <h2 className="font-heading text-4xl md:text-5xl mb-4">Let&apos;s Start Your Project</h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Book a free 30-minute discovery call to discuss your idea.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://wa.me/917814002784?text=Hi%20Akash%2C%20I%27d%20like%20to%20discuss%20a%20project"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-warm px-8 py-4 font-body font-semibold text-primary-foreground hover:shadow-warm transition-all"
              >
                Book a Discovery Call
                <ArrowRight size={18} />
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-8 py-4 font-body font-semibold hover:bg-card transition-all"
              >
                Contact Us
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}