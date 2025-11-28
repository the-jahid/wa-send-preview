'use client';

export default function KV({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-muted-foreground w-40">{label}</span>
      <span className="font-medium break-all">{value}</span>
    </div>
  );
}
