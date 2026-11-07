"use client";

import { motion } from "framer-motion";
import {
  Smartphone, Scale, Globe, BarChart3, Megaphone,
  Share2, Palette, Wallet, CreditCard, BookOpen,
  Users, Code2, Cloud, Shield, TrendingUp, Rocket, Headphones,
  ArrowRight, Sparkles, MoveRight, ArrowUpRight, ExternalLink
} from "lucide-react";
import Navbar from "@/app/home/_components/Navbar";
import Footer from "@/components/Footer";

const services = [
  {
    icon: Smartphone,
    title: "Mobile App Development",
    desc: "iOS & Android apps built with React Native & Expo — from MVP to App Store & Play Store publishing.",
    features: ["React Native & Expo", "Flutter", "iOS & Android", "App Store Publishing", "Push Notifications", "Offline Support"]
  },
  {
    icon: Scale,
    title: "Legal & Compliance",
    desc: "Company registration, contracts, and regulatory guidance.",
    features: ["Company Registration", "Contract Management", "Regulatory Compliance"]
  },
  {
    icon: Globe,
    title: "Websites & Web Apps",
    desc: "High-conversion websites, dashboards, and SaaS apps built with Next.js.",
    features: ["Next.js Development", "E-commerce Sites", "Admin Dashboards", "SaaS Platforms", "Landing Pages"]
  },
  {
    icon: Code2,
    title: "Custom Software",
    desc: "Tailor-made software solutions for unique business requirements.",
    features: ["Enterprise Software", "API Development", "System Integration", "Legacy Modernization", "Database Design"]
  },
  {
    icon: BarChart3,
    title: "CRM Integration",
    desc: "Seamless CRM setup to manage leads, sales, and customer relationships.",
    features: ["Salesforce Setup", "HubSpot Integration", "Custom Pipelines", "Automation", "Analytics"]
  },
  {
    icon: Megaphone,
    title: "Digital Marketing",
    desc: "SEO, PPC, and content strategies that drive real growth.",
    features: ["SEO Optimization", "Google Ads", "Content Strategy", "Email Marketing", "Analytics & Reporting"]
  },
  {
    icon: Share2,
    title: "Social Media Growth",
    desc: "Build your brand presence across all major platforms.",
    features: ["Instagram & Facebook", "LinkedIn Marketing", "Content Creation", "Community Management", "Influencer Partnerships"]
  },
  {
    icon: Palette,
    title: "Branding & Design",
    desc: "Logos, business cards, banners, and complete brand identity.",
    features: ["Logo Design", "Brand Guidelines", "UI/UX Design", "Marketing Collateral", "Brand Strategy"]
  },
  {
    icon: TrendingUp,
    title: "Growth Strategy",
    desc: "Data-driven strategies to scale your business.",
    features: ["Market Analysis", "Growth Hacking", "User Acquisition", "Retention Strategies", "Competitor Research"]
  },
  {
    icon: Wallet,
    title: "Funding Guidance",
    desc: "Navigate investors, grants, and fundraising strategies.",
    features: ["Pitch Deck Creation", "Investor Connections", "Grant Applications", "Financial Modeling", "Valuation"]
  },
  {
    icon: CreditCard,
    title: "Payment Integration",
    desc: "Secure payment gateways and billing systems for your app/web.",
    features: ["Stripe Integration", "Razorpay", "Subscription Billing", "Payment Security", "Multiple Currencies"]
  },
  {
    icon: Cloud,
    title: "Cloud Solutions",
    desc: "Scalable cloud infrastructure and deployment.",
    features: ["AWS Setup", "Google Cloud", "Azure", "CI/CD Pipelines", "DevOps"]
  },
  {
    icon: Shield,
    title: "Security & Compliance",
    desc: "Protect your app and ensure regulatory compliance.",
    features: ["Security Audits", "GDPR Compliance", "Data Encryption", "Penetration Testing", "OAuth & Auth"]
  },
  {
    icon: BookOpen,
    title: "Business Strategy",
    desc: "Market research, business plans, and competitive analysis.",
    features: ["Market Research", "Business Plans", "Competitive Analysis", "Go-to-Market Strategy", "ROI Projections"]
  },
  {
    icon: Users,
    title: "Hiring Support",
    desc: "Find and recruit the right talent for your growing team.",
    features: ["Tech Recruiting", "Technical Interviews", "Contract-to-Hire", "Team Augmentation", "Remote Hiring"]
  },
  {
    icon: Headphones,
    title: "Ongoing Support",
    desc: "Maintenance, updates, and crash fixes after launch.",
    features: ["24/7 Monitoring", "Bug Fixes", "Regular Updates", "Performance Optimization", "On-call Support"]
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-block mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              Our Services
            </span>
            <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl mb-6">
              Everything Your Startup Needs
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Mobile apps first. One crew, one package — from idea to a thriving business. We handle the tech so you can focus on growth.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-border/50 bg-card/30">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            {[
              { value: "50+", label: "Projects Delivered" },
              { value: "40+", label: "Happy Clients" },
              { value: "4", label: "Weeks Avg. MVP" },
              { value: "100%", label: "Success Rate" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="font-heading text-3xl md:text-4xl text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="font-heading text-4xl md:text-5xl">Comprehensive Solutions</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              From concept to launch and beyond — we provide end-to-end services for your startup.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/30 hover:shadow-warm"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 transition-transform group-hover:scale-110 group-hover:bg-primary/20">
                    <service.icon size={26} className="text-primary" />
                  </div>
                  <h3 className="font-heading text-xl text-foreground">{service.title}</h3>
                </div>
                <p className="text-muted-foreground mb-6">{service.desc}</p>
                <ul className="space-y-2">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-b from-card to-background">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <Rocket className="w-16 h-16 mx-auto mb-6 text-primary" />
            <h2 className="font-heading text-4xl md:text-5xl mb-4">Ready to Launch?</h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Let&apos;s discuss your project and find the perfect solution for your startup.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://wa.me/917814002784?text=Hi%20Akash%2C%20I%27m%20interested%20in%20your%20services"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-warm px-8 py-4 font-body font-semibold text-primary-foreground hover:shadow-warm transition-all"
              >
                Chat on WhatsApp
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-8 py-4 font-body font-semibold hover:bg-card transition-all"
              >
                Get a Quote
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}