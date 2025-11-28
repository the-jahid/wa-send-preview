"use client"

export const dynamic = "force-dynamic"

import { useEffect, useRef, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { QueryClient, QueryClientProvider, useMutation } from "@tanstack/react-query"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useApiToken } from "@/lib/api-token-provider"
import { googleCallbackMutation } from "@/app/features/google-auth-calendar-connection/query"

export default function GoogleCallbackPage() {
  const [qc] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 0, refetchOnWindowFocus: false },
          mutations: { retry: 0 },
        },
      }),
  )
  return (
    <QueryClientProvider client={qc}>
      <Suspense
        fallback={
          <section className="mx-auto max-w-lg space-y-4 p-8 text-center">
            <Loader2 className="mx-auto h-6 w-6 animate-spin" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </section>
        }
      >
        <CallbackInner />
      </Suspense>
    </QueryClientProvider>
  )
}

function CallbackInner() {
  const sp = useSearchParams()
  const router = useRouter()
  const code = sp.get("code")
  const oauthErr = sp.get("error") // renamed for clarity
  const didRun = useRef(false)

  const getToken = useApiToken()

  // ✅ useMutation here (previously you were calling googleCallbackMutation directly)
  const cb = useMutation(googleCallbackMutation({ getToken }))

  useEffect(() => {
    if (didRun.current) return
    didRun.current = true

    console.log("[GoogleCallback] code:", code)
    console.log("[GoogleCallback] oauthErr:", oauthErr)
    console.log("[GoogleCallback] NEXT_PUBLIC_API_BASE_URL:", process.env.NEXT_PUBLIC_API_BASE_URL)

    if (oauthErr) return // show the error UI below
    if (!code) return // opened /google manually
    ;(async () => {
      try {
        console.log("[GoogleCallback] Posting code to backend...")
        await cb.mutateAsync({ code }) // POST /auth/google/callback
        console.log("[GoogleCallback] Backend callback success")

        // Send user back to where they started (saved in connect page)
        let backTo = "/dashboard"
        try {
          const stored = sessionStorage.getItem("postConnectRedirect")
          if (stored) backTo = stored
          sessionStorage.removeItem("postConnectRedirect")
        } catch {}

        router.replace(backTo)
      } catch (e) {
        console.error("[GoogleCallback] Backend callback failed:", e)
      }
    })()
  }, [code, oauthErr, cb, router])

  if (oauthErr) {
    return (
      <section className="mx-auto max-w-lg space-y-4 p-8">
        <div className="flex items-center gap-2 text-red-600">
          <XCircle className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Google sign-in failed</h2>
        </div>
        <p className="text-sm text-muted-foreground">{oauthErr}</p>
        <Button onClick={() => router.replace("/dashboard")}>Back to dashboard</Button>
      </section>
    )
  }

  if (cb.isPending) {
    return (
      <section className="mx-auto max-w-lg space-y-4 p-8 text-center">
        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
        <p className="text-sm text-muted-foreground">Completing Google connection…</p>
      </section>
    )
  }

  if (cb.isError) {
    return (
      <section className="mx-auto max-w-lg space-y-4 p-8">
        <div className="flex items-center gap-2 text-red-600">
          <XCircle className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Couldn't complete the connection</h2>
        </div>
        <pre className="rounded-md bg-muted p-3 text-sm overflow-auto">{(cb.error as Error)?.message}</pre>
        <Button onClick={() => router.replace("/dashboard")}>Back to dashboard</Button>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-lg space-y-4 p-8 text-center">
      <CheckCircle2 className="mx-auto h-6 w-6 text-emerald-600" />
      <p className="text-sm text-muted-foreground">Google account connected!</p>
      <Button onClick={() => router.replace("/dashboard")}>Go to dashboard</Button>
    </section>
  )
}
