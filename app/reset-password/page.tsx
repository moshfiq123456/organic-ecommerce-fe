"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { Lock, Loader2, Leaf, CheckCircle2, ArrowRight, AlertCircle } from "lucide-react"

import { useResetPasswordMutation } from "@/api/passwordApi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)

  const token = mounted ? searchParams.get("token") : null
  const email = mounted ? searchParams.get("email") : null

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const [resetPassword, { isLoading }] = useResetPasswordMutation()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!password || !confirmPassword) {
      setError("Please enter both password fields.")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    if (!token || !email) {
      setError("Invalid reset link. Please request a new one.")
      return
    }

    try {
      await resetPassword({
        token,
        email: decodeURIComponent(email),
        password,
      }).unwrap()
      setSubmitted(true)
      toast.success("Password reset successful!")
      setTimeout(() => router.push("/login"), 2000)
    } catch (err: any) {
      const message = err?.data?.errors?.[0]?.message || "Failed to reset password. Please try again."
      setError(message)
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!token || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/20 py-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-md text-center"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-destructive/10 mb-4">
            <AlertCircle className="w-7 h-7 text-destructive" />
          </div>
          <h1 className="text-xl font-bold text-foreground mb-2">Invalid Reset Link</h1>
          <p className="text-muted-foreground mb-6">
            The password reset link is missing or invalid. Please request a new one.
          </p>
          <Link href="/forgot-password">
            <Button className="gap-2">
              Request New Link
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/20 py-16 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        {!submitted ? (
          <>
            <div className="text-center space-y-2 mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-2">
                <Leaf className="w-7 h-7 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Set New Password</h1>
              <p className="text-muted-foreground text-sm">Enter your new password below</p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="bg-background rounded-2xl border border-border p-6 shadow-sm space-y-5"
            >
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs tracking-wide uppercase text-muted-foreground">
                  <Lock className="w-3.5 h-3.5" /> New Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs tracking-wide uppercase text-muted-foreground">
                  <Lock className="w-3.5 h-3.5" /> Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>

              {error && (
                <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-2.5">
                  {error}
                </p>
              )}

              <Button type="submit" disabled={isLoading} className="w-full gap-2">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                {isLoading ? "Resetting..." : "Reset Password"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Remember your password?{" "}
                <Link href="/login" className="text-primary font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          </>
        ) : (
          <div className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-500/10 mb-4"
            >
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </motion.div>
            <h2 className="text-xl font-semibold text-foreground">Password Reset Successful</h2>
            <p className="text-muted-foreground">Your password has been reset. You can now sign in with your new password.</p>

            <Button onClick={() => router.push("/login")} className="w-full gap-2 mt-6">
              Go to Sign In
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

