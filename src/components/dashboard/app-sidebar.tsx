"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React, { useState, createContext, useContext } from "react";
import {
  Home,
  Bot,
  Sun,
  Moon,
  Calendar,
  Users,
  MessageSquare,
  BarChart2,
} from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "motion/react";

import { cn } from "@/lib/utils";

export const NAV_MAIN = [
  {
    href: "/dashboard/agents",
    label: "Agents",
    Icon: Bot,
    description: "Manage AI agents",
  },
  {
    href: "/dashboard/conversation",
    label: "Conversation",
    Icon: MessageSquare,
    description: "Chat conversations",
  },
  {
    href: "/dashboard/analytics",
    label: "Analytics",
    Icon: BarChart2,
    description: "Dashboard analytics",
  },
];

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(undefined);

const useSidebarContext = () => {
  const context = useContext(SidebarContext);
  if (!context) throw new Error("useSidebarContext must be used within AppSidebar");
  return context;
};

interface AppSidebarProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenBooking: () => void;
  onOpenLeads: () => void;
}

export function AppSidebar({ isDark, onToggleTheme, onOpenBooking, onOpenLeads }: AppSidebarProps) {
  const pathname = usePathname();
  const { user } = useUser();
  const [open, setOpen] = useState(false);

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate: true }}>
      <motion.aside
        className="hidden md:flex flex-col h-full border-r border-white/[0.06] bg-[#080d17]"
        animate={{ width: open ? "240px" : "64px" }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {/* Brand Header */}
        <div className="flex items-center h-14 px-3.5 border-b border-white/[0.06] shrink-0">
          <Link href="/dashboard" className="flex items-center min-w-0">
            <AnimatePresence mode="wait">
              {open ? (
                <motion.div
                  key="full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Image
                    src="/WapZen Logo-06.png"
                    alt="WapZen"
                    width={110}
                    height={28}
                    className="object-contain"
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="icon"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="h-8 w-8 flex items-center justify-center"
                >
                  <Image
                    src="/WapZen Logo.png"
                    alt="WapZen"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 py-3 px-2.5 overflow-y-auto overflow-x-hidden space-y-4">
          {/* Quick Actions */}
          <div className="space-y-1">
            <ActionButton icon={Calendar} label="Book Appointment" onClick={onOpenBooking} open={open} />
            <ActionButton icon={Users} label="Collect Lead" onClick={onOpenLeads} open={open} />
          </div>

          {/* Divider */}
          <div className="border-t border-white/[0.05]" />

          {/* Section Label */}
          <AnimatePresence>
            {open && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-1 text-[10px] font-semibold text-white/25 uppercase tracking-widest"
              >
                Main Menu
              </motion.p>
            )}
          </AnimatePresence>

          {/* Nav Items */}
          <nav className="space-y-0.5">
            {NAV_MAIN.map(({ href, label, Icon, description }) => {
              const active = pathname === href || (href !== "/dashboard" && pathname?.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  title={!open ? label : undefined}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg transition-all duration-150",
                    open ? "px-2.5 py-2" : "py-2 justify-center",
                    active
                      ? "bg-white/[0.08] text-white"
                      : "text-white/40 hover:bg-white/[0.04] hover:text-white/70",
                  )}
                >
                  {/* Active left bar */}
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 rounded-full bg-white/60" />
                  )}

                  <div
                    className={cn(
                      "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                      active
                        ? "bg-white/[0.1] text-white"
                        : "bg-white/[0.04] text-white/40 group-hover:bg-white/[0.07] group-hover:text-white/60",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  <AnimatePresence>
                    {open && (
                      <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.15 }}
                        className="flex-1 min-w-0 overflow-hidden"
                      >
                        <p className={cn("text-sm truncate font-medium", active ? "text-white" : "text-white/50 group-hover:text-white/70")}>
                          {label}
                        </p>
                        {description && (
                          <p className="text-[10px] text-white/25 truncate">{description}</p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Tooltip */}
                  {!open && (
                    <div className="absolute left-full ml-2.5 px-2 py-1 bg-[#1a2235] border border-white/[0.08] text-white text-xs font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-lg">
                      {label}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/[0.06] p-2.5 space-y-1 shrink-0">
          {/* Homepage */}
          <Link
            href="/"
            title={!open ? "Homepage" : undefined}
            className={cn(
              "group relative flex items-center gap-2.5 rounded-lg transition-colors text-white/40 hover:bg-white/[0.04] hover:text-white/70",
              open ? "px-2.5 py-2" : "py-2 justify-center",
            )}
          >
            <Home className="h-4 w-4 shrink-0" />
            <AnimatePresence>
              {open && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="text-sm overflow-hidden whitespace-nowrap"
                >
                  Homepage
                </motion.span>
              )}
            </AnimatePresence>
            {!open && (
              <div className="absolute left-full ml-2.5 px-2 py-1 bg-[#1a2235] border border-white/[0.08] text-white text-xs font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-lg">
                Homepage
              </div>
            )}
          </Link>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            title={!open ? (isDark ? "Light Mode" : "Dark Mode") : undefined}
            className={cn(
              "group relative flex items-center gap-2.5 w-full rounded-lg transition-colors text-white/40 hover:bg-white/[0.04] hover:text-white/70",
              open ? "px-2.5 py-2" : "py-2 justify-center",
            )}
          >
            {isDark ? <Sun className="h-4 w-4 shrink-0" /> : <Moon className="h-4 w-4 shrink-0" />}
            <AnimatePresence>
              {open && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="text-sm overflow-hidden whitespace-nowrap"
                >
                  {isDark ? "Light Mode" : "Dark Mode"}
                </motion.span>
              )}
            </AnimatePresence>
            {!open && (
              <div className="absolute left-full ml-2.5 px-2 py-1 bg-[#1a2235] border border-white/[0.08] text-white text-xs font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-lg">
                {isDark ? "Light Mode" : "Dark Mode"}
              </div>
            )}
          </button>

          {/* User Profile */}
          <div
            className={cn(
              "flex items-center gap-2.5 rounded-lg bg-white/[0.03] border border-white/[0.05] transition-colors",
              open ? "px-2.5 py-2" : "p-2 justify-center",
            )}
          >
            <UserButton
              afterSignOutUrl="/"
              appearance={{ elements: { avatarBox: "h-8 w-8" } }}
            />
            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex-1 min-w-0 overflow-hidden"
                >
                  <p className="text-xs font-medium text-white/80 truncate">
                    {user?.firstName || "User"}
                  </p>
                  <p className="text-[10px] text-white/30 truncate">
                    {user?.primaryEmailAddress?.emailAddress || "Account"}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {open && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-[10px] text-white/20 text-center pt-1"
              >
                v1.0.0 · © 2025 Wapzen
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>
    </SidebarContext.Provider>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  open,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  open: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={!open ? label : undefined}
      className={cn(
        "group relative flex items-center gap-2.5 w-full rounded-lg border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-150",
        open ? "px-2.5 py-2" : "py-2 justify-center",
      )}
    >
      <Icon className="h-4 w-4 text-white/50 shrink-0 group-hover:text-white/80 transition-colors" />
      <AnimatePresence>
        {open && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.15 }}
            className="text-sm font-medium text-white/60 group-hover:text-white/90 overflow-hidden whitespace-nowrap transition-colors"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
      {!open && (
        <div className="absolute left-full ml-2.5 px-2 py-1 bg-[#1a2235] border border-white/[0.08] text-white text-xs font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-lg">
          {label}
        </div>
      )}
    </button>
  );
}

// Legacy components for mobile menu compatibility
export function SidebarActionButton({
  collapsed,
  icon: Icon,
  label,
  onClick,
}: {
  collapsed: boolean;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/[0.14] rounded-xl transition-all",
        collapsed ? "h-10 w-10 p-0 justify-center" : "w-full px-4 py-2.5 justify-start",
      )}
    >
      <Icon className="h-4 w-4 text-white/50" />
      {!collapsed && <span className="text-sm text-white/70 font-medium">{label}</span>}
    </button>
  );
}

export function NavList({
  pathname,
  items,
  collapsed,
}: {
  pathname: string | null;
  items: typeof NAV_MAIN;
  collapsed: boolean;
}) {
  return (
    <nav className="grid gap-0.5">
      {items.map(({ href, label, Icon, description }) => {
        const active = pathname === href || (href !== "/dashboard" && pathname?.startsWith(href));

        if (collapsed) {
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={cn(
                "h-10 w-full flex items-center justify-center rounded-lg transition-all group relative",
                active ? "bg-white/[0.08] text-white" : "text-white/40 hover:bg-white/[0.04] hover:text-white/70",
              )}
            >
              <Icon className="h-4.5 w-4.5" />
              <div className="absolute left-full ml-2.5 px-2 py-1 bg-[#1a2235] border border-white/[0.08] text-white text-xs font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-lg">
                {label}
              </div>
            </Link>
          );
        }

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "relative flex items-center gap-3 px-2.5 py-2 rounded-lg transition-all group",
              active ? "bg-white/[0.08] text-white" : "text-white/40 hover:bg-white/[0.04] hover:text-white/70",
            )}
          >
            {active && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 rounded-full bg-white/60" />
            )}
            <div
              className={cn(
                "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                active ? "bg-white/[0.1]" : "bg-white/[0.04] group-hover:bg-white/[0.07]",
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{label}</p>
              {description && <p className="text-[10px] text-white/25 truncate">{description}</p>}
            </div>
            {active && <span className="h-1.5 w-1.5 rounded-full bg-white/40 shrink-0" />}
          </Link>
        );
      })}
    </nav>
  );
}
