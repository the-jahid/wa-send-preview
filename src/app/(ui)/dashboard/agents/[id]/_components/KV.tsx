export default function KV({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-slate-500 dark:text-slate-400 w-40">{label}</span>
      <span className="font-medium break-all text-slate-900 dark:text-white">{value}</span>
    </div>
  )
}
