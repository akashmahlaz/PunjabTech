"use client";
import { Apple, ArrowUpRight, Check, CreditCard, Globe2,  Scale, Users, WalletCards, } from "lucide-react";

import SpotlightCard from "@/components/SpotlightCard";

const Chip = ({ children, inverted = false, }: { children: React.ReactNode; inverted?: boolean; }) => ( <span className={ inverted ? "rounded-full border border-background/15 bg-background/10 px-2.5 py-1 text-[11px] font-medium text-background/80"  : "rounded-full border border-border bg-background/70 px-2.5 py-1 text-[11px] font-medium text-muted-foreground" } > {children}</span> );



const supportingServices = [
  {
    icon: Apple,
    title: "Mobile App Development",
    desc: "Listings, screenshots, submissions and review fixes.",
    href: "/app-store-publishing",
    chips: ["App Store", "Play Store"],
  },
  {
    icon: Scale,
    title: "SaaS Development",
    desc: "Custom SaaS platforms, scalable architecture and product development.",
    href: "/saas-development",
    chips: ["SaaS", "Scalable"],
  },
  {
    icon: Globe2,
    title: "Website Development",
    desc: "Modern, responsive websites built for performance and growth.",
    href: "/website-development",
    chips: ["Next.js", "SEO"],
  },
  {
    icon: Scale,
    title: "Legal & Compliance",
    desc: "Company setup, contracts and regulatory readiness.",
    href: "/legal",
    chips: ["Contracts", "Registration"],
  },
  {
    icon: WalletCards,
    title: "Funding Guidance",
    desc: "Investor narratives, financial models and pitch support.",
    href: "/funding-guidance",
    chips: ["Pitch decks", "Modeling"],
  },
  {
    icon: CreditCard,
    title: "Payment Integration",
    desc: "Secure checkout, subscriptions and global payments.",
    href: "/payment-integration",
    chips: ["Stripe", "Razorpay"],
  },
  {
    icon: Users,
    title: "Hiring Support",
    desc: "Technical screening and team-building support.",
    href: "/hiring-support",
    chips: ["Sourcing", "Interviews"],
  },
];

export default function Services() {
  return (
    <section
      id="services"
      aria-labelledby="services-title"
      className="overflow-hidden py-24"
    >
      <div className="container mx-auto px-6">
        <div className="grid auto-rows-fr gap-4 lg:grid-cols-12">
          {/* Add your primary service cards here */}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {supportingServices.map((service, index) => (
            <SpotlightCard
              key={service.title}
              href={service.href}
              label={`Explore ${service.title}`}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: index * 0.035 }}
              className="min-h-64 p-5 sm:p-6"
            >
              <div className="flex h-full flex-col">
                <div className="flex items-start justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-md border border-primary/15 bg-primary/10 text-primary">
                    <service.icon size={19} />
                  </span>

                  <ArrowUpRight className="text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" size={18} />
                </div>

                <h4 className="mt-6 font-heading text-xl leading-snug">
                  {service.title}
                </h4>

                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {service.desc}
                </p>

                <div className="mt-auto flex flex-wrap gap-1.5 pt-5">
                  {service.chips.map((chip) => (
                    <Chip key={chip}>{chip}</Chip>
                  ))}
                </div>
              </div>
            </SpotlightCard>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-xs font-medium text-muted-foreground">
          {[
            "Strategy-led",
            "Senior delivery",
            "Launch-ready",
            "Built to scale",
          ].map((item) => (
            <span key={item} className="flex items-center gap-2">
              <Check size={14} className="text-primary" />
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
