// app/(ui)/dashboard/agents/[id]/googlecalendar/loading.tsx
export default function Loading() {
  return (
    <section className="space-y-4" aria-busy="true" aria-live="polite">
      <div className="h-6 w-48 rounded-md bg-muted animate-pulse" />
      <div className="rounded-xl border p-6">
        <div className="h-4 w-72 rounded bg-muted animate-pulse mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-24 rounded bg-muted animate-pulse" />
          <div className="h-24 rounded bg-muted animate-pulse" />
        </div>
      </div>
    </section>
  );
}
