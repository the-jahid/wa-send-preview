// src/components/dashboard/outbound/campaign/template.tsx
"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Loader2,
  Plus,
  RefreshCcw,
  Save,
  Trash2,
  Upload,
  ImageIcon,
  Video,
  CheckCircle2,
} from "lucide-react"

import {
  useTemplates,
  useCreateTemplate,
  useUpdateTemplate as useUpdateTemplateMut,
  useReplaceTemplateMedia,
  useClearTemplateMedia,
  useDeleteTemplate as useDeleteTemplateMut,
  getTemplateMediaUrl,
} from "@/app/features/outbound-campaign-template"

import {
  useBroadcastStatus,
  useSetBroadcastTemplate,
  useClearBroadcastTemplate,
} from "@/app/features/outbound-broadcast"

import {
  CreateTemplateSchema,
  UpdateTemplateSchema,
} from "@/app/features/outbound-campaign-template"
import type { Template, CreateTemplateDto, UpdateTemplateDto } from "@/app/features/outbound-campaign-template"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"

/* ---------------------- Utilities ---------------------- */
const nonEmpty = (v?: string | null): v is string => typeof v === "string" && v.trim().length > 0
const formatBytes = (n?: number | null) => (typeof n === "number" ? `${(n / (1024 * 1024)).toFixed(2)} MB` : "—")
const safeMsg = (e: unknown) =>
  (e as any)?.message && typeof (e as any).message === "string"
    ? String((e as any).message).slice(0, 400)
    : "Something went wrong"

function ErrorMsg({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{msg}</p>
}

/* ======================================================================= */
/*                                Templates Panel                          */
/* ======================================================================= */

export default function TemplatesPanel({ agentId }: { agentId: string }) {
  // campaignId from /dashboard/outbound/[campaignId]/campaign
  const { campaignId } = useParams<{ campaignId: string }>()

  const [q, setQ] = useState("")
  const [selectedId, setSelectedId] = useState<string | "new" | null>(null)

  const params = useMemo(() => ({ agentId, q }), [agentId, q])
  const list = useTemplates(params, { enabled: !!agentId })

  // Broadcast snapshot for selectedTemplateId (read-only; never change status here)
  const statusQ = useBroadcastStatus(campaignId)
  const selectedTemplateIdForBroadcast = statusQ.data?.broadcast?.selectedTemplateId ?? null

  // Dedicated template-only endpoints (do NOT touch status)
  const setTplMut = useSetBroadcastTemplate(agentId, campaignId)
  const clearTplMut = useClearBroadcastTemplate(agentId, campaignId)

  useEffect(() => {
    if (!selectedId && (list.data?.items?.length ?? 0) > 0) {
      if (selectedTemplateIdForBroadcast) {
        const exists = list.data!.items.some((t) => t.id === selectedTemplateIdForBroadcast)
        setSelectedId(exists ? selectedTemplateIdForBroadcast : list.data!.items[0].id)
      } else {
        setSelectedId(list.data!.items[0].id)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list.data?.items?.length, selectedTemplateIdForBroadcast])

  const items = list.data?.items ?? []
  const selectedTpl =
    typeof selectedId === "string" && selectedId !== "new" ? items.find((i) => i.id === selectedId) : undefined

  async function selectForBroadcast(id: string) {
    if (!nonEmpty(agentId) || !nonEmpty(campaignId) || !nonEmpty(id)) return
    await setTplMut.mutateAsync({ templateId: id })
    await statusQ.refetch()
  }

  async function clearBroadcastTemplate() {
    if (!nonEmpty(agentId) || !nonEmpty(campaignId)) return
    await clearTplMut.mutateAsync()
    await statusQ.refetch()
  }

  const setting = setTplMut.isPending || clearTplMut.isPending
  const setError = setTplMut.isError ? safeMsg(setTplMut.error) : clearTplMut.isError ? safeMsg(clearTplMut.error) : undefined

  return (
    <Card className="bg-white dark:bg-[#0d1424] border-slate-200 dark:border-white/10 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-slate-900 dark:text-white">Templates</CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">
              Two-pane: list on the left, editor on the right
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                list.refetch()
                statusQ.refetch()
              }}
              title="Refresh"
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10"
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white"
              onClick={() => setSelectedId("new")}
            >
              <Plus className="h-4 w-4" /> New template
            </Button>
          </div>
        </div>

        {/* Topline selection indicator */}
        {statusQ.isLoading ? (
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">Loading broadcast selection…</div>
        ) : selectedTemplateIdForBroadcast ? (
          <div className="mt-2 text-xs text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="inline -mt-0.5 mr-1 h-3.5 w-3.5" />
            Selected for broadcast
          </div>
        ) : (
          <div className="mt-2 text-xs text-amber-700 dark:text-amber-400">No template selected for broadcast</div>
        )}
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-[320px_minmax(0,1fr)] gap-4">
          {/* LEFT: list & search */}
          <div className="rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0f1a]">
            <div className="p-3 border-b border-slate-200 dark:border-white/10">
              <Input
                placeholder="Search name/body…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="h-9 text-sm border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {list.isLoading ? "Loading…" : `Showing ${items.length} item(s)`}
              </div>
            </div>

            <div className="max-h-[520px] overflow-auto">
              {list.isLoading ? (
                <div className="p-3 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-500" /> Loading templates…
                </div>
              ) : list.isError ? (
                <div className="p-3">
                  <Alert
                    variant="destructive"
                    className="bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20"
                  >
                    <AlertTitle className="text-rose-800 dark:text-rose-300">Failed to load</AlertTitle>
                    <AlertDescription className="text-rose-700 dark:text-rose-400">
                      {safeMsg(list.error)}
                    </AlertDescription>
                  </Alert>
                </div>
              ) : items.length === 0 ? (
                <div className="p-3 text-sm text-slate-500 dark:text-slate-400">No templates yet.</div>
              ) : (
                <ul className="divide-y divide-slate-200 dark:divide-white/10">
                  {items.map((tpl) => {
                    const isSelectedInBroadcast = tpl.id === selectedTemplateIdForBroadcast
                    return (
                      <li key={tpl.id}>
                        <div
                          className={`px-3 py-2 transition ${
                            selectedId === tpl.id
                              ? "bg-slate-100 dark:bg-white/10"
                              : "hover:bg-slate-50 dark:hover:bg-white/5"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <button
                              type="button"
                              className="min-w-0 text-left flex-1"
                              onClick={() => setSelectedId(tpl.id)}
                              title={tpl.id}
                            >
                              <div className="truncate font-medium flex items-center gap-2 text-slate-900 dark:text-white">
                                {tpl.name}
                                {isSelectedInBroadcast && (
                                  <Badge
                                    variant="secondary"
                                    className="text-[10px] bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30"
                                  >
                                    Selected
                                  </Badge>
                                )}
                              </div>
                              <div className="truncate text-xs text-slate-500 dark:text-slate-400">{tpl.body}</div>
                            </button>

                            <div className="shrink-0 flex items-center gap-1">
                              {tpl.hasMedia ? (
                                tpl.mediaMimeType?.startsWith("image/") ? (
                                  <Badge
                                    variant="secondary"
                                    className="gap-1 text-[10px] bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10"
                                  >
                                    <ImageIcon className="h-3 w-3" /> image
                                  </Badge>
                                ) : tpl.mediaMimeType?.startsWith("video/") ? (
                                  <Badge
                                    variant="secondary"
                                    className="gap-1 text-[10px] bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10"
                                  >
                                    <Video className="h-3 w-3" /> video
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="secondary"
                                    className="text-[10px] bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10"
                                  >
                                    doc
                                  </Badge>
                                )
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] border-slate-300 dark:border-white/20 text-slate-500 dark:text-slate-400"
                                >
                                  text
                                </Badge>
                              )}

                              {/* Inline "Use" button — template-only endpoint */}
                              {!isSelectedInBroadcast && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2 gap-1 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                                  onClick={async (e) => {
                                    e.stopPropagation()
                                    await selectForBroadcast(tpl.id)
                                  }}
                                  disabled={setting}
                                  title="Use this template for broadcast"
                                >
                                  {setting ? (
                                    <>
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                      <span className="text-xs">Setting…</span>
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle2 className="h-3.5 w-3.5" />
                                      <span className="text-xs">Use</span>
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* RIGHT: editor panel */}
          <div className="min-h-[520px] rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0f1a] p-4">
            {selectedId === "new" ? (
              <CreateTemplateInline
                agentId={agentId}
                onCreated={(id?: string) => {
                  list.refetch()
                  if (id) setSelectedId(id)
                }}
              />
            ) : selectedTpl ? (
              <EditTemplateInline
                agentId={agentId}
                tpl={selectedTpl}
                isSelectedInBroadcast={selectedTpl.id === selectedTemplateIdForBroadcast}
                onSelectTemplate={() => selectForBroadcast(selectedTpl.id)}
                onClearTemplate={clearBroadcastTemplate}
                onChanged={() => {
                  list.refetch()
                  statusQ.refetch()
                }}
                onDeleted={() => {
                  list.refetch()
                  statusQ.refetch()
                  setSelectedId(null)
                }}
                isSetting={setting}
                setError={setError}
              />
            ) : (
              <div className="h-full grid place-items-center text-sm text-slate-500 dark:text-slate-400">
                Select a template from the left or create a new one.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/* --------------------- Create (inline) --------------------- */
type CreateForm = z.infer<typeof CreateTemplateSchema>

function CreateTemplateInline({ agentId, onCreated }: { agentId: string; onCreated: (newId?: string) => void }) {
  const createMut = useCreateTemplate(agentId)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const form = useForm<CreateForm>({
    resolver: zodResolver(CreateTemplateSchema),
    defaultValues: { agentId, name: "", body: "Hello world", variables: [] },
  })

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const onSubmit = async (v: CreateForm) => {
    const variables = Array.isArray(v.variables) ? v.variables : []
    const created = await createMut.mutateAsync({
      ...(v as CreateTemplateDto),
      variables,
      mediaFile: file,
    })
    form.reset({ agentId, name: "", body: "Hello world", variables: [] })
    setFile(null)
    onCreated((created as any)?.id)
  }

  const isImage = file?.type?.startsWith("image/")
  const isVideo = file?.type?.startsWith("video/")
  const isDoc = file?.type?.startsWith("application/")

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">Create template</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Define content, variables, and optional media</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label className="text-slate-700 dark:text-slate-300">Name</Label>
            <Input
              placeholder="Welcome message"
              {...form.register("name")}
              className="h-10 text-sm border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <ErrorMsg msg={form.formState.errors.name?.message} />
          </div>
        </div>

        <div className="grid gap-2">
          <Label className="text-slate-700 dark:text-slate-300">Body</Label>
          <Textarea
            placeholder="Type the message body…"
            className="min-h-[96px] text-sm border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            {...form.register("body")}
          />
        </div>

        <div className="grid gap-1">
          <Label className="text-slate-700 dark:text-slate-300">Variables (comma separated)</Label>
          <Input
            placeholder="firstName, date"
            onChange={(e) => {
              const vars = e.currentTarget.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
              form.setValue("variables", vars)
            }}
            className="h-10 text-sm border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          {form.watch("variables")?.length ? (
            <div className="flex flex-wrap gap-1 pt-1">
              {form.watch("variables")!.map((v) => (
                <Badge
                  key={v}
                  variant="secondary"
                  className="bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10"
                >
                  {v}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>

        <div className="grid gap-2">
          <Label className="text-slate-700 dark:text-slate-300">Media (image/video/document, optional)</Label>
          <Input
            type="file"
            accept="image/*,video/*,application/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="h-10 text-sm border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white file:bg-slate-100 dark:file:bg-white/10 file:text-slate-700 dark:file:text-slate-300 file:border-0 file:mr-3 file:px-3 file:py-1 file:rounded-md rounded-lg"
          />
          {previewUrl && (
            <div className="mt-2 space-y-1">
              {isImage ? (
                <div className="rounded-lg border border-slate-200 dark:border-white/10 p-2 inline-block bg-slate-50 dark:bg-white/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl} alt="preview" className="max-w-[280px] rounded-md" />
                </div>
              ) : isVideo ? (
                <video
                  src={previewUrl}
                  controls
                  className="max-w-[320px] rounded-md border border-slate-200 dark:border-white/10"
                />
              ) : isDoc ? (
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Document selected: {file?.name} • {file?.type} • {formatBytes(file?.size)}
                </div>
              ) : null}
              {!isDoc && (
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {file?.name} • {file?.type} • {formatBytes(file?.size)}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={createMut.isPending}
            className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50"
          >
            {createMut.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Creating…
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" /> Create
              </>
            )}
          </Button>
        </div>

        {createMut.isError && (
          <Alert
            variant="destructive"
            className="bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20"
          >
            <AlertTitle className="text-rose-800 dark:text-rose-300">Failed to create</AlertTitle>
            <AlertDescription className="text-rose-700 dark:text-rose-400">{safeMsg(createMut.error)}</AlertDescription>
          </Alert>
        )}
      </form>
    </div>
  )
}

/* --------------------- Edit (inline) --------------------- */
type UpdateTemplateForm = z.infer<typeof UpdateTemplateSchema>

function EditTemplateInline({
  tpl,
  agentId,
  isSelectedInBroadcast,
  onSelectTemplate,
  onClearTemplate,
  onChanged,
  onDeleted,
  isSetting,
  setError,
}: {
  tpl: Template
  agentId: string
  isSelectedInBroadcast: boolean
  onSelectTemplate: () => Promise<void> | void
  onClearTemplate: () => Promise<void> | void
  onChanged: () => void
  onDeleted: () => void
  isSetting?: boolean
  setError?: string
}) {
  const updateMut = useUpdateTemplateMut(agentId)
  const replaceMut = useReplaceTemplateMedia(agentId)
  const clearMediaMut = useClearTemplateMedia(agentId)
  const deleteMut = useDeleteTemplateMut(agentId)

  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [varsCsv, setVarsCsv] = useState(tpl.variables.join(", "))

  const form = useForm<UpdateTemplateForm>({
    resolver: zodResolver(UpdateTemplateSchema),
    defaultValues: { name: tpl.name, body: tpl.body, variables: tpl.variables },
  })

  useEffect(() => {
    form.reset({ name: tpl.name, body: tpl.body, variables: tpl.variables })
    setVarsCsv(tpl.variables.join(", "))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tpl.id])

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const mediaUrl = tpl.hasMedia ? getTemplateMediaUrl(tpl.id) : null

  const isImage = file?.type?.startsWith("image/")
  const isVideo = file?.type?.startsWith("video/")
  const isDoc = file?.type?.startsWith("application/")

  const submitUpdate = async (v: UpdateTemplateForm) => {
    // Update TEMPLATE ONLY (never touches broadcast)
    const variables = Array.isArray(v.variables)
      ? v.variables
      : varsCsv
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
    const payload: UpdateTemplateDto = { ...v, variables }
    await updateMut.mutateAsync({ id: tpl.id, data: payload })
    onChanged()
  }

  const submitReplace = async () => {
    if (!file) return
    await replaceMut.mutateAsync({ id: tpl.id, file })
    setFile(null)
    onChanged()
  }

  const onDeleteClick = async () => {
    // If currently selected for broadcast, warn and clear selection first.
    let question = "Delete this template?"
    if (isSelectedInBroadcast) {
      question =
        "This template is currently selected for this campaign's broadcast.\n\nIf you delete it, the campaign's selected template will be cleared (status will NOT change).\n\nProceed?"
    }
    if (!confirm(question)) return

    try {
      if (isSelectedInBroadcast) {
        // Clear selection (sets selectedTemplateId = null; does NOT change any statuses)
        await onClearTemplate()
      }
      await deleteMut.mutateAsync(tpl.id)
      onDeleted()
    } catch (err) {
      // Surface error via alert UI below
      console.error("Delete template failed:", err)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">{tpl.name}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">ID: {tpl.id}</p>
        </div>

        {/* Broadcast selection controls — template-only endpoints */}
        <div className="flex items-center gap-2">
          {isSelectedInBroadcast ? (
            <div className="flex items-center gap-2">
              <span className="text-emerald-700 dark:text-emerald-400 text-sm flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Selected for broadcast
              </span>
              <Button
                variant="outline"
                className="gap-2 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/30 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                onClick={onClearTemplate}
                disabled={!!isSetting}
              >
                {isSetting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Clearing…
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" /> Clear selection
                  </>
                )}
              </Button>
            </div>
          ) : (
            <Button
              className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white"
              onClick={onSelectTemplate}
              disabled={!!isSetting}
            >
              {isSetting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Setting…
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Use for broadcast
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {setError && (
        <Alert variant="destructive" className="bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20">
          <AlertTitle className="text-rose-800 dark:text-rose-300">Selection update failed</AlertTitle>
          <AlertDescription className="text-rose-700 dark:text-rose-400">{setError}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="content" className="w-full">
        <TabsList className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-1">
          <TabsTrigger
            value="content"
            className="text-slate-600 dark:text-slate-400 data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm"
          >
            Content
          </TabsTrigger>
          <TabsTrigger
            value="media"
            className="text-slate-600 dark:text-slate-400 data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm"
          >
            Media
          </TabsTrigger>
        </TabsList>

        {/* CONTENT */}
        <TabsContent value="content" className="mt-4">
          <form onSubmit={form.handleSubmit(submitUpdate)} className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-slate-700 dark:text-slate-300">Name</Label>
                <Input
                  {...form.register("name")}
                  className="h-10 text-sm border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <ErrorMsg msg={form.formState.errors.name?.message} />
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="text-slate-700 dark:text-slate-300">Body</Label>
              <Textarea
                className="min-h-[96px] text-sm border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                {...form.register("body")}
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-slate-700 dark:text-slate-300">Variables (comma separated)</Label>
              <Input
                value={varsCsv}
                onChange={(e) => setVarsCsv(e.target.value)}
                placeholder="firstName, date"
                className="h-10 text-sm border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={updateMut.isPending}
                className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50"
              >
                {updateMut.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" /> Save
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="gap-2 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/30 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                onClick={onDeleteClick}
                disabled={deleteMut.isPending || isSetting}
              >
                {deleteMut.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Deleting…
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" /> Delete
                  </>
                )}
              </Button>
            </div>

            {(updateMut.isError || deleteMut.isError) && (
              <Alert
                variant="destructive"
                className="bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20"
              >
                <AlertTitle className="text-rose-800 dark:text-rose-300">Action failed</AlertTitle>
                <AlertDescription className="text-rose-700 dark:text-rose-400">
                  {safeMsg(updateMut.error) || safeMsg(deleteMut.error)}
                </AlertDescription>
              </Alert>
            )}
          </form>
        </TabsContent>

        {/* MEDIA */}
        <TabsContent value="media" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <div className="space-y-2">
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Current media</div>
              {tpl.hasMedia ? (
                <div>
                  {tpl.mediaMimeType?.startsWith("image/") ? (
                    <div className="rounded-lg border border-slate-200 dark:border-white/10 p-2 inline-block bg-slate-50 dark:bg-white/5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={mediaUrl!} alt={tpl.mediaFileName ?? "image"} className="max-w-[360px] rounded-md" />
                    </div>
                  ) : tpl.mediaMimeType?.startsWith("video/") ? (
                    <video
                      controls
                      src={mediaUrl!}
                      className="max-w-[420px] rounded-md border border-slate-200 dark:border-white/10"
                    />
                  ) : (
                    <div className="text-sm text-slate-700 dark:text-slate-300">
                      Document:{" "}
                      <a
                        className="underline text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
                        href={mediaUrl!}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {tpl.mediaFileName ?? "download"}
                      </a>{" "}
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        ({tpl.mediaMimeType}) • {formatBytes(tpl.mediaSize)}
                      </span>
                    </div>
                  )}
                  {tpl.mediaMimeType?.startsWith("image/") && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                      {tpl.mediaFileName} • {tpl.mediaMimeType} • {formatBytes(tpl.mediaSize)}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-slate-500 dark:text-slate-400">No media attached.</div>
              )}
            </div>

            <div className="space-y-3">
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Replace / Clear Media</div>
              <Input
                type="file"
                accept="image/*,video/*,application/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="h-10 text-sm border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white file:bg-slate-100 dark:file:bg-white/10 file:text-slate-700 dark:file:text-slate-300 file:border-0 file:mr-3 file:px-3 file:py-1 file:rounded-md rounded-lg"
              />

              {previewUrl && (
                <div className="space-y-1">
                  {isImage ? (
                    <div className="rounded-lg border border-slate-200 dark:border-white/10 p-2 inline-block bg-slate-50 dark:bg-white/5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={previewUrl} alt="preview" className="max-w-[220px] rounded-md" />
                    </div>
                  ) : isVideo ? (
                    <video
                      src={previewUrl}
                      controls
                      className="max-w-[260px] rounded-md border border-slate-200 dark:border-white/10"
                    />
                  ) : isDoc ? (
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Document selected: {file?.name} • {file?.type} • {formatBytes(file?.size)}
                    </div>
                  ) : null}
                  {!isDoc && (
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {file?.name} • {file?.type} • {formatBytes(file?.size)}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="gap-2 border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
                  onClick={submitReplace}
                  disabled={!file || replaceMut.isPending}
                >
                  {replaceMut.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Uploading…
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" /> Upload
                    </>
                  )}
                </Button>
                {tpl.hasMedia && (
                  <Button
                    variant="outline"
                    className="gap-2 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/30 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                    onClick={async () => {
                      await clearMediaMut.mutateAsync(tpl.id)
                      onChanged()
                    }}
                  >
                    <Trash2 className="h-4 w-4" /> Clear
                  </Button>
                )}
              </div>

              {(replaceMut.isError || clearMediaMut.isError) && (
                <Alert
                  variant="destructive"
                  className="bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20"
                >
                  <AlertTitle className="text-rose-800 dark:text-rose-300">Media action failed</AlertTitle>
                  <AlertDescription className="text-rose-700 dark:text-rose-400">
                    {safeMsg(replaceMut.error) || safeMsg(clearMediaMut.error)}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}