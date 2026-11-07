"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate } from "framer-motion";
import { MessageCircle, ArrowUpRight, Sparkles, MoveRight } from "lucide-react";
import { Input } from "./ui/input";

const COMPANY_NAME = "Punjab Tech";

const EMAIL = "akashdalla406@gmail.com";

const BOOKING_URL =
  "https://calendly.com/akashdalla406/discovery-call-punjab-tech";

const SOCIAL_LINKS = {
  linkedin: "https://linkedin.com/company/punjabtech",
  github: "https://github.com/akashmahlaz",
  twitter: "https://twitter.com/punjabtech",
  whatsapp:
    "https://wa.me/917814002784?text=Hi%20Akash%2C%20I%27d%20like%20to%20discuss%20a%20project",
} as const;

const FOOTER_NAV = {
  services: {
    label: "Services",
    links: [
      { label: "Mobile App Development", href: "/app-development" },
      { label: "Legal & Compliance", href: "/legal" },
      { label: "Web Development", href: "/web-development" },
      { label: "Business Strategy", href: "/business-strategy" },
      { label: "Funding Guidance", href: "/funding-guidance" },
      { label: "Hiring Support", href: "/hiring-support" },
    ],
  },
  company: {
    label: "Company",
    links: [
      { label: "Home", href: "/" },
      { label: "Services", href: "/services" },
      { label: "Team", href: "/team" },
      { label: "Process", href: "/process" },
      { label: "Contact", href: "/contact" },
    ],
  },
} as const;

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Cookies", href: "/cookies" },
  { label: "Accessibility", href: "/accessibility" },
] as const;

// --- Inline brand icons ---
// (lucide-react@1.47 no longer exports Twitter/Linkedin/Github)
const Twitter = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M23.954 4.577c-.883.386-1.83.656-2.828.775 1.016-.606 1.796-1.543 2.165-2.713-.951.555-2.005.959-3.127 1.184-.897-.957-2.178-1.559-3.594-1.559-2.722 0-4.924 2.202-4.924 4.917 0 .386.044.76.127 1.124C8.208 8.287 5.17 6.644 3.04 4.062c-.427.72-.666 1.561-.666 2.475 0 1.71.87 3.196 2.188 4.079-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.106-6.102 2.106-.39 0-.776-.023-1.17-.067 2.189 1.397 4.768 2.215 7.557 2.215 9.054 0 14-7.503 14-14v-.617c.962-.695 1.8-1.562 2.46-2.549l-.047-.02z" />
  </svg>
);

const Linkedin = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.024-3.037-1.842-3.037-1.841 0-2.131 1.431-2.131 2.94v5.666H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.367-1.85 3.607 0 4.263 2.366 4.263 5.452v6.289zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.775 13.024H3.562V9h3.551v11.457zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const Github = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.609-4.042-1.609-.546-1.387-1.333-1.755-1.333-1.755-1.087-.745.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07.1835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-3.535 5.075-5.92 5.645.427.364.815 1.096.815 2.205 0 1.59-.015 2.885-.015 3.27 0 .315.205.695.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

// --- Magnetic Button Component ---
const MagneticWrapper = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    const rect = ref.current!.getBoundingClientRect();
    const middleX = clientX - (rect.left + rect.width / 2);
    const middleY = clientY - (rect.top + rect.height / 2);
    setPosition({ x: middleX * 0.3, y: middleY * 0.3 });
  };

  const reset = () => setPosition({ x: 0, y: 0 });

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// --- Spinning Orbital Badge CTA ---
const OrbitalCTA = () => {
  const text = "START A PROJECT • WORK WITH US • ";
  return (
    <MagneticWrapper className="relative flex h-36 w-36 cursor-pointer items-center justify-center rounded-full bg-background shadow-warm border border-primary/20 group hover:bg-primary transition-colors duration-500">
      <div className="absolute inset-0 animate-[spin_10s_linear_infinite] group-hover:animate-[spin_5s_linear_infinite]">
        <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible opacity-50 group-hover:opacity-100 group-hover:text-primary-foreground transition-all">
          <path id="circlePath" d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" fill="none" />
          <text fontSize="10.5" fontWeight="bold" className="fill-primary group-hover:fill-primary-foreground uppercase tracking-widest font-heading">
            <textPath href="#circlePath" startOffset="0%">{text}</textPath>
          </text>
        </svg>
      </div>
      <ArrowUpRight size={40} strokeWidth={1.5} className="text-primary group-hover:text-primary-foreground group-hover:scale-125 transition-transform duration-500" />
    </MagneticWrapper>
  );
};

const Footer = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const containerRef = useRef<HTMLElement>(null);

  // --- Scroll Parallax Marquee ---
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"],
  });
  const rawX = useTransform(scrollYProgress, [0, 1], [150, -150]);
  const smoothX = useSpring(rawX, { damping: 30, stiffness: 100 });

  // --- Mouse Spotlight ---
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  type MouseEvent = React.MouseEvent<HTMLDivElement>;
  const handleMouseMove = (e: MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const spotlightMask = useMotionTemplate`radial-gradient(500px circle at ${mouseX}px ${mouseY}px, black 10%, transparent 80%)`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setMessage("Invalid email.");
      return;
    }
    setMessage("Welcome aboard! 🚀");
    setTimeout(() => {
      window.location.href = `mailto:${EMAIL}?subject=Newsletter`;
    }, 1000);
  };

  return (
    <footer
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative mt-32 w-full overflow-hidden bg-background border-t border-border pt-10"
    >
      {/* Base Layer: Outlined Text */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center opacity-10">
        <h1
          className="text-[20vw] font-black leading-none font-heading whitespace-nowrap text-transparent"
          style={{ WebkitTextStroke: "2px var(--foreground)" }}
        >
          {COMPANY_NAME}
        </h1>
        <h1
          className="text-[20vw] font-black leading-none font-heading whitespace-nowrap text-transparent"
          style={{ WebkitTextStroke: "2px var(--foreground)" }}
        >
          {COMPANY_NAME}
        </h1>
      </div>

      {/* Hover Reveal Layer */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-0 flex flex-col items-center justify-center bg-background/50"
        style={{ WebkitMaskImage: spotlightMask, maskImage: spotlightMask }}
      >
        <div className="absolute inset-0 bg-gradient-warm opacity-10 blur-3xl mix-blend-multiply" />
        <h1 className="text-[20vw] font-black leading-none font-heading whitespace-nowrap text-gradient">
          {COMPANY_NAME}
        </h1>
        <h1 className="text-[20vw] font-black leading-none font-heading whitespace-nowrap text-gradient">
          {COMPANY_NAME}
        </h1>
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-12">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row items-end justify-between gap-10 border-b border-border/60 pb-16">
          <div className="max-w-xl">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-6 flex items-center gap-3 text-sm font-bold uppercase tracking-[0.2em] text-primary"
            >
              <span className="block h-px w-8 bg-primary" />
              Have an idea?
            </motion.p>
            <h2 className="text-5xl md:text-7xl font-heading font-black tracking-tighter text-foreground leading-[0.9]">
              Let&apos;s create the <br />
              <span className="italic font-light text-muted-foreground">impossible.</span>
            </h2>
          </div>

          <a href={BOOKING_URL}>
            <OrbitalCTA />
          </a>
        </div>

        {/* Links & Newsletter Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0 border-b border-border/60">
          {/* Company */}
          <div className="col-span-1 md:col-span-3 border-r-0 md:border-r border-b md:border-b-0 border-border/60 p-8 pl-0">
            <h3 className="mb-8 text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground">Company</h3>
            <ul className="flex flex-col gap-5">
              {FOOTER_NAV.company.links.map((link) => (
                <li key={link.href} className="group overflow-hidden">
                  <a href={link.href} className="flex items-center gap-2 text-xl font-heading font-medium text-foreground transition-all hover:text-primary">
                    <span className="relative flex overflow-hidden">
                      <span className="inline-block transition-transform duration-300 group-hover:-translate-y-full">{link.label}</span>
                      <span className="absolute left-0 inline-block translate-y-full transition-transform duration-300 group-hover:translate-y-0 text-primary">{link.label}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="col-span-1 md:col-span-3 border-r-0 md:border-r border-b md:border-b-0 border-border/60 p-8 md:pl-8">
            <h3 className="mb-8 text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground">Services</h3>
            <ul className="flex flex-col gap-5">
              {FOOTER_NAV.services.links.map((link) => (
                <li key={link.href} className="group overflow-hidden">
                  <a href={link.href} className="flex items-center gap-2 text-xl font-heading font-medium text-foreground transition-all hover:text-primary">
                    <span className="relative flex overflow-hidden">
                      <span className="inline-block transition-transform duration-300 group-hover:-translate-y-full">{link.label}</span>
                      <span className="absolute left-0 inline-block translate-y-full transition-transform duration-300 group-hover:translate-y-0 text-primary">{link.label}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-span-1 md:col-span-6 p-8 md:pl-12 flex flex-col justify-center">
            <h3 className="mb-4 text-3xl font-heading font-bold text-foreground">
              Stay ahead of the curve.
            </h3>
            <p className="mb-8 max-w-md text-muted-foreground">
              Join our exclusive newsletter for the latest tech insights, case studies, and design trends. No spam, ever.
            </p>

            <form onSubmit={handleSubmit} className="relative w-full max-w-md group">
              <div className="relative flex items-center overflow-hidden rounded-full border border-input bg-background shadow-soft transition-all duration-300 focus-within:border-ring focus-within:shadow-warm hover:border-input/50">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="h-9 border-0 bg-transparent px-3 text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-0 text-sm"
                />
                <button
                  type="submit"
                  className="mr-2 flex h-9 w-12 items-center justify-center rounded-full bg-foreground text-background transition-transform hover:scale-95 hover:bg-primary"
                >
                  <MoveRight size={18} />
                </button>
              </div>
              {message && (
                <motion.p initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="absolute -bottom-7 left-4 text-xs font-bold text-primary">
                  {message}
                </motion.p>
              )}
            </form>
          </div>
        </div>

        {/* Parallax Marquee */}
        <div className="relative flex overflow-hidden py-16">
          <motion.div style={{ x: smoothX }} className="flex whitespace-nowrap">
            {[...Array(3)].map((_, i) => (
              <h1 key={i} className="mr-8 text-7xl md:text-[140px] font-black font-heading tracking-tighter text-muted/30 select-none">
                BUILD • SCALE • WIN •
              </h1>
            ))}
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-sm font-medium text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} {COMPANY_NAME}.</span>
            <span className="hidden sm:inline-block">Designed in Punjab.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6">
            {LEGAL_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="hover:text-primary transition-colors">
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <a href={SOCIAL_LINKS.twitter} className="hover:text-primary hover:-translate-y-1 transition-transform"><Twitter size={18} /></a>
            <a href={SOCIAL_LINKS.linkedin} className="hover:text-primary hover:-translate-y-1 transition-transform"><Linkedin size={18} /></a>
            <a href={SOCIAL_LINKS.github} className="hover:text-primary hover:-translate-y-1 transition-transform"><Github size={18} /></a>
            <a href={SOCIAL_LINKS.whatsapp} className="hover:text-primary hover:-translate-y-1 transition-transform"><MessageCircle size={18} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;