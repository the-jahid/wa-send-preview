"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
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

export default function Navbar({ toggleTheme, isDark }: NavbarProps) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Detect scroll position
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Check initial position

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 flex justify-center"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <motion.div
        className={`flex items-center justify-between transition-all duration-500 ease-out ${
          isScrolled
            ? "mt-4 mx-4 px-4 py-2 rounded-full border border-slate-200/50 dark:border-white/10 bg-white/80 dark:bg-[#0a0f1a]/90 backdrop-blur-xl shadow-lg shadow-black/5 dark:shadow-black/20"
            : "w-full px-4 sm:px-6 lg:px-8 py-4 bg-white/80 dark:bg-[#0a0f1a]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5"
        }`}
        layout
        transition={{
          layout: { type: "spring", stiffness: 300, damping: 30 },
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 mr-1 group flex-shrink-0"
        >
          <motion.div
            className="relative flex items-center justify-center overflow-hidden"
            animate={{
              height: isScrolled ? 40 : 36,
            }}
            transition={{ duration: 0.3 }}
          >
            <Image
              src={isScrolled ? "/WapZen Logo-05.png" : "/WapZen Logo-06.png"}
              alt="WapZen Logo"
              width={180}
              height={50}
              className="object-contain h-full w-auto"
              priority
            />
          </motion.div>
        </Link>

        {/* Animated Tabs Navigation - Desktop */}
        <nav
          className="hidden lg:flex items-center gap-0.5 p-1 rounded-full bg-slate-100/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/10"
          onMouseLeave={() => setActiveIdx(null)}
        >
          {NAV_ITEMS.map((item, idx) => (
            <Link
              key={item.id}
              href={item.href}
              onMouseEnter={() => setActiveIdx(idx)}
              className={`relative z-10 px-3 py-1.5 text-sm font-medium rounded-full transition-colors duration-200 ${
                activeIdx === idx
                  ? "text-slate-900 dark:text-white"
                  : "text-slate-400 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {activeIdx === idx && (
                <motion.span
                  layoutId="navbar-pill"
                  className="absolute inset-0 z-[-1] rounded-full bg-white dark:bg-white/15 shadow-sm"
                  transition={{
                    type: "spring",
                    bounce: 0.2,
                    duration: 0.6,
                  }}
                />
              )}
              {item.label}
            </Link>
          ))}

          {/* More Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setActiveIdx(NAV_ITEMS.length)}
          >
            <button
              className={`relative z-10 flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-full transition-colors duration-200 ${
                activeIdx === NAV_ITEMS.length
                  ? "text-slate-900 dark:text-white"
                  : "text-slate-400 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {activeIdx === NAV_ITEMS.length && (
                <motion.span
                  layoutId="navbar-pill"
                  className="absolute inset-0 z-[-1] rounded-full bg-white dark:bg-white/15 shadow-sm"
                  transition={{
                    type: "spring",
                    bounce: 0.2,
                    duration: 0.6,
                  }}
                />
              )}
              More
              <ChevronDown className="h-3.5 w-3.5" />
            </button>

            <div
              className="absolute top-full right-0 pt-3 w-64 transition-all duration-200"
              style={{
                opacity: activeIdx === NAV_ITEMS.length ? 1 : 0,
                transform:
                  activeIdx === NAV_ITEMS.length
                    ? "translateY(0)"
                    : "translateY(8px)",
                pointerEvents: activeIdx === NAV_ITEMS.length ? "auto" : "none",
              }}
            >
              <div className="p-4 bg-white dark:bg-[#0d1424] rounded-2xl border border-slate-200 dark:border-white/10 shadow-xl">
                <div className="mb-3 text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                  Free tools
                </div>
                <div className="space-y-1">
                  {[
                    {
                      name: "WhatsApp Number Checker",
                      href: "/free-tools/number-checker",
                    },
                  ].map((tool) => (
                    <Link
                      key={tool.name}
                      href={tool.href}
                      className="block px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors"
                    >
                      {tool.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 ml-2 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          <SignedOut>
            <AnimatePresence>
              {!isScrolled && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <SignInButton
                    mode="modal"
                    signUpForceRedirectUrl="/dashboard"
                  >
                    <button className="hidden sm:block px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap">
                      Sign in
                    </button>
                  </SignInButton>
                </motion.div>
              )}
            </AnimatePresence>
            <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
              <button className="group px-4 py-2 text-sm font-semibold rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-400 hover:to-emerald-500 transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 flex items-center gap-1.5 whitespace-nowrap">
                <span className={isScrolled ? "hidden sm:inline" : ""}>
                  Start Free
                </span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <Link
              href="/dashboard"
              className="px-4 py-2 text-sm font-semibold rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-400 hover:to-emerald-500 transition-all shadow-lg shadow-emerald-500/25 whitespace-nowrap"
            >
              Dashboard
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </button>
        </div>
      </motion.div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-x-4 top-20 lg:hidden bg-white dark:bg-[#0d1424] rounded-2xl border border-slate-200 dark:border-white/10 shadow-xl p-4"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <nav className="space-y-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-2 border-t border-slate-200 dark:border-white/10 mt-2">
                <div className="px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider">
                  Free Tools
                </div>
                <Link
                  href="/free-tools/number-checker"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-colors"
                >
                  WhatsApp Number Checker
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
