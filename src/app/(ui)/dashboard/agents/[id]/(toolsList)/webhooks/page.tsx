"use client"

import { useState } from "react"
import { Plus, Trash2, Globe, Activity, Check, AlertCircle, Copy, Eye, EyeOff } from "lucide-react"

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

// Mock Data
type Webhook = {
    id: string
    url: string
    events: string[]
    active: boolean
    secret: string
    createdAt: string
    lastDeliveryStatus?: "success" | "failure" | "pending"
    lastDeliveryTime?: string
}

const MOCK_WEBHOOKS: Webhook[] = [
    {
        id: "wh_123456789",
        url: "https://api.example.com/webhooks/whatsapp",
        events: ["message.received", "lead.created"],
        active: true,
        secret: "whsec_5f8d9e2a1b3c4d5e6f7g8h9i0j",
        createdAt: "2024-12-28T10:00:00Z",
        lastDeliveryStatus: "success",
        lastDeliveryTime: "2 mins ago"
    },
    {
        id: "wh_987654321",
        url: "https://hooks.zapier.com/hooks/catch/123456/abcdef/",
        events: ["appointment.booked"],
        active: false,
        secret: "whsec_a1b2c3d4e5f6g7h8i9j0k1l2m3",
        createdAt: "2024-12-20T14:30:00Z",
        lastDeliveryStatus: "failure",
        lastDeliveryTime: "5 days ago"
    }
]

const AVAILABLE_EVENTS = [
    { value: "all", label: "All Events" },
    { value: "message.received", label: "Message Received" },
    { value: "message.sent", label: "Message Sent" },
    { value: "lead.created", label: "Lead Created" },
    { value: "appointment.booked", label: "Appointment Booked" },
    { value: "appointment.cancelled", label: "Appointment Cancelled" },
]

export default function WebhooksPage({ params }: { params: { id: string } }) {
    const { toast } = useToast()
    const [webhooks, setWebhooks] = useState<Webhook[]>(MOCK_WEBHOOKS)
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    // Form State
    const [newUrl, setNewUrl] = useState("")
    const [newEvents, setNewEvents] = useState<string>("all")

    const handleCreate = () => {
        setIsLoading(true)
        // Simulate API call
        setTimeout(() => {
            const newWebhook: Webhook = {
                id: `wh_${Date.now()}`,
                url: newUrl,
                events: newEvents === "all" ? ["all"] : [newEvents],
                active: true,
                secret: `whsec_${Math.random().toString(36).substring(2)}`,
                createdAt: new Date().toISOString(),
            }
            setWebhooks([newWebhook, ...webhooks])

            toast({
                title: "Webhook created",
                description: "Your new endpoint is ready to receive events.",
            })

            setIsCreateOpen(false)
            setNewUrl("")
            setNewEvents("all")
            setIsLoading(false)
        }, 800)
    }

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this webhook?")) {
            setWebhooks(webhooks.filter(w => w.id !== id))
            toast({
                title: "Webhook deleted",
                description: "The endpoint has been removed.",
            })
        }
    }

    const toggleActive = (id: string) => {
        const updated = webhooks.map(w => {
            if (w.id === id) {
                const newState = !w.active
                toast({
                    title: newState ? "Webhook enabled" : "Webhook disabled",
                    description: `Endpoint is now ${newState ? 'active' : 'inactive'}.`
                })
                return { ...w, active: newState }
            }
            return w
        })
        setWebhooks(updated)
    }

    return (
        <div className="h-full overflow-auto bg-slate-50 dark:bg-[#0a0f1a] transition-colors duration-300 relative min-h-screen">
            {/* Background Decoration */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[60px] pointer-events-none z-0" />

            <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 relative z-10">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Activity className="h-6 w-6 text-indigo-500" />
                            Webhooks
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            Send real-time data to external services when events happen.
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="rounded-full bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/10"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Endpoint
                    </Button>
                </div>

                {/* Content */}
                <div className="grid gap-6">
                    {webhooks.length === 0 ? (
                        <Card className="border-dashed border-2 bg-slate-50/50 dark:bg-white/5">
                            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="h-16 w-16 bg-indigo-100 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mb-4">
                                    <Globe className="h-8 w-8 text-indigo-500" />
                                </div>
                                <h3 className="text-lg font-medium text-slate-900 dark:text-white">No webhooks configured</h3>
                                <p className="text-slate-500 dark:text-slate-400 max-w-sm mt-2 mb-6">
                                    Create a webhook to start receiving real-time updates for your agent's activities.
                                </p>
                                <Button onClick={() => setIsCreateOpen(true)} variant="outline">
                                    Set up your first webhook
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {webhooks.map((webhook) => (
                                <WebhookCard
                                    key={webhook.id}
                                    webhook={webhook}
                                    onDelete={() => handleDelete(webhook.id)}
                                    onToggle={() => toggleActive(webhook.id)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Documentation / Help */}
                <Card className="bg-slate-100 dark:bg-slate-900 border-none">
                    <CardHeader>
                        <CardTitle className="text-base text-slate-900 dark:text-white">Need help?</CardTitle>
                        <CardDescription>
                            Read our documentation to learn how to verify signatures and handle retries.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4 text-sm text-indigo-600 dark:text-indigo-400">
                            <a href="#" className="hover:underline">Verifying Signatures &rarr;</a>
                            <a href="#" className="hover:underline">Event Types &rarr;</a>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Create Modal */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Add Webhook Endpoint</DialogTitle>
                        <DialogDescription>
                            Enter the URL where you want to receive events.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="url">Endpoint URL</Label>
                            <Input
                                id="url"
                                placeholder="https://api.your-domain.com/webhooks"
                                value={newUrl}
                                onChange={(e) => setNewUrl(e.target.value)}
                            />
                            <p className="text-xs text-slate-500">Must be a valid HTTPS URL.</p>
                        </div>

                        <div className="space-y-2">
                            <Label>Events</Label>
                            <Select value={newEvents} onValueChange={setNewEvents}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select events" />
                                </SelectTrigger>
                                <SelectContent>
                                    {AVAILABLE_EVENTS.map(evt => (
                                        <SelectItem key={evt.value} value={evt.value}>
                                            {evt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-slate-500">Select which events will trigger this webhook.</p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                        <Button
                            onClick={handleCreate}
                            disabled={!newUrl || isLoading}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            {isLoading ? "creating..." : "Add Endpoint"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

function WebhookCard({ webhook, onDelete, onToggle }: { webhook: Webhook, onDelete: () => void, onToggle: () => void }) {
    const [showSecret, setShowSecret] = useState(false)
    const { toast } = useToast()

    return (
        <Card className="group border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1424] hover:border-indigo-500/30 transition-all">
            <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
                    <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className={`h-2.5 w-2.5 rounded-full ${webhook.active ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-slate-300 dark:bg-slate-600'}`} />
                            <h3 className="font-semibold text-slate-900 dark:text-white truncate font-mono text-sm" title={webhook.url}>
                                {webhook.url}
                            </h3>
                            <Badge variant="outline" className="hidden sm:inline-flex bg-slate-50 dark:bg-white/5 ml-2">
                                {webhook.events.includes('all') ? 'All Events' : `${webhook.events.length} events`}
                            </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-md max-w-full overflow-hidden">
                                <span className="uppercase font-bold text-[10px] tracking-wider opacity-60">Secret</span>
                                <span className="font-mono">
                                    {showSecret ? webhook.secret : `${webhook.secret.substring(0, 9)}••••••••`}
                                </span>
                                <button
                                    onClick={() => setShowSecret(!showSecret)}
                                    className="ml-1 hover:text-indigo-500 transition-colors"
                                >
                                    {showSecret ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                </button>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(webhook.secret)
                                        toast({ title: "Copied to clipboard" })
                                    }}
                                    className="ml-1 hover:text-indigo-500 transition-colors"
                                >
                                    <Copy className="h-3 w-3" />
                                </button>
                            </div>

                            <div className="flex items-center gap-1">
                                {webhook.lastDeliveryStatus === 'success' && <Check className="h-3 w-3 text-emerald-500" />}
                                {webhook.lastDeliveryStatus === 'failure' && <AlertCircle className="h-3 w-3 text-red-500" />}
                                <span>
                                    Last delivery: {webhook.lastDeliveryStatus ? webhook.lastDeliveryStatus : 'Never'}
                                    {webhook.lastDeliveryTime && ` • ${webhook.lastDeliveryTime}`}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-start">
                        <div className="flex items-center gap-2">
                            <Label htmlFor={`active-${webhook.id}`} className="sr-only">Active</Label>
                            <Switch
                                id={`active-${webhook.id}`}
                                checked={webhook.active}
                                onCheckedChange={onToggle}
                            />
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10" onClick={onDelete}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
