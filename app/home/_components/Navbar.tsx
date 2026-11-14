"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { Menu, X, LayoutDashboard, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

type NavCta = {
  label: string;
  href: string;
  isDashboard?: boolean;
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [cta, setCta] = useState<NavCta>({
    label: "Build Startup",
    href: "/startup/new",
    isDashboard: false,
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchNavStatus() {
      try {
        const res = await fetch("/api/nav-status", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && data?.cta) {
          setCta(data.cta);
        }
      } catch {
        // Fallback to default
      }
    }

    fetchNavStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  // Simplified navigation links (App Development removed per user instruction)
  const links = [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: "Process", href: "/process" },
    { label: "Team", href: "/team" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-200/80 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        {/* Brand Logo */}
        <Link href="/" className="font-['Space_Grotesk'] text-xl font-bold tracking-tight text-neutral-900">
          PUNJAB<span className="text-orange-600">TECH</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-7 md:flex font-['Plus_Jakarta_Sans'] text-xs font-semibold text-neutral-600">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="transition-colors hover:text-neutral-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Right CTA (Material 3 Expressive Pill) */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href={cta.href}
            className={`inline-flex items-center gap-1.5 rounded-full px-5 py-2 font-['Plus_Jakarta_Sans'] text-xs font-semibold shadow-xs transition ${
              cta.isDashboard
                ? "bg-neutral-900 text-white hover:bg-neutral-800"
                : "bg-orange-600 text-white hover:bg-orange-700"
            }`}
          >
            {cta.isDashboard ? (
              <LayoutDashboard className="size-3.5" />
            ) : (
              <Sparkles className="size-3.5" />
            )}
            <span>{cta.label}</span>
            {!cta.isDashboard && <ArrowRight className="size-3" />}
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation menu"
          className="rounded-full p-1.5 text-neutral-700 hover:bg-neutral-100 md:hidden"
        >
          {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="border-t border-neutral-200/80 bg-white/95 px-6 py-5 backdrop-blur-xl md:hidden font-['Plus_Jakarta_Sans']">
          <div className="flex flex-col gap-3">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="py-1 text-sm font-semibold text-neutral-700 hover:text-neutral-900"
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-3 border-t border-neutral-100">
              <Link
                href={cta.href}
                onClick={() => setIsOpen(false)}
                className={`inline-flex w-full items-center justify-center gap-1.5 rounded-full py-2.5 text-center text-xs font-semibold text-white shadow-xs ${
                  cta.isDashboard ? "bg-neutral-900" : "bg-orange-600"
                }`}
              >
                {cta.isDashboard && <LayoutDashboard className="size-3.5" />}
                <span>{cta.label}</span>
                {!cta.isDashboard && <ArrowRight className="size-3.5" />}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
