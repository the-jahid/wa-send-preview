"use client"

import { useMemo, useState, useEffect } from "react"
import {
  Loader2,
  BookOpen,
  X,
  RefreshCcw,
  Upload,
  Plus,
  Search,
  Trash2,
  RotateCcw,
  FileText,
  Tag,
  Calendar,
  Database,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

import { useAgent } from "@/app/features/agent"
import { useQueryClient } from "@tanstack/react-query"

import {
  type KnowledgeBase,
  type KnowledgeBaseDocument,
  type ListDocumentsQuery,
  useCreateTextDocument,
  useDeleteDocument,
  useDocuments,
  useKnowledgeBase,
  useReembedDocument,
  useUpdateDocument,
  useUpdateKnowledgeBase,
  useUploadFileAndEmbed,
  KBKeys,
} from "@/app/features/knowledgebase"

type Props = {
  open: boolean
  onClose: () => void
  agentId: string
}

async function sha256Hex(file: File): Promise<string> {
  const buf = await file.arrayBuffer()
  const hash = await crypto.subtle.digest("SHA-256", buf)
  const bytes = new Uint8Array(hash)
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("")
}

function prettyBytes(n?: number | null): string {
  if (n === undefined || n === null) return "-"
  const units = ["B", "KB", "MB", "GB", "TB"]
  let i = 0, v = n
  while (v >= 1024 && i < units.length - 1) (v /= 1024), i++
  return `${v.toFixed(v < 10 && i > 0 ? 1 : 0)} ${units[i]}`
}

function getErrorMessage(err: unknown): string {
  if (!err) return ""
  if (typeof err === "string") return err
  if (err instanceof Error) return err.message
  if (typeof err === "object" && "message" in err) return String((err as any).message)
  try { return JSON.stringify(err) } catch { return String(err) }
}

function statusPill(status: string) {
  if (status === "ready") return "bg-emerald-400/8 border border-emerald-400/20 text-emerald-400"
  if (status === "processing") return "bg-amber-400/8 border border-amber-400/20 text-amber-400"
  return "bg-white/[0.04] border border-white/[0.08] text-white/40"
}

export default function Knowledgebase({ open, onClose, agentId }: Props) {
  const qc = useQueryClient()

  const { data: agentRes, isLoading: agentLoading } = useAgent(agentId, { staleTime: 30_000 })
  const agent = useMemo(() => agentRes?.data, [agentRes])

  const { data: kb, isLoading: kbLoading, error: kbError } = useKnowledgeBase(agentId)
  const updateKB = useUpdateKnowledgeBase(agentId)

  const [q, setQ] = useState("")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  const listParams: Partial<ListDocumentsQuery> = useMemo(
    () => ({ q, page, limit, sort: "updatedAt:desc" }),
    [q, page, limit],
  )

  const { data: docsPage, isLoading: docsLoading, error: docsError } = useDocuments(agentId, listParams)

  useEffect(() => { setPage(1) }, [q, limit])

  const [newTitle, setNewTitle] = useState("")
  const [newTags, setNewTags] = useState("")
  const [newContent, setNewContent] = useState("")
  const createText = useCreateTextDocument(agentId)

  const [file, setFile] = useState<File | null>(null)
  const [fileBusy, setFileBusy] = useState(false)
  const uploadFileAndEmbed = useUploadFileAndEmbed(agentId)

  const [uploadTitle, setUploadTitle] = useState("")
  const [uploadTags, setUploadTags] = useState("")
  const [chunkSize, setChunkSize] = useState<number | "">("")
  const [chunkOverlap, setChunkOverlap] = useState<number | "">("")
  const [, setEmbeddingModel] = useState<string>("")
  const [, setEmbeddingDimensions] = useState<number | "">("")

  const [kbForm, setKbForm] = useState<Partial<KnowledgeBase>>({})
  const [embeddingModelState, setEmbeddingModelState] = useState<string>("")
  const [embeddingDimensionsState, setEmbeddingDimensionsState] = useState<number | "">("")

  useEffect(() => {
    if (kb) {
      setKbForm({
        companyName: kb.companyName ?? "",
        companyDescription: kb.companyDescription ?? "",
        freeText: kb.freeText ?? "",
        embeddingModel: kb.embeddingModel,
        embeddingDimensions: kb.embeddingDimensions,
      })
      setEmbeddingModelState(kb.embeddingModel ?? "")
      setEmbeddingDimensionsState(kb.embeddingDimensions ?? "")
    }
  }, [kb])

  const [selectedDoc, setSelectedDoc] = useState<KnowledgeBaseDocument | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (!open) return null

  const refreshAll = async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: KBKeys.base(agentId) }),
      qc.invalidateQueries({ queryKey: KBKeys.docs(agentId, listParams) }),
    ])
  }

  const onSaveKB = async () => {
    if (!kbForm) return
    await updateKB.mutateAsync({
      companyName: kbForm.companyName || undefined,
      companyDescription: kbForm.companyDescription || undefined,
      freeText: kbForm.freeText || undefined,
      embeddingModel: kbForm.embeddingModel || undefined,
      embeddingDimensions: typeof kbForm.embeddingDimensions === "number" ? kbForm.embeddingDimensions : undefined,
    })
    qc.invalidateQueries({ queryKey: KBKeys.base(agentId) })
  }

  const onCreateText = async () => {
    if (!newTitle.trim() || !newContent.trim()) return
    const tags = newTags.split(",").map((s) => s.trim()).filter(Boolean)
    await createText.mutateAsync({
      title: newTitle.trim(),
      content: newContent,
      tags,
      embeddingModel: "text-embedding-3-small",
      embeddingDimensions: 1536,
      chunkSize: 800,
      chunkOverlap: 100,
    })
    setNewTitle(""); setNewTags(""); setNewContent("")
    qc.invalidateQueries({ queryKey: KBKeys.docs(agentId, listParams) })
  }

  const onUploadFile = async () => {
    if (!file) return
    setFileBusy(true)
    try {
      const checksum = await sha256Hex(file)
      const fields: Parameters<typeof uploadFileAndEmbed.mutateAsync>[0]["fields"] = {
        title: (uploadTitle || file.name).trim(),
        tags: uploadTags.trim(),
        checksum,
      }
      if (embeddingModelState.trim()) fields.embeddingModel = embeddingModelState.trim()
      if (embeddingDimensionsState !== "" && Number.isFinite(Number(embeddingDimensionsState)))
        fields.embeddingDimensions = Number(embeddingDimensionsState)
      if (chunkSize !== "" && Number.isFinite(Number(chunkSize))) fields.chunkSize = Number(chunkSize)
      if (chunkOverlap !== "" && Number.isFinite(Number(chunkOverlap))) fields.chunkOverlap = Number(chunkOverlap)
      await uploadFileAndEmbed.mutateAsync({ file, fields })
      setFile(null); setUploadTitle(""); setUploadTags("")
      setChunkSize(""); setChunkOverlap(""); setEmbeddingModel(""); setEmbeddingDimensions("")
      await Promise.all([
        qc.invalidateQueries({ queryKey: KBKeys.docs(agentId, listParams) }),
        qc.invalidateQueries({ queryKey: KBKeys.base(agentId) }),
      ])
    } finally {
      setFileBusy(false)
    }
  }

  void onSaveKB; void setKbForm

  const openModalFor = (d: KnowledgeBaseDocument) => { setSelectedDoc(d); setIsModalOpen(true) }
  const closeModal = () => setIsModalOpen(false)

  const busy = agentLoading || kbLoading || updateKB.isPending || createText.isPending || uploadFileAndEmbed.isPending
  const totalPages = docsPage?.totalPages ?? 1

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Side Panel */}
      <aside
        className="fixed right-0 top-0 z-50 h-[100dvh] w-full sm:w-[85%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[45%] bg-[#080d17] border-l border-white/[0.06] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
        role="dialog"
        aria-modal="true"
        aria-label="Knowledgebase panel"
      >
        {/* Header */}
        <div className="border-b border-white/[0.06] px-5 sm:px-6 py-4 shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-400/10 border border-violet-400/20 shrink-0">
                <BookOpen className="h-4 w-4 text-violet-400" />
              </div>
              <div className="flex flex-col min-w-0">
                <h2 className="text-sm font-semibold text-white truncate">Knowledgebase</h2>
                <p className="text-xs text-white/40 flex items-center gap-1.5 truncate">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" />
                  {agent ? agent.name : "Loading…"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={refreshAll}
                title="Refresh"
                disabled={busy}
                className="h-8 w-8 rounded-lg border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] transition-colors flex items-center justify-center disabled:opacity-40"
              >
                {busy
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin text-white/40" />
                  : <RefreshCcw className="h-3.5 w-3.5 text-white/40" />}
              </button>
              <button
                onClick={onClose}
                aria-label="Close panel"
                className="h-8 w-8 rounded-lg border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] transition-colors flex items-center justify-center"
              >
                <X className="h-4 w-4 text-white/40" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-6">
          {(kbError || docsError) && (
            <div className="rounded-xl border border-red-400/20 bg-red-400/8 px-4 py-3">
              <p className="text-xs font-medium text-red-400">{getErrorMessage(kbError || docsError)}</p>
            </div>
          )}

          {/* Create Documents */}
          <div className="space-y-3">
            <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest">Create Documents</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Text Doc */}
              <div className="rounded-xl border border-white/[0.06] bg-[#0d1424] p-5 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.08] shrink-0">
                    <Plus className="h-3.5 w-3.5 text-white/50" />
                  </div>
                  <span className="text-sm font-semibold text-white">Text Document</span>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs text-white/40">Title</label>
                    <input
                      placeholder="Enter document title"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full h-9 rounded-lg bg-[#080d17] border border-white/[0.08] text-sm text-white placeholder:text-white/20 px-3 focus:outline-none focus:border-white/20 transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-white/40 flex items-center gap-1.5">
                      <Tag className="h-3 w-3" />Tags
                    </label>
                    <input
                      placeholder="pricing, onboarding, faq"
                      value={newTags}
                      onChange={(e) => setNewTags(e.target.value)}
                      className="w-full h-9 rounded-lg bg-[#080d17] border border-white/[0.08] text-sm text-white placeholder:text-white/20 px-3 focus:outline-none focus:border-white/20 transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-white/40">Content</label>
                    <textarea
                      rows={5}
                      placeholder="Paste or write your content here…"
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      className="w-full rounded-lg bg-[#080d17] border border-white/[0.08] text-sm text-white placeholder:text-white/20 px-3 py-2.5 focus:outline-none focus:border-white/20 transition-colors resize-none"
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={onCreateText}
                      disabled={createText.isPending || !newTitle.trim() || !newContent.trim()}
                      className="flex-1 h-9 rounded-lg bg-white text-[#080d17] text-sm font-semibold hover:bg-white/90 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                    >
                      {createText.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      Create Document
                    </button>
                    <button
                      onClick={() => { setNewTitle(""); setNewTags(""); setNewContent("") }}
                      disabled={createText.isPending}
                      className="h-9 px-4 rounded-lg border border-white/[0.08] text-white/50 text-sm hover:bg-white/[0.04] transition-colors disabled:opacity-40"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>

              {/* Upload File */}
              <div className="rounded-xl border border-white/[0.06] bg-[#0d1424] p-5 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.08] shrink-0">
                    <Upload className="h-3.5 w-3.5 text-white/50" />
                  </div>
                  <span className="text-sm font-semibold text-white">Upload File</span>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs text-white/40">Select File</label>
                    <label className="flex items-center gap-3 h-9 rounded-lg bg-[#080d17] border border-white/[0.08] px-3 cursor-pointer hover:border-white/20 transition-colors">
                      <span className="text-xs font-medium text-white bg-white/[0.08] border border-white/[0.1] rounded px-2 py-0.5 shrink-0">Choose File</span>
                      <span className="text-sm text-white/30 truncate">{file ? file.name : "No file chosen"}</span>
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                        disabled={fileBusy || uploadFileAndEmbed.isPending}
                      />
                    </label>
                    {file && (
                      <div className="flex items-center gap-2 rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2">
                        <FileText className="h-3.5 w-3.5 text-white/30 shrink-0" />
                        <span className="truncate flex-1 text-xs text-white/60">{file.name}</span>
                        <span className="text-xs text-white/30 shrink-0">{prettyBytes(file.size)}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-white/40">Title (optional)</label>
                    <input
                      placeholder="Defaults to filename"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      className="w-full h-9 rounded-lg bg-[#080d17] border border-white/[0.08] text-sm text-white placeholder:text-white/20 px-3 focus:outline-none focus:border-white/20 transition-colors"
                    />
                  </div>

                  <div className="rounded-lg bg-white/[0.02] border border-white/[0.05] px-3 py-2.5">
                    <p className="text-xs text-white/30 leading-relaxed">
                      Uploads file, extracts text, chunks content, generates embeddings, and stores vectors in Pinecone automatically.
                    </p>
                  </div>

                  <button
                    onClick={onUploadFile}
                    disabled={!file || fileBusy || uploadFileAndEmbed.isPending}
                    className="w-full h-9 rounded-lg bg-white text-[#080d17] text-sm font-semibold hover:bg-white/90 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    {(fileBusy || uploadFileAndEmbed.isPending) && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Upload & Embed
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest">Documents</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/30">Per page</span>
                <input
                  type="number"
                  min={5}
                  max={50}
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value || 10))}
                  className="h-7 w-14 rounded-lg bg-[#0d1424] border border-white/[0.08] text-xs text-white text-center focus:outline-none focus:border-white/20"
                />
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-[#0d1424] p-4 space-y-4">
              {/* Search */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/25" />
                  <input
                    placeholder="Search by title or tags…"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="w-full h-9 pl-9 pr-3 rounded-lg bg-[#080d17] border border-white/[0.08] text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/20 transition-colors"
                  />
                </div>
                {q && (
                  <button
                    onClick={() => { setQ(""); setPage(1) }}
                    className="h-9 px-3 rounded-lg border border-white/[0.08] text-white/40 text-sm hover:bg-white/[0.04] transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* List */}
              {docsLoading ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-white/20" />
                  <p className="text-xs text-white/30">Loading documents…</p>
                </div>
              ) : docsPage && docsPage.data.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                    {docsPage.data.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => openModalFor(d)}
                        className="group text-left rounded-lg border border-white/[0.06] bg-[#080d17] hover:border-white/[0.12] hover:bg-white/[0.02] transition-colors p-3.5 focus:outline-none"
                      >
                        <div className="flex items-start gap-2.5 mb-2.5">
                          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white/[0.04] border border-white/[0.07] shrink-0">
                            <FileText className="h-3.5 w-3.5 text-white/35" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium line-clamp-2 text-xs leading-snug mb-1.5 text-white/80">{d.title}</h4>
                            <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${statusPill(String(d.status))}`}>
                              {d.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-white/25">
                          <span className="flex items-center gap-1">
                            <Database className="h-2.5 w-2.5" />
                            {d.vectorCount} vectors
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-2.5 w-2.5" />
                            {new Date(d.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Pagination */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/[0.05]">
                    <p className="text-xs text-white/30">
                      Page <span className="text-white/60">{docsPage.page}</span> of{" "}
                      <span className="text-white/60">{docsPage.totalPages}</span> · {" "}
                      <span className="text-white/60">{docsPage.total}</span> total
                    </p>
                    <div className="flex gap-1.5">
                      <button
                        disabled={page <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className="h-7 px-3 rounded-lg border border-white/[0.08] text-xs text-white/40 hover:bg-white/[0.04] disabled:opacity-30 transition-colors flex items-center gap-1"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                        Previous
                      </button>
                      <button
                        disabled={page >= totalPages}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        className="h-7 px-3 rounded-lg border border-white/[0.08] text-xs text-white/40 hover:bg-white/[0.04] disabled:opacity-30 transition-colors flex items-center gap-1"
                      >
                        Next
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <FileText className="h-5 w-5 text-white/20" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-white/50">No documents found</p>
                    <p className="text-xs text-white/25 mt-0.5">
                      {q ? "Try adjusting your search" : "Create your first document to get started"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/[0.06] px-5 sm:px-6 py-3 flex items-center justify-between shrink-0">
          <p className="text-xs text-white/30">
            {docsPage ? `${docsPage.total} document${docsPage.total !== 1 ? "s" : ""}` : "Loading…"}
          </p>
          <button
            onClick={onClose}
            className="h-8 px-4 rounded-lg border border-white/[0.08] text-white/40 text-sm hover:bg-white/[0.04] transition-colors"
          >
            Close Panel
          </button>
        </div>
      </aside>

      {/* Document Details Modal */}
      {isModalOpen && selectedDoc && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
            onClick={closeModal}
            aria-hidden
          />
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-8">
            <div className="w-full max-w-3xl max-h-[90vh] bg-[#080d17] border border-white/[0.08] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-white/[0.06] shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.08] shrink-0">
                    <FileText className="h-4 w-4 text-white/40" />
                  </div>
                  <h3 className="text-sm font-semibold text-white truncate">{selectedDoc.title}</h3>
                </div>
                <button
                  onClick={closeModal}
                  className="h-8 w-8 rounded-lg border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.04] transition-colors shrink-0"
                >
                  <X className="h-4 w-4 text-white/40" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto">
                <DocumentDetailsModal agentId={agentId} doc={selectedDoc} onClose={closeModal} />
              </div>

              {/* Modal Footer */}
              <div className="border-t border-white/[0.06] px-5 py-3 flex justify-end shrink-0">
                <button
                  onClick={closeModal}
                  className="h-8 px-4 rounded-lg border border-white/[0.08] text-white/40 text-sm hover:bg-white/[0.04] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}

/* =========================================================================
 * Document Details Modal Component
 * ========================================================================= */
function DocumentDetailsModal({
  agentId, doc,
}: { agentId: string; doc: KnowledgeBaseDocument; onClose: () => void }) {
  const reembed = useReembedDocument(agentId, doc.id)
  const del = useDeleteDocument(agentId, doc.id)
  const upd = useUpdateDocument(agentId, doc.id)

  const [title, setTitle] = useState(doc.title)
  const [tags, setTags] = useState(doc.tags.join(", "))
  const [content, setContent] = useState(doc.content ?? "")

  useEffect(() => {
    setTitle(doc.title)
    setTags(doc.tags.join(", "))
    setContent(doc.content ?? "")
  }, [doc.id, doc.title, doc.tags, doc.content])

  const saveMeta = async () => {
    const nextTags = tags.split(",").map((s) => s.trim()).filter(Boolean)
    await upd.mutateAsync({ title: title.trim() || doc.title, tags: nextTags })
  }

  const saveContent = async () => {
    await upd.mutateAsync({ content, reembed: true })
  }

  return (
    <div className="px-5 py-5 space-y-5">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => reembed.mutate({})}
          disabled={reembed.isPending}
          className="h-8 px-3.5 rounded-lg border border-white/[0.08] bg-white/[0.03] text-white/60 text-xs font-medium hover:bg-white/[0.06] transition-colors disabled:opacity-40 flex items-center gap-1.5"
        >
          {reembed.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
          Re-embed Vectors
        </button>
        <button
          onClick={() => del.mutate({ hard: false })}
          disabled={del.isPending}
          className="h-8 px-3.5 rounded-lg border border-amber-400/20 bg-amber-400/8 text-amber-400 text-xs font-medium hover:bg-amber-400/12 transition-colors disabled:opacity-40 flex items-center gap-1.5"
        >
          {del.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
          Soft Delete
        </button>
        <button
          onClick={() => del.mutate({ hard: true })}
          disabled={del.isPending}
          className="h-8 px-3.5 rounded-lg border border-red-400/20 bg-red-400/8 text-red-400 text-xs font-medium hover:bg-red-400/12 transition-colors disabled:opacity-40 flex items-center gap-1.5"
        >
          Hard Delete
        </button>
      </div>

      {/* Metadata tiles */}
      <div className="rounded-xl border border-white/[0.06] bg-[#0d1424] p-4">
        <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-3">Document Metadata</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {[
            { label: "Status", value: <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${statusPill(String(doc.status))}`}>{doc.status}</span> },
            { label: "Vectors", value: doc.vectorCount },
            { label: "File Size", value: prettyBytes(doc.fileSize) },
            { label: "MIME Type", value: doc.mimeType || "-" },
            { label: "Updated", value: new Date(doc.updatedAt).toLocaleDateString() },
          ].map(({ label, value }) => (
            <div key={label} className="bg-[#080d17] rounded-lg border border-white/[0.05] px-3 py-2.5">
              <p className="text-[10px] text-white/30 mb-1">{label}</p>
              <p className="text-xs font-medium text-white/70 truncate">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Metadata */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-white/60">Edit Metadata</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs text-white/40">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-9 rounded-lg bg-[#080d17] border border-white/[0.08] text-sm text-white px-3 focus:outline-none focus:border-white/20 transition-colors"
            />
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs text-white/40 flex items-center gap-1.5">
              <Tag className="h-3 w-3" />Tags (comma-separated)
            </label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full h-9 rounded-lg bg-[#080d17] border border-white/[0.08] text-sm text-white px-3 focus:outline-none focus:border-white/20 transition-colors"
            />
          </div>
        </div>
        <button
          onClick={saveMeta}
          disabled={upd.isPending}
          className="h-8 px-4 rounded-lg bg-white text-[#080d17] text-xs font-semibold hover:bg-white/90 transition-colors disabled:opacity-40 flex items-center gap-1.5"
        >
          {upd.isPending && <Loader2 className="h-3 w-3 animate-spin" />}
          Save Metadata
        </button>
      </div>

      {/* Edit Content */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-white/60">Edit Content</p>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Document content will appear here if available…"
          className="w-full min-h-[200px] sm:min-h-[280px] rounded-xl bg-[#080d17] border border-white/[0.08] text-xs text-white/70 placeholder:text-white/20 font-mono px-3 py-3 focus:outline-none focus:border-white/20 transition-colors resize-y leading-relaxed"
        />
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <button
            onClick={saveContent}
            disabled={upd.isPending}
            className="h-8 px-4 rounded-lg bg-white text-[#080d17] text-xs font-semibold hover:bg-white/90 transition-colors disabled:opacity-40 flex items-center gap-1.5"
          >
            {upd.isPending && <Loader2 className="h-3 w-3 animate-spin" />}
            Save & Re-embed Content
          </button>
          <p className="text-xs text-white/25">Saving will automatically re-embed the document</p>
        </div>
      </div>
    </div>
  )
}
