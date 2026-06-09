"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import { Loader2 } from "lucide-react"

import type { RootState } from "@/store/store"

// `mounted` starts false on every render up to and including the first
// client render, so the spinner below is guaranteed to match the server
// markup byte-for-byte — no hydration mismatch is possible regardless of
// when the auth state finishes loading from localStorage.
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, hydrated } = useSelector((state: RootState) => state.auth)

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (mounted && hydrated && !user) router.replace("/login")
  }, [mounted, hydrated, user, router])

  if (!mounted || !hydrated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return <>{children}</>
}
