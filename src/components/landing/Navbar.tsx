"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { ArrowRight, Sun, Moon, ChevronDown, Menu, X } from "lucide-react";

interface NavbarProps {
  toggleTheme: () => void;
  isDark: boolean;
}

const NAV_ITEMS = [
  { id: "features", label: "Features", href: "/#features" },
  { id: "how-it-works", label: "How it works", href: "/#how-it-works" },
  { id: "pricing", label: "Pricing", href: "/#pricing" },
  { id: "use-cases", label: "Use Cases", href: "/#use-cases" },
  { id: "blog", label: "Blog", href: "/blog" },
];

const MORE_ITEMS = [
  { name: "WhatsApp Number Checker", href: "/free-tools/number-checker" },
];

export default function Navbar({ toggleTheme, isDark }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0 });
  const navRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | HTMLButtonElement | null)[]>([]);

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on resize
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setIsMobileMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Update pill position
  useEffect(() => {
    if (activeIdx !== null && itemRefs.current[activeIdx] && navRef.current) {
      const el = itemRefs.current[activeIdx]!;
      const navRect = navRef.current.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      setPillStyle({
        left: elRect.left - navRect.left,
        width: elRect.width,
      });
    }
  }, [activeIdx]);

  const handleNavLeave = () => {
    setActiveIdx(null);
    setMoreOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-500 ease-out ${
          isScrolled ? "pt-2 px-4" : "pt-0"
        }`}
      >
        <div
          className={`flex items-center justify-between w-full transition-all duration-500 ease-out ${
            isScrolled
              ? "max-w-4xl px-4 py-2 rounded-full border border-slate-200/60 dark:border-white/10 bg-white/85 dark:bg-slate-900/90 backdrop-blur-xl shadow-lg shadow-black/[0.04] dark:shadow-black/20"
              : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/5"
          }`}
        >
          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div
              className="relative flex items-center justify-center overflow-hidden transition-all duration-300"
              style={{ height: isScrolled ? 44 : 36 }}
            >
              <Image
                src={isScrolled ? "/WapZen Logo-05.png" : "/WapZen Logo green.png"}
                alt="WapZen Logo"
                width={180}
                height={50}
                className="object-contain h-full w-auto"
                priority
              />
            </div>
          </Link>

          {/* ── Desktop Nav ── */}
          <nav
            ref={navRef}
            className="hidden lg:flex items-center gap-0.5 p-1 rounded-full bg-slate-100/60 dark:bg-white/[0.06] border border-slate-200/50 dark:border-white/10 relative"
            onMouseLeave={handleNavLeave}
          >
            {/* Sliding pill indicator */}
            <span
              className="absolute top-1 h-[calc(100%-8px)] rounded-full bg-white dark:bg-white/15 shadow-sm transition-all duration-300 ease-out pointer-events-none"
              style={{
                left: pillStyle.left,
                width: pillStyle.width,
                opacity: activeIdx !== null ? 1 : 0,
                transform: activeIdx !== null ? "scaleX(1)" : "scaleX(0.9)",
              }}
            />

            {NAV_ITEMS.map((item, idx) => (
              <Link
                key={item.id}
                href={item.href}
                ref={(el) => { itemRefs.current[idx] = el; }}
                onMouseEnter={() => {
                  setActiveIdx(idx);
                  setMoreOpen(false);
                }}
                className={`relative z-10 px-3.5 py-1.5 text-sm font-medium rounded-full transition-colors duration-200 whitespace-nowrap ${
                  activeIdx === idx
                    ? "text-slate-900 dark:text-white"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}

            {/* More dropdown */}
            <div className="relative">
              <button
                ref={(el) => { itemRefs.current[NAV_ITEMS.length] = el; }}
                onMouseEnter={() => {
                  setActiveIdx(NAV_ITEMS.length);
                  setMoreOpen(true);
                }}
                className={`relative z-10 flex items-center gap-1 px-3.5 py-1.5 text-sm font-medium rounded-full transition-colors duration-200 ${
                  activeIdx === NAV_ITEMS.length
                    ? "text-slate-900 dark:text-white"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                More
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                    moreOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown panel */}
              <div
                className={`absolute top-full right-0 pt-3 w-64 transition-all duration-200 ${
                  moreOpen
                    ? "opacity-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 translate-y-2 pointer-events-none"
                }`}
                onMouseLeave={() => {
                  setMoreOpen(false);
                  setActiveIdx(null);
                }}
              >
                <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-xl shadow-black/[0.08] dark:shadow-black/30">
                  <div className="mb-2 px-3 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    Free Tools
                  </div>
                  {MORE_ITEMS.map((tool) => (
                    <Link
                      key={tool.name}
                      href={tool.href}
                      className="block px-3 py-2.5 text-sm text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/60 dark:hover:bg-emerald-500/10 rounded-xl transition-colors"
                    >
                      {tool.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </nav>

          {/* ── Right Actions ── */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="relative p-2 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-white/15 transition-all duration-200"
              aria-label="Toggle theme"
            >
              <span
                className={`block transition-all duration-300 ${
                  isDark ? "rotate-0 scale-100" : "rotate-90 scale-0 absolute inset-0 m-auto"
                }`}
              >
                {isDark && <Sun className="h-4 w-4" />}
              </span>
              <span
                className={`block transition-all duration-300 ${
                  !isDark ? "rotate-0 scale-100" : "-rotate-90 scale-0 absolute inset-0 m-auto"
                }`}
              >
                {!isDark && <Moon className="h-4 w-4" />}
              </span>
            </button>

            {/* Auth buttons */}
            <SignedOut>
              <div
                className={`hidden sm:block overflow-hidden transition-all duration-300 ${
                  isScrolled ? "max-w-0 opacity-0" : "max-w-[100px] opacity-100"
                }`}
              >
                <SignInButton mode="modal" signUpForceRedirectUrl="/dashboard">
                  <button className="px-3.5 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors whitespace-nowrap">
                    Sign in
                  </button>
                </SignInButton>
              </div>

              <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                <button className="group inline-flex items-center gap-1.5 px-4 py-2 h-9 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-cyan-500 rounded-full shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all duration-300 hover:-translate-y-px active:translate-y-0">
                  <span className={isScrolled ? "hidden sm:inline" : ""}>
                    Start Free
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </SignUpButton>
            </SignedOut>

            <SignedIn>
              <Link href="/dashboard">
                <button className="inline-flex items-center gap-1.5 px-5 py-2 h-9 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-cyan-500 rounded-full shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all duration-300 hover:-translate-y-px">
                  Dashboard
                </button>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileMenuOpen((v) => !v)}
              className="lg:hidden p-2 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              <div className="relative w-4 h-4">
                <span
                  className={`absolute left-0 block w-4 h-0.5 bg-current rounded-full transition-all duration-300 ${
                    isMobileMenuOpen
                      ? "top-[7px] rotate-45"
                      : "top-[3px] rotate-0"
                  }`}
                />
                <span
                  className={`absolute left-0 top-[7px] block w-4 h-0.5 bg-current rounded-full transition-all duration-300 ${
                    isMobileMenuOpen ? "opacity-0 scale-x-0" : "opacity-100 scale-x-100"
                  }`}
                />
                <span
                  className={`absolute left-0 block w-4 h-0.5 bg-current rounded-full transition-all duration-300 ${
                    isMobileMenuOpen
                      ? "top-[7px] -rotate-45"
                      : "top-[11px] rotate-0"
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Menu Overlay ── */}
      <div
        className={`fixed inset-0 z-40 bg-black/20 dark:bg-black/40 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* ── Mobile Menu Panel ── */}
      <div
        className={`fixed inset-x-4 top-[72px] z-50 lg:hidden bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-2xl shadow-black/[0.08] dark:shadow-black/30 overflow-hidden transition-all duration-300 origin-top ${
          isMobileMenuOpen
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 -translate-y-3 pointer-events-none"
        }`}
      >
        <nav className="p-3">
          {NAV_ITEMS.map((item, idx) => (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors"
              style={{
                transitionDelay: isMobileMenuOpen ? `${idx * 50}ms` : "0ms",
              }}
            >
              {item.label}
            </Link>
          ))}

          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/5">
            <div className="px-4 py-2 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Free Tools
            </div>
            {MORE_ITEMS.map((tool) => (
              <Link
                key={tool.name}
                href={tool.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/60 dark:hover:bg-emerald-500/10 rounded-xl transition-colors"
              >
                {tool.name}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </>
  );
}