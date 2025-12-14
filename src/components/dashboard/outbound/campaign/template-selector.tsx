"use client"

import { useState } from "react"
import { Search, Loader2, Check, ImageIcon, Video, FileText, CheckCircle2 } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTemplates } from "@/app/features/outbound-campaign-template"
import { useSetBroadcastTemplate } from "@/app/features/outbound-broadcast-settings"

interface TemplateSelectorProps {
    agentId: string
    campaignId: string
    isOpen: boolean
    onClose: () => void
    selectedTemplateId?: string | null
}

export function TemplateSelector({
    agentId,
    campaignId,
    isOpen,
    onClose,
    selectedTemplateId,
}: TemplateSelectorProps) {
    const [q, setQ] = useState("")
    const { data, isLoading, isError } = useTemplates(
        { agentId, q },
        { enabled: isOpen && !!agentId }
    )
    const items = data?.items ?? []

    const { mutateAsync: setTemplate, isPending: isSetting } = useSetBroadcastTemplate(agentId, campaignId)

    const handleSelect = async (templateId: string) => {
        try {
            await setTemplate({ templateId })
            onClose()
        } catch (e) {
            console.error("Failed to select template", e)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden bg-white dark:bg-[#0a0f1a] border-slate-200 dark:border-white/10">
                <DialogHeader className="px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5">
                    <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                        Select Template
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 dark:text-slate-400">
                        Choose a template to use for this broadcast campaign.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-4 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0f1a]">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Search templates..."
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            className="pl-9 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 focus:ring-emerald-500/20 focus:border-emerald-500"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-[300px]">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-48 gap-3 text-slate-500">
                            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                            <p className="text-sm">Loading templates...</p>
                        </div>
                    ) : isError ? (
                        <div className="flex flex-col items-center justify-center h-48 gap-2 text-rose-500">
                            <p>Failed to load templates.</p>
                            <Button variant="ghost" size="sm" onClick={() => window.location.reload()}>
                                Retry
                            </Button>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 gap-3 text-slate-500">
                            <p>No templates found.</p>
                            <Button
                                size="default"
                                className="gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-500/25 border-0"
                                onClick={() => {
                                    onClose()
                                    // Redirect to templates tab
                                    window.location.href = `/dashboard/outbound/${campaignId}/campaign?tab=templates&agentId=${agentId}`
                                }}
                            >
                                <FileText className="w-4 h-4" />
                                Create New Template
                            </Button>
                        </div>
                    ) : (
                        <div className="grid gap-2">
                            {items.map((tpl) => {
                                const isSelected = tpl.id === selectedTemplateId
                                return (
                                    <div
                                        key={tpl.id}
                                        className={`
                      group relative flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer
                      ${isSelected
                                                ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500/30 ring-1 ring-emerald-500/20"
                                                : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-emerald-500/30 hover:bg-slate-50 dark:hover:bg-white/10"
                                            }
                    `}
                                        onClick={() => handleSelect(tpl.id)}
                                    >
                                        <div
                                            className={`
                      flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center
                      ${isSelected
                                                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                                                    : "bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20 group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
                                                }
                    `}
                                        >
                                            {isSetting && isSelected ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : isSelected ? (
                                                <Check className="w-5 h-5" />
                                            ) : tpl.hasMedia ? (
                                                tpl.mediaMimeType?.startsWith("image/") ? (
                                                    <ImageIcon className="w-5 h-5" />
                                                ) : tpl.mediaMimeType?.startsWith("video/") ? (
                                                    <Video className="w-5 h-5" />
                                                ) : (
                                                    <FileText className="w-5 h-5" />
                                                )
                                            ) : (
                                                <FileText className="w-5 h-5" />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4
                                                    className={`text-sm font-semibold truncate ${isSelected
                                                        ? "text-emerald-900 dark:text-emerald-100"
                                                        : "text-slate-900 dark:text-white"
                                                        }`}
                                                >
                                                    {tpl.name}
                                                </h4>
                                                {tpl.hasMedia && (
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-[10px] px-1.5 py-0 h-5 bg-slate-100 dark:bg-white/10 border-slate-200 dark:border-white/10 text-slate-500"
                                                    >
                                                        media
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                                                {tpl.body || "No text content"}
                                            </p>
                                        </div>

                                        {isSetting && isSelected ? (
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                                            </div>
                                        ) : (
                                            <div className={`
                         opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 top-1/2 -translate-y-1/2
                         ${isSelected ? 'opacity-100' : ''}
                       `}>
                                                <Button size="sm" variant={isSelected ? "default" : "secondary"} className={isSelected ? "bg-emerald-500 hover:bg-emerald-600" : ""}>
                                                    {isSelected ? "Selected" : "Select"}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
