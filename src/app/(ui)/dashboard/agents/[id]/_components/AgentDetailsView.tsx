"use client"

import type { Agent } from "@/app/features/agent"
import KV from "./KV"

export default function AgentDetailsView({
  agent,
  modelShown,
}: {
  agent: Agent
  modelShown: string
}) {
  return (
    <div className="space-y-8">
      {/* Basic Info Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-5 rounded-2xl bg-slate-50 dark:bg-[#1e293b]/50 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Agent Name</span>
          <span className="text-slate-900 dark:text-white font-semibold">{agent.name}</span>
        </div>

        <div className="hidden md:block w-px h-8 bg-slate-200 dark:bg-slate-700" />

        <div className="flex items-center gap-3">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Active</span>
          <span className={`font-semibold ${agent.isActive ? "text-slate-900 dark:text-white" : "text-slate-500"}`}>
            {agent.isActive ? "Enabled" : "Disabled"}
          </span>
        </div>

        <div className="hidden md:block w-px h-8 bg-slate-200 dark:bg-slate-700" />

        <div className="flex items-center gap-3">
          <span className="text-slate-500 dark:text-slate-400 font-medium">History Limit</span>
          <span className="text-slate-900 dark:text-white font-semibold">{agent.historyLimit ?? 0}</span>
        </div>

        <div className="hidden md:block w-px h-8 bg-slate-200 dark:bg-slate-700" />

        <div className="flex items-center gap-3">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Created</span>
          <span className="text-slate-900 dark:text-white font-semibold">
            {new Date(agent.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Prompt Display */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">System Prompt</h3>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#1e293b]/50 p-6 min-h-[120px]">
          <pre className="font-sans text-sm leading-relaxed text-slate-900 dark:text-slate-200 whitespace-pre-wrap">
            {agent.prompt || <span className="text-slate-400 italic">No system prompt configured.</span>}
          </pre>
        </div>
      </div>
    </div>
  )
}
