"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import Link from "next/link"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { LogIn, Mail, Lock, Loader2, Leaf } from "lucide-react"

import type { RootState } from "@/store/store"
import { useLoginMutation } from "@/api/authApi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const router = useRouter()
  const { user, hydrated } = useSelector((state: RootState) => state.auth)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  const [login, { isLoading }] = useLoginMutation()

  // Gate the redirect on `mounted` (a local flag that is guaranteed false on
  // the server and the first client render) so it only ever fires as a
  // post-mount client-side effect — never during the hydration-matching pass.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (mounted && hydrated && user) router.replace("/")
  }, [mounted, hydrated, user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !password) {
      setError("Please enter both email and password.")
      return
    }

    try {
      await login({ email: email.trim(), password }).unwrap()
      toast.success("Welcome back!")
      router.push("/")
    } catch (err: any) {
      const message =
        err?.data?.errors?.[0]?.message ||
        err?.data?.message ||
        "The email or password you entered is incorrect."
      setError(message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/20 py-16 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-2">
            <Leaf className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
          <p className="text-muted-foreground text-sm">Sign in to your account to continue</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-background rounded-2xl border border-border p-6 shadow-sm space-y-5"
        >
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs tracking-wide uppercase text-muted-foreground">
              <Mail className="w-3.5 h-3.5" /> Email Address
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs tracking-wide uppercase text-muted-foreground">
              <Lock className="w-3.5 h-3.5" /> Password
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-2.5">
              {error}
            </p>
          )}

          <Button type="submit" disabled={isLoading} className="w-full gap-2">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  )
}
