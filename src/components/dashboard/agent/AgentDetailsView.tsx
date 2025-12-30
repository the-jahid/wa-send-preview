"use client"

import type { Agent } from "@/app/features/agent"

export default function AgentDetailsView({
    agent,
    modelShown,
}: {
    agent: Agent
    modelShown: string
}) {
    return (
        <div className="space-y-8">
            {/* Header Card - Landing Page Style */}
            <div className="relative rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-white dark:via-[#0d1424] to-cyan-500/10 p-6 overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
                <div className="relative">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                            <span className="text-white text-2xl">🤖</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{agent.name}</h2>
                            <div className="flex items-center gap-2">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${agent.isActive
                                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-sm shadow-emerald-500/25"
                                    : "bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400"
                                    }`}>
                                    {agent.isActive ? "✓ Active" : "○ Inactive"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 rounded-xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Status</p>
                            <p className={`font-semibold ${agent.isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500"}`}>
                                {agent.isActive ? "Enabled" : "Disabled"}
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">History Limit</p>
                            <p className="font-semibold text-slate-900 dark:text-white">{agent.historyLimit ?? 0}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Model</p>
                            <p className="font-semibold text-slate-900 dark:text-white truncate">{modelShown || "Default"}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Created</p>
                            <p className="font-semibold text-slate-900 dark:text-white">
                                {new Date(agent.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* System Prompt Card */}
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1424] overflow-hidden shadow-sm hover:border-emerald-500/30 transition-all duration-300">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-sm shadow-emerald-500/25">
                            <span className="text-white text-sm">📝</span>
                        </div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">System Prompt</h3>
                    </div>
                </div>
                <div className="p-6">
                    <pre className="font-sans text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                        {agent.prompt || <span className="text-slate-400 dark:text-slate-500 italic">No system prompt configured.</span>}
                    </pre>
                </div>
            </div>
        </div>
    )
}
