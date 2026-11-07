"use client";

import { motion } from "framer-motion";
import Image from "next/image";

// Brand icon SVGs (lucide-react@1.47 no longer exports these)
const TwitterIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M23.954 4.577c-.883.386-1.83.656-2.828.775 1.016-.606 1.796-1.543 2.165-2.713-.951.555-2.005.959-3.127 1.184-.897-.957-2.178-1.559-3.594-1.559-2.722 0-4.924 2.202-4.924 4.917 0 .386.044.76.127 1.124C8.208 8.287 5.17 6.644 3.04 4.062c-.427.72-.666 1.561-.666 2.475 0 1.71.87 3.196 2.188 4.079-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.106-6.102 2.106-.39 0-.776-.023-1.17-.067 2.189 1.397 4.768 2.215 7.557 2.215 9.054 0 14-7.503 14-14v-.617c.962-.695 1.8-1.562 2.46-2.549l-.047-.02z" />
  </svg>
);

const LinkedinIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.024-3.037-1.842-3.037-1.841 0-2.131 1.431-2.131 2.94v5.666H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.367-1.85 3.607 0 4.263 2.366 4.263 5.452v6.289zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.775 13.024H3.562V9h3.551v11.457zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const GithubIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.609-4.042-1.609-.546-1.387-1.333-1.755-1.333-1.755-1.087-.745.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07.1835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-3.535 5.075-5.92 5.645.427.364.815 1.096.815 2.205 0 1.59-.015 2.885-.015 3.27 0 .315.205.695.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

interface TeamMember {
  name: string;
  role: string;
  img: string;
  desc: string;
  linkedin?: string;
  twitter?: string;
  github?: string;
}

const members: TeamMember[] = [
  {
    name: "Akash Mahla",
    role: "Founder & CEO",
    img: "/team-ceo.png",
    desc: "Exceptional Software Engineering, Product Engineering & 5 years Startup ecosystem experience.",
    linkedin: "https://linkedin.com/in/akashmahlax",
    twitter: "https://x.com/akashmahlax",
    github: "https://github.com/akashmahlaz?tab=repositories",
  },
  {
    name: "Sahil Dutt",
    role: "Lead Designer & Frontend Developer",
    img: "/sahil.png",
    desc: "Crafts pixel-perfect brands and digital experiences.",
    linkedin: "https://www.linkedin.com/in/sahildutt/",
    github: "https://sahilduttpb06.github.io/sahilportfolio",
  },
  {
    name: "Satinder Singh",
    role: "iOS & Android Developer",
    img: "/satinder.png",
    desc: "Full-stack architect building scalable products.",
  },
  {
    name: "Vickeramjit Singh",
    role: "Business Analyst & AI Product Engineer",
    img: "/vickeramjit-singh.png",
    desc: "Growth strategist who scales brands from zero.",
  },
  {
    name: "Arshdeep Singh",
    role: "Business Consultant",
    img: "/arshdeep.png",
    desc: "Guides startups through funding and strategy.",
  },
];

export default function Team() {
  return (
    <section id="team" className="py-24">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Meet The Crew
          </span>
          <h2 className="font-heading text-4xl md:text-5xl">
            The People Behind Your Success
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            A diverse team of experts committed to launching your startup.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group overflow-hidden rounded-xl border border-border bg-card transition-all hover:shadow-soft"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={member.img}
                  alt={member.name}
                  fill
                  sizes="(min-width: 1024px) 200px, 150px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="font-heading text-xl text-foreground">{member.name}</h3>
                <p className="mt-1 text-sm font-medium text-primary">{member.role}</p>
                <p className="mt-3 text-sm text-muted-foreground">{member.desc}</p>
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
  );
}
