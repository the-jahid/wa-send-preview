// Centralized model/provider constants to keep the page + form tiny.

import type { ModelOption } from "@/app/features/agent"

export type Provider = "CHATGPT" | "GEMINI" | "CLAUDE"
export type MemoryType = "BUFFER" | "NONE" | "RAG" | "VECTOR"

export const PROVIDERS: ReadonlyArray<{ value: Provider; label: string }> = [
    { value: "CHATGPT", label: "ChatGPT" },
    { value: "GEMINI", label: "Gemini" },
    { value: "CLAUDE", label: "Claude" },
]

const OPENAI_MODELS = [
    "gpt_3_5_turbo",
    "gpt_4",
    "gpt_4_1",
    "gpt_4_1_mini",
    "gpt_4_1_nano",
    "gpt_5",
    "gpt_5_mini",
    "gpt_5_nano",
    "gpt_5_thinking",
    "gpt_5_thinking_mini",
    "gpt_5_thinking_nano",
    "gpt_5_thinking_pro",
    "gpt_4_turbo",
    "gpt_4_turbo_16k",
    "gpt_4_turbo_32k",
    "gpt_4_vision",
    "gpt_4_vision_16k",
    "gpt_5_turbo",
    "gpt_5_turbo_16k",
    "gpt_5_turbo_32k",
    "gpt_5_vision",
] as const

const GEMINI_MODELS = [
    "gemini_1_0_nano_1",
    "gemini_1_0_nano_2",
    "gemini_1_0_pro",
    "gemini_1_0_ultra",
    "gemini_1_5_pro",
    "gemini_1_5_flash",
    "gemini_2_0_flash",
    "gemini_2_0_flash_lite",
    "gemini_2_0_flash_preview_image_generation",
    "gemini_2_0_flash_live_001",
    "gemini_2_5_pro",
    "gemini_2_5_flash",
    "gemini_2_5_flash_lite",
] as const

const CLAUDE_MODELS = [
    "claude_3_haiku",
    "claude_3_sonnet",
    "claude_3_opus",
    "claude_3_5_haiku",
    "claude_3_5_sonnet",
    "claude_3_5_sonnet_v2",
    "claude_3_7_sonnet",
    "claude_3_7_sonnet_thinking",
    "claude_4_opus",
    "claude_4_opus_4_1",
    "claude_4_sonnet",
] as const

const titleize = (v: string) =>
    v
        .split("_")
        .map((s) => (s ? s[0].toUpperCase() + s.slice(1) : s))
        .join(" ")
const toOptions = (list: readonly string[]): ModelOption[] => list.map((v) => ({ value: v, label: titleize(v) }))

export const MODEL_OPTIONS: Record<Provider, ModelOption[]> = {
    CHATGPT: toOptions(OPENAI_MODELS),
    GEMINI: toOptions(GEMINI_MODELS),
    CLAUDE: toOptions(CLAUDE_MODELS),
}
