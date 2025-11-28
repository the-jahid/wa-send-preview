'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Agent } from '@/app/features/agent';
import type { Provider, MemoryType } from './model-options';
import { MODEL_OPTIONS, PROVIDERS } from './model-options';

// shadcn/ui
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default function AgentEditForm({
  initial,
  onSave,
  onCancel,
  isSaving,
}: {
  initial: Agent;
  onSave: (payload: any) => Promise<void> | void;
  onCancel: () => void;
  isSaving?: boolean;
}) {
  // local state
  const [name, setName] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [memoryType, setMemoryType] = useState<MemoryType>('BUFFER');
  const [historyLimit, setHistoryLimit] = useState<number>(0);
  const [prompt, setPrompt] = useState('');
  const [useOwnApiKey, setUseOwnApiKey] = useState(false);
  const [provider, setProvider] = useState<Provider>('CHATGPT');
  const [model, setModel] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');

  // hydrate when initial changes
  useEffect(() => {
    setName(initial.name);
    setIsActive(initial.isActive);
    setMemoryType((initial.memoryType as MemoryType) ?? 'BUFFER');
    setHistoryLimit(initial.historyLimit ?? 0);
    setPrompt(initial.prompt ?? '');
    setUseOwnApiKey(initial.useOwnApiKey ?? false);
    const p: Provider = (initial.modelType as Provider) || 'CHATGPT';
    setProvider(p);
    setModel(initial.openAIModel || initial.geminiModel || initial.claudeModel || null);
    setApiKey('');
  }, [initial]);

  const availableModels = useMemo(() => MODEL_OPTIONS[provider] ?? [], [provider]);

  const handleSave = async () => {
    const payload: any = {
      name: name.trim(),
      isActive,
      memoryType,
      prompt: prompt.trim() || null,
      useOwnApiKey,
      historyLimit: Math.max(0, historyLimit),
    };

    if (useOwnApiKey) {
      if (!apiKey.trim()) {
        alert('Please enter your API key or turn off "Use my own API key".');
        return;
      }
      payload.apiKey = apiKey.trim();
      payload.modelType = provider;
      payload.openAIModel = provider === 'CHATGPT' ? model || null : null;
      payload.geminiModel = provider === 'GEMINI' ? model || null : null;
      payload.claudeModel = provider === 'CLAUDE' ? model || null : null;
    } else {
      payload.apiKey = null;
      payload.modelType = 'CHATGPT';
      payload.openAIModel = null;
      payload.geminiModel = null;
      payload.claudeModel = null;
    }

    await onSave(payload);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Agent Name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Active</Label>
          <div className="flex items-center gap-2 mt-2">
            <Switch checked={isActive} onCheckedChange={(v) => setIsActive(Boolean(v))} />
            <span className="text-sm text-muted-foreground">
              {isActive ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>

        <div>
          <Label>History Limit</Label>
          <Input
            type="number"
            min={0}
            value={historyLimit}
            onChange={(e) => setHistoryLimit(parseInt(e.target.value || '0', 10) || 0)}
          />
        </div>
      </div>

      <div>
        <Label>Memory</Label>
        <select
          className="w-full border rounded-md h-9 px-3 text-sm bg-background"
          value={memoryType}
          onChange={(e) => setMemoryType(e.target.value as MemoryType)}
        >
          {(['BUFFER', 'NONE', 'RAG', 'VECTOR'] as MemoryType[]).map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      <div className="rounded-md border p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Switch checked={useOwnApiKey} onCheckedChange={(v) => setUseOwnApiKey(Boolean(v))} />
          <span className="text-sm font-medium">Use my own API key</span>
        </div>

        {!useOwnApiKey ? (
          <p className="text-xs text-muted-foreground">
            This agent will use the application’s default API key & models.
            Turn this on to choose a provider/model and supply your key.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Provider</Label>
              <select
                className="w-full border rounded-md h-9 px-3 text-sm bg-background"
                value={provider}
                onChange={(e) => {
                  setProvider(e.target.value as Provider);
                  setModel(null);
                }}
              >
                {PROVIDERS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            <div>
              <Label>Model</Label>
              <select
                className="w-full border rounded-md h-9 px-3 text-sm bg-background"
                value={model ?? ''}
                onChange={(e) => setModel(e.target.value || null)}
              >
                <option value="">Select model…</option>
                {(availableModels ?? []).map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <Label>My API key *</Label>
              <Input
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Required when using your own key"
                autoComplete="off"
              />
            </div>
          </div>
        )}
      </div>

      <div>
        <Label>Prompt</Label>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="System prompt (optional)"
          className="h-28"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel} disabled={isSaving}>Cancel</Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </div>
  );
}
