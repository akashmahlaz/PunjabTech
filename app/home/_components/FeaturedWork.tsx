"use client";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ExternalLink,
  Download,
  Smartphone,
  Globe,
  Sparkles,
  Play,
  Pause,
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useState, useRef, type ReactNode } from "react";

/* ─────────────────────────────────────────────────────────────
   Browser chrome frame
───────────────────────────────────────────────────────────── */

const BrowserFrame = ({
  url,
  variant = "light",
  children,
}: {
  url: string;
  variant?: "light" | "dark";
  children: ReactNode;
}) => (
  <div
    className={`overflow-hidden rounded-xl border shadow-lg ${
      variant === "dark"
        ? "border-white/10 shadow-white/5"
        : "border-border shadow-black/5"
    }`}
  >
    {/* Browser title bar */}
    <div
      className={`flex items-center gap-3 px-4 py-3 ${
        variant === "dark" ? "bg-slate-800" : "bg-muted/80"
      }`}
    >
      {/* Browser dots */}
      <div className="flex gap-1.5">
        <span className="h-3 w-3 rounded-full bg-red-400" />
        <span className="h-3 w-3 rounded-full bg-yellow-400" />
        <span className="h-3 w-3 rounded-full bg-green-400" />
      </div>

      {/* Address bar */}
      <div
        className={`flex-1 truncate rounded-md px-3 py-1 text-xs ${
          variant === "dark"
            ? "bg-slate-700 text-slate-300"
            : "bg-background text-muted-foreground"
        }`}
      >
        {url}
      </div>
    </div>

    {/* Website body */}
    <div className="relative">{children}</div>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   Configurable iframe preview

   Each website can have its own scale.

   scale = 1     → normal
   scale = 0.75  → website rendered larger, then scaled down
   scale = 0.5   → desktop website rendered at 2x viewport
───────────────────────────────────────────────────────────── */

const IframePreview = ({
  src,
  variant = "light",
  scale = 1,
}: {
  src: string;
  variant?: "light" | "dark";
  scale?: number;
}) => {
  const safeScale = Math.max(0.25, Math.min(scale, 1));

  return (
    <div
      className={`relative aspect-[16/10] w-full overflow-hidden ${
        variant === "dark" ? "bg-slate-900" : "bg-white"
      }`}
    >
      <iframe
        src={src}
        className="absolute left-0 top-0 border-0"
        title={`Preview of ${src}`}
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        style={{
          width: `${100 / safeScale}%`,
          height: `${100 / safeScale}%`,
          transform: `scale(${safeScale})`,
          transformOrigin: "top left",
        }}
      />
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   Tag pill
───────────────────────────────────────────────────────────── */

const Tag = ({ label }: { label: string }) => (
  <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
    {label}
  </span>
);

/* ─────────────────────────────────────────────────────────────
   Video player
───────────────────────────────────────────────────────────── */

const VideoPlayer = ({
  src,
  poster,
}: {
  src: string;
  poster?: string;
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="aspect-[4/3] w-full object-cover"
        loop
        muted
        playsInline
        onClick={togglePlay}
      />

      <div
        className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={togglePlay}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-lg">
          {isPlaying ? (
            <Pause className="ml-1 h-6 w-6 text-slate-700" />
          ) : (
            <Play className="ml-1 h-6 w-6 text-slate-700" />
          )}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   Main section
───────────────────────────────────────────────────────────── */

const FeaturedWork = () => {
  return (
    <section id="work" className="py-24">
      <div className="container mx-auto px-6">

        {/* ─────────────────────────────────────────────────────
            Header
        ───────────────────────────────────────────────────── */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20 text-center"
        >
          <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Featured Work
          </span>

          <h2 className="font-heading text-4xl md:text-5xl">
            Startups We've Built & Scaled
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Built, Scaled, and helped founders to get funding to scale their products.
          </p>
        </motion.div>




        {/* ─────────────────────────────────────────────────────
            PROJECT 0.1 — MUVXTMS AI
        ───────────────────────────────────────────────────── */}

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="group mb-20 grid items-center gap-10 md:grid-cols-2 lg:gap-16"
        >
          {/* Text — LEFT */}
          <div className="flex flex-col gap-5 md:order-1">
            <div className="flex items-center gap-2 text-sm text-primary">
              <Globe size={16} />

              <span className="font-semibold uppercase tracking-wider">
                Enterprice Software
              </span>
            </div>

            <h3 className="font-heading text-3xl leading-tight md:text-4xl">
              MUVX-TMS AI
            </h3>

            <p className="text-lg font-medium italic text-muted-foreground/80">
              AI Enterprice Software for Trucking Industry
            </p>

            <p className="leading-relaxed text-muted-foreground">
              A fully Automonous Trucking industry fleet managment system built for
              north america industry, enterprice security, ai copilot, workspaces with unlimited members
            </p>

            <div className="flex flex-wrap gap-2">
              <Tag label="Enterprice Security" />
              <Tag label="Claude AI Copilot" />
              <Tag label="MCP" />
            </div>

            <div className="flex w-fit items-center gap-2 rounded-lg bg-primary/5 px-4 py-3">
              <Sparkles size={16} className="text-primary" />

              <span className="text-sm font-semibold">
                Fully Autonoumous Enterprice AI Powered TMS
              </span>
            </div>

            <a
              href="https://app.muvxtms.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group/btn mt-1 flex w-fit items-center gap-2 rounded-full border border-foreground/20 px-6 py-3 text-sm font-semibold text-foreground transition-all hover:border-primary hover:text-primary"
            >
              Visit Live Site

              <ExternalLink
                size={16}
                className="transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
              />
            </a>
          </div>

          {/* Iframe — RIGHT */}
          <div className="relative md:order-2">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-emerald-500/5 via-transparent to-sky-500/5 blur-2xl" />

            <div className="relative transition-transform duration-700 group-hover:scale-[1.01]">
              <BrowserFrame
                url="app.muvxtms.com"
                variant="light"
              >
                <IframePreview
                  src="https://app.muvxtms.com"
                  variant="light"
                  scale={0.65}
                />
              </BrowserFrame>
            </div>
          </div>
        </motion.div>








        {/* ─────────────────────────────────────────────────────
            PROJECT 1 — MOBILE APPS
        ───────────────────────────────────────────────────── */}

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="group mb-20 grid items-center gap-10 md:grid-cols-2 lg:gap-16"
        >
          {/* Carousel */}
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5 blur-2xl" />

            <div className="relative">
              <Carousel className="w-full" opts={{ loop: true }}>
                <CarouselContent>

                  <CarouselItem>
                    <div className="p-1">
                      <div className="overflow-hidden rounded-2xl">
                        <img
                          src={"/mobile-apps.png"}
                          alt="Mobile Apps Mockup"
                          className="aspect-[4/3] w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  </CarouselItem>

                  <CarouselItem>
                    <div className="p-1">
                      <div className="overflow-hidden rounded-2xl">
                        <img
                          src={"/app-portfolio-previews.png"}
                          alt="Mobile Apps Portfolio Preview"
                          className="aspect-[4/3] w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  </CarouselItem>

                  <CarouselItem>
                    <div className="p-1">
                      <VideoPlayer
                        src={"/mobile-video.mp4"}
                        poster={"/mobile-apps.png"}
                      />
                    </div>
                  </CarouselItem>

                </CarouselContent>

                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </Carousel>
            </div>
          </div>

          {/* Text */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2 text-sm text-primary">
              <Smartphone size={16} />

              <span className="font-semibold uppercase tracking-wider">
                Mobile Apps
              </span>
            </div>

            <h3 className="font-heading text-3xl leading-tight md:text-4xl">
              Mindset · Sailors
            </h3>

            <p className="leading-relaxed text-muted-foreground">
              From concept to Play Store in 4 weeks. Two production apps built
              with React Native, serving real users daily — meditation and
              maritime networking.
            </p>

            <div className="flex flex-wrap gap-2">
              <Tag label="React Native" />
              <Tag label="Expo" />
              <Tag label="iOS & Android" />
            </div>

            <div className="flex w-fit items-center gap-2 rounded-lg bg-primary/5 px-4 py-3">
              <Sparkles size={16} className="text-primary" />

              <span className="text-sm font-semibold">
                Our Apps Live on Play Store
              </span>
            </div>

            <a
              href="https://play.google.com/store/search?q=pub:Punjab+Tech&c=apps"
              target="_blank"
              rel="noopener noreferrer"
              className="group/btn mt-1 flex w-fit items-center gap-2 rounded-full bg-gradient-warm px-6 py-3 text-sm font-semibold text-primary-foreground transition-shadow hover:shadow-warm"
            >
              <Download size={16} />

              Download Apps

              <ArrowRight
                size={16}
                className="transition-transform group-hover/btn:translate-x-1"
              />
            </a>
          </div>
        </motion.div>

        {/* ─────────────────────────────────────────────────────
            PROJECT 2 — JUSTBECAUSE NETWORK
        ───────────────────────────────────────────────────── */}

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="group mb-20 grid items-center gap-10 md:grid-cols-2 lg:gap-16"
        >
          {/* Text — LEFT */}
          <div className="flex flex-col gap-5 md:order-1">
            <div className="flex items-center gap-2 text-sm text-primary">
              <Globe size={16} />

              <span className="font-semibold uppercase tracking-wider">
                Web Platform
              </span>
            </div>

            <h3 className="font-heading text-3xl leading-tight md:text-4xl">
              JustBeCause Network
            </h3>

            <p className="text-lg font-medium italic text-muted-foreground/80">
              AI-Powered NGO Job Platform
            </p>

            <p className="leading-relaxed text-muted-foreground">
              A full-stack platform connecting NGOs worldwide with skilled
              professionals. Features an AI-powered search engine, job matching,
              verified profiles, and real-time collaboration tools.
            </p>

            <div className="flex flex-wrap gap-2">
              <Tag label="Next.js" />
              <Tag label="AI Search" />
              <Tag label="PostgreSQL" />
            </div>

            <div className="flex w-fit items-center gap-2 rounded-lg bg-primary/5 px-4 py-3">
              <Sparkles size={16} className="text-primary" />

              <span className="text-sm font-semibold">
                Connecting Skills to Purpose — Globally
              </span>
            </div>

            <a
              href="https://justbecausenetwork.com/en"
              target="_blank"
              rel="noopener noreferrer"
              className="group/btn mt-1 flex w-fit items-center gap-2 rounded-full border border-foreground/20 px-6 py-3 text-sm font-semibold text-foreground transition-all hover:border-primary hover:text-primary"
            >
              Visit Live Site

              <ExternalLink
                size={16}
                className="transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
              />
            </a>
          </div>

          {/* Iframe — RIGHT */}
          <div className="relative md:order-2">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-emerald-500/5 via-transparent to-sky-500/5 blur-2xl" />

            <div className="relative transition-transform duration-700 group-hover:scale-[1.01]">
              <BrowserFrame
                url="justbecausenetwork.com/en"
                variant="light"
              >
                <IframePreview
                  src="https://unseens.vercel.app/en"
                  variant="light"
                  scale={0.65}
                />
              </BrowserFrame>
            </div>
          </div>
        </motion.div>

        {/* ─────────────────────────────────────────────────────
            PROJECT 3 — AGENTS FOR BUSINESS
        ───────────────────────────────────────────────────── */}

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="group mb-16 grid items-center gap-10 md:grid-cols-2 lg:gap-16"
        >
          {/* Iframe — LEFT */}
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-purple-500/5 via-transparent to-orange-500/5 blur-2xl" />

            <div className="relative transition-transform duration-700 group-hover:scale-[1.01]">
              <BrowserFrame
                url="agentsforbusiness.lovable.app"
                variant="dark"
              >
                <IframePreview
                  src="https://agentsforbusiness.lovable.app"
                  variant="dark"
                  scale={0.7}
                />
              </BrowserFrame>
            </div>
          </div>

          {/* Text — RIGHT */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2 text-sm text-primary">
              <Sparkles size={16} />

              <span className="font-semibold uppercase tracking-wider">
                SaaS Platform
              </span>
            </div>

            <h3 className="font-heading text-3xl leading-tight md:text-4xl">
              Agents For Business
            </h3>

            <p className="text-lg font-medium italic text-muted-foreground/80">
              AI Agent Management Platform
            </p>

            <p className="leading-relaxed text-muted-foreground">
              Enterprise-grade platform to design, deploy, and observe AI agents
              across support, sales, and operations — from one calm,
              opinionated control room.
            </p>

            <div className="flex flex-wrap gap-2">
              <Tag label="SaaS" />
              <Tag label="AI Agents" />
              <Tag label="React" />
            </div>

            <div className="flex w-fit items-center gap-2 rounded-lg bg-primary/5 px-4 py-3">
              <Sparkles size={16} className="text-primary" />

              <span className="text-sm font-semibold">
                200+ Tool Adapters · 99.98% Uptime
              </span>
            </div>

            <a
              href="https://agentsforbusiness.lovable.app"
              target="_blank"
              rel="noopener noreferrer"
              className="group/btn mt-1 flex w-fit items-center gap-2 rounded-full border border-foreground/20 px-6 py-3 text-sm font-semibold text-foreground transition-all hover:border-primary hover:text-primary"
            >
              Visit Live Site

              <ExternalLink
                size={16}
                className="transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
              />
            </a>
          </div>
        </motion.div>

        {/* ─────────────────────────────────────────────────────
            PROJECT 4 — HIRINGBULL
        ───────────────────────────────────────────────────── */}

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="group mb-16 grid items-center gap-10 md:grid-cols-2 lg:gap-16"
        >
          {/* Text — LEFT */}
          <div className="flex flex-col gap-5 md:order-1">
            <div className="flex items-center gap-2 text-sm text-primary">
              <Globe size={16} />

              <span className="font-semibold uppercase tracking-wider">
                Web Platform
              </span>
            </div>

            <h3 className="font-heading text-3xl leading-tight md:text-4xl">
              HiringBull
            </h3>

            <p className="text-lg font-medium italic text-muted-foreground/80">
              Smart Job Discovery Platform
            </p>

            <p className="leading-relaxed text-muted-foreground">
              A modern job discovery platform helping candidates find their
              dream jobs with AI-powered recommendations, company insights,
              and seamless application tracking.
            </p>

            <div className="flex flex-wrap gap-2">
              <Tag label="Next.js" />
              <Tag label="AI Matching" />
              <Tag label="TypeScript" />
            </div>

            <div className="flex w-fit items-center gap-2 rounded-lg bg-primary/5 px-4 py-3">
              <Sparkles size={16} className="text-primary" />

              <span className="text-sm font-semibold">
                Connecting Talent with Opportunity
              </span>
            </div>

            <a
              href="https://hiringbull.org"
              target="_blank"
              rel="noopener noreferrer"
              className="group/btn mt-1 flex w-fit items-center gap-2 rounded-full border border-foreground/20 px-6 py-3 text-sm font-semibold text-foreground transition-all hover:border-primary hover:text-primary"
            >
              Visit Live Site

              <ExternalLink
                size={16}
                className="transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
              />
            </a>
          </div>

          {/* Iframe — RIGHT */}
          <div className="relative md:order-2">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/5 blur-2xl" />

            <div className="relative transition-transform duration-700 group-hover:scale-[1.01]">
              <BrowserFrame
                url="hiringbull.org"
                variant="light"
              >
                <IframePreview
                  src="https://hiringbull.org"
                  variant="light"
                  scale={0.5}
                />
              </BrowserFrame>
            </div>
          </div>
        </motion.div>

        {/* ─────────────────────────────────────────────────────
            SEE ALL WORK
        ───────────────────────────────────────────────────── */}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-8 text-center"
        >
          <a
            href="/contact"
            className="group/all inline-flex items-center gap-2 text-lg font-semibold text-foreground transition-colors hover:text-primary"
          >
            See All Work

            <ArrowRight
              size={20}
              className="transition-transform group-hover/all:translate-x-2"
            />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedWork;
