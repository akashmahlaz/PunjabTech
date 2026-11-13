"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Navbar from "@/app/home/_components/Navbar";
import Footer from "../home/_components/Footer";
import { TwitterIcon, LinkedinIcon, GithubIcon } from "@/app/dashboard/_components/BrandIcons";

interface TeamMember {
  name: string;
  role: string;
  img: string;
  desc: string;
  skills: string[];
  linkedin?: string;
  twitter?: string;
  github?: string;
}

const team: TeamMember[] = [
  {
    name: "Akash Mahla",
    role: "Founder & CEO",
    img: "/team-ceo.png",
    desc: "Visionary leader with 10+ years in startup ecosystems. Passionate about helping entrepreneurs turn ideas into successful businesses.",
    skills: ["Strategy", "Leadership", "Business Development"],
    linkedin: "https://linkedin.com/in/akashmahlax",
    twitter: "https://x.com/akashmahlax",
    github: "https://github.com/akashmahlaz?tab=repositories"
  },
  {
    name: "Sahil Dutt",
    role: "Lead Designer & Frontend Developer",
    img: "/sahil.png",
    desc: "Crafts pixel-perfect brands and digital experiences. Award-winning designer with a passion for creating memorable user journeys.",
    skills: ["UI/UX Design", "Brand Identity", "Figma"],
    linkedin: "https://www.linkedin.com/in/sahildutt/",
    github: "https://sahilduttpb06.github.io/sahilportfolio"
  },
  {
    name: "Satinder Singh",
    role: "Head of Engineering & iOS Developer",
    img: "/satinder.png",
    desc: "Full-stack architect building scalable products. Expert in React Native, Node.js, and cloud infrastructure.",
    skills: ["React Native", "Node.js", "AWS"]
  },
  {
    name: "Vickeramjit Singh",
    role: "Business Analyst & Strategist",
    img: "/vickeramjit-singh.png",
    desc: "Growth strategist who scales brands from zero. Data-driven marketer with expertise in digital campaigns.",
    skills: ["Growth Marketing", "SEO", "PPC"]
  },
  {
    name: "Arshdeep Singh",
    role: "Business Consultant & Finance",
    img: "/arshdeep.png",
    desc: "Guides startups through funding and strategy. Former VC with deep expertise in fundraising and business planning.",
    skills: ["Fundraising", "Business Strategy", "Finance"]
  },
];

const values = [
  { title: "Excellence", desc: "We strive for excellence in everything we do, from code quality to client communication." },
  { title: "Innovation", desc: "We embrace new technologies and creative solutions to solve complex problems." },
  { title: "Transparency", desc: "We believe in open, honest communication throughout the entire project lifecycle." },
  { title: "Partnership", desc: "We treat your startup as our own, investing in your success as if it were ours." },
];

export default function TeamPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-block mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              Meet The Crew
            </span>
            <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl mb-6">
              The People Behind Your Success
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A diverse team of experts committed to launching your startup.
              We combine passion, expertise, and creativity to bring your vision to life.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Team Grid */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="font-heading text-4xl md:text-5xl">Our Leadership</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Talented individuals who bring diverse expertise and shared vision.
            </p>
          </motion.div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group rounded-2xl border border-border bg-card overflow-hidden transition-all hover:shadow-warm"
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img
                    src={member.img}
                    alt={member.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="p-6">
                  <h3 className="font-heading text-xl text-foreground">{member.name}</h3>
                  <p className="mt-1 text-sm font-medium text-primary">{member.role}</p>
                  <p className="mt-3 text-sm text-muted-foreground">{member.desc}</p>
                  {member.skills && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {member.skills.map((skill) => (
                        <span key={skill} className="text-xs bg-secondary/20 text-secondary px-2 py-0.5 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-4 flex gap-3">
                    {member.linkedin && (
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground transition-colors hover:text-primary"
                        aria-label="LinkedIn"
                      >
                        <LinkedinIcon size={18} />
                      </a>
                    )}
                    {member.twitter && (
                      <a
                        href={member.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground transition-colors hover:text-primary"
                        aria-label="Twitter"
                      >
                        <TwitterIcon size={18} />
                      </a>
                    )}
                    {member.github && (
                      <a
                        href={member.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground transition-colors hover:text-primary"
                        aria-label="GitHub"
                      >
                        <GithubIcon size={18} />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="font-heading text-4xl md:text-5xl">Our Values</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do.
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-border bg-background p-8"
              >
                <h3 className="font-heading text-xl mb-3 text-primary">{value.title}</h3>
                <p className="text-muted-foreground">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}