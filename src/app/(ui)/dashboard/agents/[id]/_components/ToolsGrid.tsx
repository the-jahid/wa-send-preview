"use client"

import type React from "react"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// icons
import {
  Calendar,
  Mail,
  Folder,
  FileText,
  Table,
  Plug,
  Link2,
  PhoneCall,
  MessageSquare,
  Bot,
  Bell,
  CreditCard,
  Globe,
  Cloud,
  Database,
  UsersIcon,
  BarChart3,
  Settings,
  ClipboardList,
  Clock,
  Wrench,
} from "lucide-react"

type IconType = React.ComponentType<{ className?: string }>
type ToolStatus = "available" | "development" | "coming_soon"
type ToolItem = { slug: string; name: string; desc: string; icon: IconType; status: ToolStatus }

const TOOLS: ToolItem[] = [
  { slug: "googlecalendar", name: "Google Calendar", desc: "Sync events & availability", icon: Calendar, status: "available" },
  { slug: "gmail", name: "Gmail", desc: "Send follow-ups & parse replies", icon: Mail, status: "coming_soon" },
  { slug: "googleDrive", name: "Google Drive", desc: "Files & folders automations", icon: Folder, status: "coming_soon" },
  { slug: "googleDocs", name: "Google Docs", desc: "Generate docs & proposals", icon: FileText, status: "coming_soon" },
  { slug: "googleSheets", name: "Google Sheets", desc: "Append rows / read KPIs", icon: Table, status: "coming_soon" },
  { slug: "webhooks", name: "Webhooks", desc: "Trigger external workflows", icon: Plug, status: "coming_soon" },
  { slug: "integrations", name: "Integrations", desc: "Connect third-party tools", icon: Link2, status: "coming_soon" },
  { slug: "telephony", name: "Telephony", desc: "Outbound / inbound calls", icon: PhoneCall, status: "coming_soon" },
  { slug: "messaging", name: "Messaging", desc: "SMS / chat notifications", icon: MessageSquare, status: "coming_soon" },
  { slug: "aiBot", name: "AI Bot", desc: "Agent actions & skills", icon: Bot, status: "coming_soon" },
  { slug: "notifications", name: "Notifications", desc: "Alerting & reminders", icon: Bell, status: "coming_soon" },
  { slug: "billing", name: "Billing", desc: "Payments & invoices", icon: CreditCard, status: "coming_soon" },
  { slug: "web", name: "Web", desc: "Fetch / scrape / visit", icon: Globe, status: "coming_soon" },
  { slug: "cloudStorage", name: "Cloud Storage", desc: "Upload & retrieve assets", icon: Cloud, status: "coming_soon" },
  { slug: "database", name: "Database", desc: "Query & sync records", icon: Database, status: "coming_soon" },
  { slug: "crm", name: "CRM", desc: "Contacts & deals", icon: UsersIcon, status: "coming_soon" },
  { slug: "analyticsKit", name: "Analytics Kit", desc: "Dashboards & reports", icon: BarChart3, status: "coming_soon" },
  { slug: "settings", name: "Settings", desc: "Configuration options", icon: Settings, status: "coming_soon" },
  { slug: "checklists", name: "Checklists", desc: "Tasks & SOPs", icon: ClipboardList, status: "coming_soon" },
  { slug: "scheduler", name: "Scheduler", desc: "Background jobs", icon: Clock, status: "coming_soon" },
]

function getStatusBadge(status: ToolStatus) {
  switch (status) {
    case "available":
      return null
    case "development":
      return (
        <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] px-1.5 py-0 flex items-center gap-1">
          <Wrench className="h-3 w-3" />
          In Development
        </Badge>
      )
    case "coming_soon":
      return (
        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] px-1.5 py-0">
          Coming Soon
        </Badge>
      )
  }
}

export default function ToolsGrid({ agentId }: { agentId: string }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {TOOLS.map((t) => {
        const isClickable = t.status === "available" || t.status === "development"
        const CardWrapper = isClickable ? Link : "div"
        const cardProps = isClickable
          ? { href: `/dashboard/agents/${agentId}/${t.slug}`, className: "group" }
          : { className: "group cursor-not-allowed opacity-60" }

        return (
          <CardWrapper key={t.slug} {...cardProps as any}>
            <Card className={`h-full bg-white dark:bg-[#0d1424] border-slate-200 dark:border-white/10 transition-all ${isClickable ? 'hover:shadow-md dark:hover:border-white/20' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-2">
                    <t.icon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="font-medium text-slate-900 dark:text-white truncate">{t.name}</div>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">{t.desc}</div>
                    {getStatusBadge(t.status)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </CardWrapper>
        )
      })}
    </div>
  )
}
