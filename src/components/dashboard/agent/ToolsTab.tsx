














'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Calendar, Mail, Folder, FileText, Table, Plug, Link2, PhoneCall,
  MessageSquare, Bot, Bell, CreditCard, Globe, Cloud, Database,
  Users as UsersIcon, BarChart3, Settings, ClipboardList, Clock,
} from 'lucide-react';

type IconType = React.ComponentType<{ className?: string }>;
type ToolItem = { slug: string; name: string; desc: string; icon: IconType };

const TOOLS: ToolItem[] = [
  { slug: 'googlecalendar', name: 'Google Calendar', desc: 'Sync events & availability', icon: Calendar },
  { slug: 'gmail',          name: 'Gmail',           desc: 'Send follow-ups & parse replies', icon: Mail },
  { slug: 'googledrive',    name: 'Google Drive',    desc: 'Files & folders automations', icon: Folder },
  { slug: 'googledocs',     name: 'Google Docs',     desc: 'Generate docs & proposals', icon: FileText },
  { slug: 'googlesheets',   name: 'Google Sheets',   desc: 'Append rows / read KPIs', icon: Table },
  { slug: 'webhooks',       name: 'Webhooks',        desc: 'Trigger external workflows', icon: Plug },
  { slug: 'integrations',   name: 'Integrations',    desc: 'Connect third-party tools', icon: Link2 },
  { slug: 'telephony',      name: 'Telephony',       desc: 'Outbound / inbound calls', icon: PhoneCall },
  { slug: 'messaging',      name: 'Messaging',       desc: 'SMS / chat notifications', icon: MessageSquare },
  { slug: 'aibot',          name: 'AI Bot',          desc: 'Agent actions & skills', icon: Bot },
  { slug: 'notifications',  name: 'Notifications',   desc: 'Alerting & reminders', icon: Bell },
  { slug: 'billing',        name: 'Billing',         desc: 'Payments & invoices', icon: CreditCard },
  { slug: 'web',            name: 'Web',             desc: 'Fetch / scrape / visit', icon: Globe },
  { slug: 'cloudstorage',   name: 'Cloud Storage',   desc: 'Upload & retrieve assets', icon: Cloud },
  { slug: 'database',       name: 'Database',        desc: 'Query & sync records', icon: Database },
  { slug: 'crm',            name: 'CRM',             desc: 'Contacts & deals', icon: UsersIcon },
  { slug: 'analyticskit',   name: 'Analytics Kit',   desc: 'Dashboards & reports', icon: BarChart3 },
  { slug: 'settings',       name: 'Settings',        desc: 'Configuration options', icon: Settings },
  { slug: 'checklists',     name: 'Checklists',      desc: 'Tasks & SOPs', icon: ClipboardList },
  { slug: 'scheduler',      name: 'Scheduler',       desc: 'Background jobs', icon: Clock },
];

export default function ToolsTab({ agentId }: { agentId: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tools</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {TOOLS.map((t) => (
            <Link key={t.slug} href={`/dashboard/agents/${agentId}/${t.slug}`} className="group">
              <Card className="h-full transition-shadow group-hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg border p-2">
                      <t.icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium">{t.name}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2">{t.desc}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}




