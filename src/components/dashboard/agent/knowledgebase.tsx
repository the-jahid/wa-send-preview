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
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

import { useAgent } from "@/app/features/agent"
import { useQueryClient } from "@tanstack/react-query"

import {
  type KnowledgeBase,
  type KnowledgeBaseDocument,
  type ListDocumentsQuery,
  useCreateTextDocument,
  useDeleteDocument,
  useDocuments,
  useKBSearch,
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

/** Compute SHA-256 checksum (hex) for an uploaded file */
async function sha256Hex(file: File): Promise<string> {
  const buf = await file.arrayBuffer()
  const hash = await crypto.subtle.digest("SHA-256", buf)
  const bytes = new Uint8Array(hash)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

/** Format bytes into a short human-readable string */
function prettyBytes(n?: number | null): string {
  if (n === undefined || n === null) return "-"
  const units = ["B", "KB", "MB", "GB", "TB"]
  let i = 0
  let v = n
  while (v >= 1024 && i < units.length - 1) (v /= 1024), i++
  return `${v.toFixed(v < 10 && i > 0 ? 1 : 0)} ${units[i]}`
}

export default function Knowledgebase({ open, onClose, agentId }: Props) {
  const qc = useQueryClient()

  /* ---------------- Agent ---------------- */
  const { data: agentRes, isLoading: agentLoading, error: agentError } = useAgent(agentId, { staleTime: 30_000 })
  const agent = useMemo(() => agentRes?.data, [agentRes])

  /* ---------------- KB core ---------------- */
  const { data: kb, isLoading: kbLoading, error: kbError } = useKnowledgeBase(agentId)
  const updateKB = useUpdateKnowledgeBase(agentId)

  /* ---------------- Doc list state ---------------- */
  const [q, setQ] = useState("")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  const listParams: Partial<ListDocumentsQuery> = useMemo(
    () => ({ q, page, limit, sort: "updatedAt:desc" }),
    [q, page, limit],
  )

  const {
    data: docsPage,
    isLoading: docsLoading,
    error: docsError,
    refetch: refetchDocs,
  } = useDocuments(agentId, listParams)

  useEffect(() => {
    setPage(1)
  }, [q, limit])

  /* ---------------- Create text doc ---------------- */
  const [newTitle, setNewTitle] = useState("")
  const [newTags, setNewTags] = useState("")
  const [newContent, setNewContent] = useState("")
  const createText = useCreateTextDocument(agentId)

  /* ---------------- Upload + embed ---------------- */
  const [file, setFile] = useState<File | null>(null)
  const [fileBusy, setFileBusy] = useState(false)
  const uploadFileAndEmbed = useUploadFileAndEmbed(agentId)

  // advanced overrides (logic intact, UI hidden)
  const [uploadTitle, setUploadTitle] = useState("")
  const [uploadTags, setUploadTags] = useState("")
  const [chunkSize, setChunkSize] = useState<number | "">("")
  const [chunkOverlap, setChunkOverlap] = useState<number | "">("")
  const [embeddingModel, setEmbeddingModel] = useState<string>("")
  const [embeddingDimensions, setEmbeddingDimensions] = useState<number | "">("")

  /* ---------------- KB form (logic kept; UI removed) ---------------- */
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

  /* ---------------- Search (semantic) ---------------- */
  const kbSearch = useKBSearch(agentId)
  const [searchQ, setSearchQ] = useState("")
  const [topK, setTopK] = useState<number>(8)

  /* ---------------- Modal state (stable hooks) ---------------- */
  const [selectedDoc, setSelectedDoc] = useState<KnowledgeBaseDocument | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (!open) return null

  /* ---------------- Handlers ---------------- */
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
    const tags = newTags
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)

    await createText.mutateAsync({
      title: newTitle.trim(),
      content: newContent,
      tags,
      embeddingModel: "text-embedding-3-small",
      embeddingDimensions: 1536,
      chunkSize: 800,
      chunkOverlap: 100,
    })

    setNewTitle("")
    setNewTags("")
    setNewContent("")
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
      if (embeddingDimensionsState !== "" && Number.isFinite(Number(embeddingDimensionsState))) {
        fields.embeddingDimensions = Number(embeddingDimensionsState)
      }
      if (chunkSize !== "" && Number.isFinite(Number(chunkSize))) {
        fields.chunkSize = Number(chunkSize)
      }
      if (chunkOverlap !== "" && Number.isFinite(Number(chunkOverlap))) {
        fields.chunkOverlap = Number(chunkOverlap)
      }

      await uploadFileAndEmbed.mutateAsync({ file, fields })

      setFile(null)
      setUploadTitle("")
      setUploadTags("")
      setChunkSize("")
      setChunkOverlap("")
      setEmbeddingModel("")
      setEmbeddingDimensions("")

      await Promise.all([
        qc.invalidateQueries({ queryKey: KBKeys.docs(agentId, listParams) }),
        qc.invalidateQueries({ queryKey: KBKeys.base(agentId) }),
      ])
    } finally {
      setFileBusy(false)
    }
  }

  const onSearch = async () => {
    if (!searchQ.trim()) return
    await kbSearch.mutateAsync({
      query: searchQ.trim(),
      topK: Number.isFinite(topK) ? topK : 8,
      includeMetadata: true,
    })
  }

  void onSaveKB
  void setKbForm

  const openModalFor = (d: KnowledgeBaseDocument) => {
    setSelectedDoc(d)
    setIsModalOpen(true)
  }
  const closeModal = () => setIsModalOpen(false)

  const busy = agentLoading || kbLoading || updateKB.isPending || createText.isPending || uploadFileAndEmbed.isPending

  const totalPages = docsPage?.totalPages ?? 1

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden
      />

      {/* Side Panel */}
      <aside
        className="
          fixed right-0 top-0 z-50 h-[100dvh] w-full sm:w-[85%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[45%]
          bg-background border-l shadow-2xl flex flex-col
          animate-in slide-in-from-right duration-300
        "
        role="dialog"
        aria-modal="true"
        aria-label="Knowledgebase panel"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b bg-gradient-to-r from-background to-muted/20 px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div className="flex flex-col truncate">
              <h2 className="font-semibold text-lg truncate">Knowledgebase</h2>
              <p className="text-xs text-muted-foreground truncate">{agent ? agent.name : "Loading agent…"}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={refreshAll}
              title="Refresh all data"
              disabled={busy}
              className="h-9 w-9"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close panel" className="h-9 w-9">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 space-y-6">
          {(agentError || kbError || docsError) && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-destructive text-sm font-medium flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                  Error Loading Data
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-destructive/90">
                {String(agentError || kbError || docsError)}
              </CardContent>
            </Card>
          )}

          {/* Create Documents Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Create Documents</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* New Text Doc */}
              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                      <Plus className="h-4 w-4 text-primary" />
                    </div>
                    <span>Text Document</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newTitle" className="text-sm font-medium">
                      Title
                    </Label>
                    <Input
                      id="newTitle"
                      placeholder="Enter document title"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newTags" className="text-sm font-medium flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5" />
                      Tags
                    </Label>
                    <Input
                      id="newTags"
                      placeholder="pricing, onboarding, faq"
                      value={newTags}
                      onChange={(e) => setNewTags(e.target.value)}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newContent" className="text-sm font-medium">
                      Content
                    </Label>
                    <Textarea
                      id="newContent"
                      rows={5}
                      placeholder="Paste or write your content here…"
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      className="resize-none"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={onCreateText}
                      disabled={createText.isPending || !newTitle.trim() || !newContent.trim()}
                      className="flex-1"
                    >
                      {createText.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create Document
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setNewTitle("")
                        setNewTags("")
                        setNewContent("")
                      }}
                      disabled={createText.isPending}
                    >
                      Clear
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Upload + Embed */}
              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                      <Upload className="h-4 w-4 text-primary" />
                    </div>
                    <span>Upload File</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Select File</Label>
                    <div className="relative">
                      <Input
                        type="file"
                        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                        disabled={fileBusy || uploadFileAndEmbed.isPending}
                        className="h-10 cursor-pointer file:mr-4 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary hover:file:bg-primary/20"
                      />
                    </div>
                    {file && (
                      <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2 text-sm">
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="truncate flex-1">{file.name}</span>
                        <span className="text-xs text-muted-foreground shrink-0">{prettyBytes(file.size)}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="uploadTitle" className="text-sm font-medium">
                      Title (optional)
                    </Label>
                    <Input
                      id="uploadTitle"
                      placeholder="Defaults to filename"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      className="h-10"
                    />
                  </div>

                  <div className="rounded-lg bg-muted/30 border border-dashed p-3">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Uploads file, extracts text, chunks content, generates embeddings, and stores vectors in Pinecone
                      automatically.
                    </p>
                  </div>

                  <Button
                    onClick={onUploadFile}
                    disabled={!file || fileBusy || uploadFileAndEmbed.isPending}
                    className="w-full"
                  >
                    {(fileBusy || uploadFileAndEmbed.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Upload & Embed
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Documents Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Documents</h3>
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2">
                  <Label htmlFor="limit" className="text-xs text-muted-foreground whitespace-nowrap">
                    Per page
                  </Label>
                  <Input
                    id="limit"
                    type="number"
                    className="h-8 w-16 text-sm"
                    min={5}
                    max={50}
                    value={limit}
                    onChange={(e) => setLimit(Number(e.target.value || 10))}
                  />
                </div>
              </div>
            </div>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by title or tags…"
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      className="pl-9 h-10"
                    />
                  </div>
                  {q && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setQ("")
                        setPage(1)
                      }}
                    >
                      Clear
                    </Button>
                  )}
                </div>

                {docsLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Loading documents…</p>
                  </div>
                ) : docsPage && docsPage.data.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                      {docsPage.data.map((d) => (
                        <button
                          key={d.id}
                          onClick={() => openModalFor(d)}
                          className="
                            group text-left rounded-lg border-2 p-4
                            hover:border-primary/50 hover:bg-accent/50
                            focus:border-primary focus:bg-accent/50
                            transition-all duration-200 shadow-sm hover:shadow-md
                            focus:outline-none focus:ring-2 focus:ring-primary/20
                          "
                        >
                          <div className="flex items-start gap-3 mb-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 shrink-0 group-hover:bg-primary/20 transition-colors">
                              <FileText className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium line-clamp-2 text-sm leading-snug mb-1">{d.title}</h4>
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`
                                    inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium
                                    ${
                                      String(d.status) === "ready"
                                        ? "bg-green-500/10 text-green-700 dark:text-green-400"
                                        : String(d.status) === "processing"
                                          ? "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
                                          : "bg-gray-500/10 text-gray-700 dark:text-gray-400"
                                    }
                                  `}
                                >
                                  {d.status}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Database className="h-3 w-3" />
                              {d.vectorCount} vectors
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(d.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        Showing page <span className="font-medium">{docsPage.page}</span> of{" "}
                        <span className="font-medium">{docsPage.totalPages}</span> ·{" "}
                        <span className="font-medium">{docsPage.total}</span> total documents
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={page <= 1}
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Previous
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={page >= totalPages}
                          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        >
                          Next
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-sm">No documents found</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {q ? "Try adjusting your search" : "Create your first document to get started"}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Semantic Search Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Semantic Search
            </h3>
            <Card className="border-2">
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-9">
                    <Label htmlFor="searchQ" className="text-sm font-medium mb-2 block">
                      Search Query
                    </Label>
                    <Input
                      id="searchQ"
                      placeholder="Ask your knowledgebase anything…"
                      value={searchQ}
                      onChange={(e) => setSearchQ(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && onSearch()}
                      className="h-10"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="topK" className="text-sm font-medium mb-2 block">
                      Results
                    </Label>
                    <Input
                      id="topK"
                      type="number"
                      min={1}
                      max={50}
                      value={topK}
                      onChange={(e) =>
                        setTopK(() => {
                          const n = Number(e.target.value)
                          return Number.isFinite(n) ? Math.max(1, Math.min(50, n)) : 8
                        })
                      }
                      className="h-10"
                    />
                  </div>
                  <div className="sm:col-span-1 flex items-end">
                    <Button onClick={onSearch} className="w-full h-10" disabled={kbSearch.isPending || !searchQ.trim()}>
                      {kbSearch.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {kbSearch.data && (
                  <div className="space-y-3 pt-2">
                    {kbSearch.data.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 gap-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                          <Search className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">No matches found</p>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between pb-2 border-b">
                          <p className="text-sm font-medium">
                            Found {kbSearch.data.length} result{kbSearch.data.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                        {kbSearch.data.map((m, idx) => (
                          <div
                            key={`${m.id}-${m.chunkIndex ?? 0}`}
                            className="rounded-lg border bg-card p-4 space-y-2 hover:bg-accent/30 transition-colors"
                          >
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                              <span className="font-medium">#{idx + 1}</span>
                              <span className="flex items-center gap-1">
                                Score: {m.score !== undefined ? m.score.toFixed(3) : "-"}
                              </span>
                              <span>Chunk: {m.chunkIndex ?? "-"}</span>
                              <span className="truncate">Doc: {m.documentId ?? "-"}</span>
                            </div>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</p>
                            {m.metadata && (
                              <details className="text-xs">
                                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                                  View metadata
                                </summary>
                                <pre className="mt-2 rounded bg-muted p-2 overflow-x-auto">
                                  {JSON.stringify(m.metadata, null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t bg-muted/30 px-4 sm:px-6 py-3 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{docsPage ? `${docsPage.total} documents` : "Loading…"}</p>
          <Button variant="secondary" onClick={onClose}>
            Close Panel
          </Button>
        </div>
      </aside>

      {/* Document Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={(o) => (o ? setIsModalOpen(true) : closeModal())}>
        <DialogContent
          className="
            w-[100vw] h-[100dvh] max-w-none rounded-none
            sm:w-[95vw] sm:max-w-4xl sm:h-[90vh] sm:rounded-xl
            p-0 overflow-hidden gap-0
          "
        >
          <div className="flex h-full w-full flex-col">
            {/* Sticky header */}
            <DialogHeader className="px-5 py-4 border-b bg-gradient-to-r from-background to-muted/20 shrink-0">
              <DialogTitle className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <span className="truncate text-base sm:text-lg font-semibold">
                  {selectedDoc?.title ?? "Document Details"}
                </span>
              </DialogTitle>
            </DialogHeader>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto">
              {selectedDoc ? (
                <DocumentDetailsModal agentId={agentId} doc={selectedDoc} onClose={closeModal} />
              ) : (
                <div className="flex items-center justify-center p-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Sticky footer */}
            <DialogFooter className="px-5 py-3 border-t bg-muted/30 shrink-0">
              <Button variant="secondary" onClick={closeModal}>
                Close
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

/* =========================================================================
 * Document Details Modal Component
 * ========================================================================= */
function DocumentDetailsModal({
  agentId,
  doc,
  onClose,
}: {
  agentId: string
  doc: KnowledgeBaseDocument
  onClose: () => void
}) {
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
    const nextTags = tags
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
    await upd.mutateAsync({
      title: title.trim() || doc.title,
      tags: nextTags,
    })
  }

  const saveContent = async () => {
    await upd.mutateAsync({
      content,
      reembed: true,
    })
  }

  return (
    <div className="px-4 sm:px-5 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => reembed.mutate({})}
          disabled={reembed.isPending}
          className="gap-2 w-full sm:w-auto"
        >
          {reembed.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
          Re-embed Vectors
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => del.mutate({ hard: false })}
          disabled={del.isPending}
          className="gap-2 w-full sm:w-auto"
        >
          {del.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
          Soft Delete
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => del.mutate({ hard: true })}
          disabled={del.isPending}
          className="gap-2 border-destructive/50 text-destructive hover:bg-destructive/10 w-full sm:w-auto"
        >
          Hard Delete
        </Button>
      </div>

      {/* Metadata */}
      <div className="rounded-lg border bg-muted/30 p-3 sm:p-4">
        <h4 className="text-sm font-semibold mb-3">Document Metadata</h4>
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
          <div>
            <p className="text-muted-foreground mb-1">Status</p>
            <span
              className={`
                inline-flex items-center rounded-full px-2 py-1 font-medium text-xs
                ${
                  String(doc.status) === "ready"
                    ? "bg-green-500/10 text-green-700 dark:text-green-400"
                    : String(doc.status) === "processing"
                      ? "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
                      : "bg-gray-500/10 text-gray-700 dark:text-gray-400"
                }
              `}
            >
              {doc.status}
            </span>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Vectors</p>
            <p className="font-medium">{doc.vectorCount}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">File Size</p>
            <p className="font-medium">{prettyBytes(doc.fileSize)}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">MIME Type</p>
            <p className="font-medium truncate" title={doc.mimeType || "-"}>
              {doc.mimeType || "-"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Updated</p>
            <p className="font-medium">{new Date(doc.updatedAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Edit Title & Tags */}
      <div className="space-y-3 sm:space-y-4">
        <h4 className="text-sm font-semibold">Edit Metadata</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <div className="md:col-span-1 space-y-2">
            <Label htmlFor="docTitle" className="text-sm">
              Title
            </Label>
            <Input id="docTitle" value={title} onChange={(e) => setTitle(e.target.value)} className="h-10" />
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="docTags" className="text-sm flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5" />
              Tags (comma-separated)
            </Label>
            <Input id="docTags" value={tags} onChange={(e) => setTags(e.target.value)} className="h-10" />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={saveMeta} disabled={upd.isPending} className="w-full sm:w-auto">
            {upd.isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
            Save Metadata
          </Button>
        </div>
      </div>

      {/* Edit Content */}
      <div className="space-y-3 sm:space-y-4">
        <h4 className="text-sm font-semibold">Edit Content</h4>
        <div className="space-y-2">
          <Label htmlFor="docContent" className="text-sm">
            Document Content
          </Label>
          <Textarea
            id="docContent"
            className="min-h-[200px] sm:min-h-[300px] lg:min-h-[400px] max-h-[60vh] resize-y font-mono text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Document content will appear here if available…"
          />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <Button size="sm" onClick={saveContent} disabled={upd.isPending} className="w-full sm:w-auto">
            {upd.isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
            Save & Re-embed Content
          </Button>
          <p className="text-xs text-muted-foreground">
            Saving will automatically re-embed the document with updated content
          </p>
        </div>
      </div>
    </div>
  )
}
