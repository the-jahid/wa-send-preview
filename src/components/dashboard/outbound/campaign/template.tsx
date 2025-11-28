// src/components/dashboard/outbound/campaign/template.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
} from 'lucide-react';

import {
  useTemplates,
  useCreateTemplate,
  useUpdateTemplate as useUpdateTemplateMut,
  useReplaceTemplateMedia,
  useClearTemplateMedia,
  useDeleteTemplate as useDeleteTemplateMut,
  getTemplateMediaUrl,
} from '@/app/features/outbound-campaign-template';

import {
  useBroadcastStatus,
  useSetBroadcastTemplate,
  useClearBroadcastTemplate,
} from '@/app/features/outbound-broadcast';

import {
  CreateTemplateSchema,
  UpdateTemplateSchema,
} from '@/app/features/outbound-campaign-template';
import type {
  Template,
  CreateTemplateDto,
  UpdateTemplateDto,
} from '@/app/features/outbound-campaign-template';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';

/* ---------------------- Utilities ---------------------- */
const nonEmpty = (v?: string | null): v is string =>
  typeof v === 'string' && v.trim().length > 0;
const formatBytes = (n?: number | null) =>
  typeof n === 'number' ? `${(n / (1024 * 1024)).toFixed(2)} MB` : '—';
const safeMsg = (e: unknown) =>
  (e as any)?.message && typeof (e as any).message === 'string'
    ? String((e as any).message).slice(0, 400)
    : 'Something went wrong';

function ErrorMsg({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-xs text-red-600 mt-1">{msg}</p>;
}

/* ======================================================================= */
/*                                Templates Panel                          */
/* ======================================================================= */

export default function TemplatesPanel({ agentId }: { agentId: string }) {
  // campaignId from /dashboard/outbound/[campaignId]/campaign
  const { campaignId } = useParams<{ campaignId: string }>();

  const [q, setQ] = useState('');
  const [selectedId, setSelectedId] = useState<string | 'new' | null>(null);

  const params = useMemo(() => ({ agentId, q }), [agentId, q]);
  const list = useTemplates(params, { enabled: !!agentId });

  // Broadcast snapshot for selectedTemplateId (read-only; never change status here)
  const statusQ = useBroadcastStatus(campaignId);
  const selectedTemplateIdForBroadcast =
    statusQ.data?.broadcast?.selectedTemplateId ?? null;

  // Dedicated template-only endpoints (do NOT touch status)
  const setTplMut = useSetBroadcastTemplate(agentId, campaignId);
  const clearTplMut = useClearBroadcastTemplate(agentId, campaignId);

  useEffect(() => {
    if (!selectedId && (list.data?.items?.length ?? 0) > 0) {
      if (selectedTemplateIdForBroadcast) {
        const exists = list
          .data!.items.some((t) => t.id === selectedTemplateIdForBroadcast);
        setSelectedId(
          exists ? selectedTemplateIdForBroadcast : list.data!.items[0].id,
        );
      } else {
        setSelectedId(list.data!.items[0].id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list.data?.items?.length, selectedTemplateIdForBroadcast]);

  const items = list.data?.items ?? [];
  const selectedTpl =
    typeof selectedId === 'string' && selectedId !== 'new'
      ? items.find((i) => i.id === selectedId)
      : undefined;

  async function selectForBroadcast(id: string) {
    if (!nonEmpty(agentId) || !nonEmpty(campaignId) || !nonEmpty(id)) return;
    await setTplMut.mutateAsync({ templateId: id });
    await statusQ.refetch();
  }

  async function clearBroadcastTemplate() {
    if (!nonEmpty(agentId) || !nonEmpty(campaignId)) return;
    await clearTplMut.mutateAsync();
    await statusQ.refetch();
  }

  const setting = setTplMut.isPending || clearTplMut.isPending;
  const setError = setTplMut.isError
    ? safeMsg(setTplMut.error)
    : clearTplMut.isError
    ? safeMsg(clearTplMut.error)
    : undefined;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Templates</CardTitle>
            <CardDescription>
              Two-pane: list on the left, editor on the right
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                list.refetch();
                statusQ.refetch();
              }}
              title="Refresh"
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
            <Button size="sm" className="gap-2" onClick={() => setSelectedId('new')}>
              <Plus className="h-4 w-4" /> New template
            </Button>
          </div>
        </div>

        {/* Topline selection indicator */}
        {statusQ.isLoading ? (
          <div className="mt-2 text-xs text-muted-foreground">
            Loading broadcast selection…
          </div>
        ) : selectedTemplateIdForBroadcast ? (
          <div className="mt-2 text-xs text-green-700">
            <CheckCircle2 className="inline -mt-0.5 mr-1 h-3.5 w-3.5" />
            Selected for broadcast
          </div>
        ) : (
          <div className="mt-2 text-xs text-amber-700">
            No template selected for broadcast
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-[320px_minmax(0,1fr)] gap-4">
          {/* LEFT: list & search */}
          <div className="rounded-lg border bg-background">
            <div className="p-3 border-b">
              <Input
                placeholder="Search name/body…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <div className="mt-1 text-xs text-muted-foreground">
                {list.isLoading ? 'Loading…' : `Showing ${items.length} item(s)`}
              </div>
            </div>

            <div className="max-h-[520px] overflow-auto">
              {list.isLoading ? (
                <div className="p-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading templates…
                </div>
              ) : list.isError ? (
                <div className="p-3">
                  <Alert variant="destructive">
                    <AlertTitle>Failed to load</AlertTitle>
                    <AlertDescription>{safeMsg(list.error)}</AlertDescription>
                  </Alert>
                </div>
              ) : items.length === 0 ? (
                <div className="p-3 text-sm text-muted-foreground">
                  No templates yet.
                </div>
              ) : (
                <ul className="divide-y">
                  {items.map((tpl) => {
                    const isSelectedInBroadcast =
                      tpl.id === selectedTemplateIdForBroadcast;
                    return (
                      <li key={tpl.id}>
                        <div
                          className={`px-3 py-2 transition ${
                            selectedId === tpl.id
                              ? 'bg-muted'
                              : 'hover:bg-muted/50'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <button
                              type="button"
                              className="min-w-0 text-left flex-1"
                              onClick={() => setSelectedId(tpl.id)}
                              title={tpl.id}
                            >
                              <div className="truncate font-medium flex items-center gap-2">
                                {tpl.name}
                                {isSelectedInBroadcast && (
                                  <Badge
                                    variant="secondary"
                                    className="text-[10px] bg-green-100 text-green-700 border border-green-200"
                                  >
                                    Selected
                                  </Badge>
                                )}
                              </div>
                              <div className="truncate text-xs text-muted-foreground">
                                {tpl.body}
                              </div>
                            </button>

                            <div className="shrink-0 flex items-center gap-1">
                              {tpl.hasMedia ? (
                                tpl.mediaMimeType?.startsWith('image/') ? (
                                  <Badge
                                    variant="secondary"
                                    className="gap-1 text-[10px]"
                                  >
                                    <ImageIcon className="h-3 w-3" /> image
                                  </Badge>
                                ) : tpl.mediaMimeType?.startsWith('video/') ? (
                                  <Badge
                                    variant="secondary"
                                    className="gap-1 text-[10px]"
                                  >
                                    <Video className="h-3 w-3" /> video
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="text-[10px]">
                                    doc
                                  </Badge>
                                )
                              ) : (
                                <Badge variant="outline" className="text-[10px]">
                                  text
                                </Badge>
                              )}

                              {/* Inline "Use" button — template-only endpoint */}
                              {!isSelectedInBroadcast && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2 gap-1"
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    await selectForBroadcast(tpl.id);
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
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* RIGHT: editor panel */}
          <div className="min-h-[520px] rounded-lg border bg-background p-4">
            {selectedId === 'new' ? (
              <CreateTemplateInline
                agentId={agentId}
                onCreated={(id?: string) => {
                  list.refetch();
                  if (id) setSelectedId(id);
                }}
              />
            ) : selectedTpl ? (
              <EditTemplateInline
                agentId={agentId}
                tpl={selectedTpl}
                isSelectedInBroadcast={
                  selectedTpl.id === selectedTemplateIdForBroadcast
                }
                onSelectTemplate={() => selectForBroadcast(selectedTpl.id)}
                onClearTemplate={clearBroadcastTemplate}
                onChanged={() => {
                  list.refetch();
                  statusQ.refetch();
                }}
                onDeleted={() => {
                  list.refetch();
                  statusQ.refetch();
                  setSelectedId(null);
                }}
                isSetting={setting}
                setError={setError}
              />
            ) : (
              <div className="h-full grid place-items-center text-sm text-muted-foreground">
                Select a template from the left or create a new one.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* --------------------- Create (inline) --------------------- */
type CreateForm = z.infer<typeof CreateTemplateSchema>;

function CreateTemplateInline({
  agentId,
  onCreated,
}: {
  agentId: string;
  onCreated: (newId?: string) => void;
}) {
  const createMut = useCreateTemplate(agentId);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm<CreateForm>({
    resolver: zodResolver(CreateTemplateSchema),
    defaultValues: { agentId, name: '', body: 'Hello world', variables: [] },
  });

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onSubmit = async (v: CreateForm) => {
    const variables = Array.isArray(v.variables) ? v.variables : [];
    const created = await createMut.mutateAsync({
      ...(v as CreateTemplateDto),
      variables,
      mediaFile: file,
    });
    form.reset({ agentId, name: '', body: 'Hello world', variables: [] });
    setFile(null);
    onCreated((created as any)?.id);
  };

  const isImage = file?.type?.startsWith('image/');
  const isVideo = file?.type?.startsWith('video/');
  const isDoc = file?.type?.startsWith('application/');

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold">Create template</h3>
        <p className="text-xs text-muted-foreground">
          Define content, variables, and optional media
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Name</Label>
            <Input placeholder="Welcome message" {...form.register('name')} />
            <ErrorMsg msg={form.formState.errors.name?.message} />
          </div>
        </div>

        <div className="grid gap-2">
          <Label>Body</Label>
          <Textarea
            placeholder="Type the message body…"
            className="min-h-[96px]"
            {...form.register('body')}
          />
        </div>

        <div className="grid gap-1">
          <Label>Variables (comma separated)</Label>
          <Input
            placeholder="firstName, date"
            onChange={(e) => {
              const vars = e.currentTarget.value
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean);
              form.setValue('variables', vars);
            }}
          />
          {form.watch('variables')?.length ? (
            <div className="flex flex-wrap gap-1 pt-1">
              {form.watch('variables')!.map((v) => (
                <Badge key={v} variant="secondary">
                  {v}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>

        <div className="grid gap-2">
          <Label>Media (image/video/document, optional)</Label>
          <Input
            type="file"
            accept="image/*,video/*,application/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          {previewUrl && (
            <div className="mt-2 space-y-1">
              {isImage ? (
                <div className="rounded-lg border p-2 inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="preview"
                    className="max-w-[280px] rounded-md"
                  />
                </div>
              ) : isVideo ? (
                <video
                  src={previewUrl}
                  controls
                  className="max-w-[320px] rounded-md border"
                />
              ) : isDoc ? (
                <div className="text-xs text-muted-foreground">
                  Document selected: {file?.name} • {file?.type} •{' '}
                  {formatBytes(file?.size)}
                </div>
              ) : null}
              {!isDoc && (
                <div className="text-xs text-muted-foreground">
                  {file?.name} • {file?.type} • {formatBytes(file?.size)}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={createMut.isPending} className="gap-2">
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
          <Alert variant="destructive">
            <AlertTitle>Failed to create</AlertTitle>
            <AlertDescription>{safeMsg(createMut.error)}</AlertDescription>
          </Alert>
        )}
      </form>
    </div>
  );
}

/* --------------------- Edit (inline) --------------------- */
type UpdateTemplateForm = z.infer<typeof UpdateTemplateSchema>;

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
  tpl: Template;
  agentId: string;
  isSelectedInBroadcast: boolean;
  onSelectTemplate: () => Promise<void> | void;
  onClearTemplate: () => Promise<void> | void;
  onChanged: () => void;
  onDeleted: () => void;
  isSetting?: boolean;
  setError?: string;
}) {
  const updateMut = useUpdateTemplateMut(agentId);
  const replaceMut = useReplaceTemplateMedia(agentId);
  const clearMediaMut = useClearTemplateMedia(agentId);
  const deleteMut = useDeleteTemplateMut(agentId);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [varsCsv, setVarsCsv] = useState(tpl.variables.join(', '));

  const form = useForm<UpdateTemplateForm>({
    resolver: zodResolver(UpdateTemplateSchema),
    defaultValues: { name: tpl.name, body: tpl.body, variables: tpl.variables },
  });

  useEffect(() => {
    form.reset({ name: tpl.name, body: tpl.body, variables: tpl.variables });
    setVarsCsv(tpl.variables.join(', '));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tpl.id]);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const mediaUrl = tpl.hasMedia ? getTemplateMediaUrl(tpl.id) : null;

  const isImage = file?.type?.startsWith('image/');
  const isVideo = file?.type?.startsWith('video/');
  const isDoc = file?.type?.startsWith('application/');

  const submitUpdate = async (v: UpdateTemplateForm) => {
    // Update TEMPLATE ONLY (never touches broadcast)
    const variables = Array.isArray(v.variables)
      ? v.variables
      : varsCsv
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
    const payload: UpdateTemplateDto = { ...v, variables };
    await updateMut.mutateAsync({ id: tpl.id, data: payload });
    onChanged();
  };

  const submitReplace = async () => {
    if (!file) return;
    await replaceMut.mutateAsync({ id: tpl.id, file });
    setFile(null);
    onChanged();
  };

  const onDeleteClick = async () => {
    // If currently selected for broadcast, warn and clear selection first.
    let question = 'Delete this template?';
    if (isSelectedInBroadcast) {
      question =
        'This template is currently selected for this campaign’s broadcast.\n\nIf you delete it, the campaign’s selected template will be cleared (status will NOT change).\n\nProceed?';
    }
    if (!confirm(question)) return;

    try {
      if (isSelectedInBroadcast) {
        // Clear selection (sets selectedTemplateId = null; does NOT change any statuses)
        await onClearTemplate();
      }
      await deleteMut.mutateAsync(tpl.id);
      onDeleted();
    } catch (err) {
      // Surface error via alert UI below
      console.error('Delete template failed:', err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold">{tpl.name}</h3>
          <p className="text-xs text-muted-foreground">ID: {tpl.id}</p>
        </div>

        {/* Broadcast selection controls — template-only endpoints */}
        <div className="flex items-center gap-2">
          {isSelectedInBroadcast ? (
            <div className="flex items-center gap-2">
              <span className="text-green-700 text-sm flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Selected for broadcast
              </span>
              <Button
                variant="outline"
                className="gap-2 text-red-600 border-red-200 hover:text-red-700 hover:bg-red-50"
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
            <Button className="gap-2" onClick={onSelectTemplate} disabled={!!isSetting}>
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
        <Alert variant="destructive">
          <AlertTitle>Selection update failed</AlertTitle>
          <AlertDescription>{setError}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="content" className="w-full">
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
        </TabsList>

        {/* CONTENT */}
        <TabsContent value="content" className="mt-4">
          <form onSubmit={form.handleSubmit(submitUpdate)} className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Name</Label>
                <Input {...form.register('name')} />
                <ErrorMsg msg={form.formState.errors.name?.message} />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Body</Label>
              <Textarea className="min-h-[96px]" {...form.register('body')} />
            </div>

            <div className="grid gap-2">
              <Label>Variables (comma separated)</Label>
              <Input
                value={varsCsv}
                onChange={(e) => setVarsCsv(e.target.value)}
                placeholder="firstName, date"
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={updateMut.isPending} className="gap-2">
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
                className="gap-2 text-red-600 border-red-200 hover:text-red-700 hover:bg-red-50"
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
              <Alert variant="destructive">
                <AlertTitle>Action failed</AlertTitle>
                <AlertDescription>
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
              <div className="text-sm font-medium">Current media</div>
              {tpl.hasMedia ? (
                <div>
                  {tpl.mediaMimeType?.startsWith('image/') ? (
                    <div className="rounded-lg border p-2 inline-block">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={mediaUrl!}
                        alt={tpl.mediaFileName ?? 'image'}
                        className="max-w-[360px] rounded-md"
                      />
                    </div>
                  ) : tpl.mediaMimeType?.startsWith('video/') ? (
                    <video
                      controls
                      src={mediaUrl!}
                      className="max-w-[420px] rounded-md border"
                    />
                  ) : (
                    <div className="text-sm">
                      Document:{' '}
                      <a
                        className="underline"
                        href={mediaUrl!}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {tpl.mediaFileName ?? 'download'}
                      </a>{' '}
                      <span className="text-xs text-muted-foreground">
                        ({tpl.mediaMimeType}) • {formatBytes(tpl.mediaSize)}
                      </span>
                    </div>
                  )}
                  {tpl.mediaMimeType?.startsWith('image/') && (
                    <div className="text-xs text-muted-foreground mt-2">
                      {tpl.mediaFileName} • {tpl.mediaMimeType} •{' '}
                      {formatBytes(tpl.mediaSize)}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No media attached.</div>
              )}
            </div>

            <div className="space-y-3">
              <div className="text-sm font-medium">Replace / Clear Media</div>
              <Input
                type="file"
                accept="image/*,video/*,application/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />

              {previewUrl && (
                <div className="space-y-1">
                  {isImage ? (
                    <div className="rounded-lg border p-2 inline-block">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewUrl}
                        alt="preview"
                        className="max-w-[220px] rounded-md"
                      />
                    </div>
                  ) : isVideo ? (
                    <video
                      src={previewUrl}
                      controls
                      className="max-w-[260px] rounded-md border"
                    />
                  ) : isDoc ? (
                    <div className="text-xs text-muted-foreground">
                      Document selected: {file?.name} • {file?.type} •{' '}
                      {formatBytes(file?.size)}
                    </div>
                  ) : null}
                  {!isDoc && (
                    <div className="text-xs text-muted-foreground">
                      {file?.name} • {file?.type} • {formatBytes(file?.size)}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="gap-2"
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
                    className="gap-2 text-red-600 border-red-200 hover:text-red-700 hover:bg-red-50"
                    onClick={async () => {
                      await clearMediaMut.mutateAsync(tpl.id);
                      onChanged();
                    }}
                  >
                    <Trash2 className="h-4 w-4" /> Clear
                  </Button>
                )}
              </div>

              {(replaceMut.isError || clearMediaMut.isError) && (
                <Alert variant="destructive">
                  <AlertTitle>Media action failed</AlertTitle>
                  <AlertDescription>
                    {safeMsg(replaceMut.error) || safeMsg(clearMediaMut.error)}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
