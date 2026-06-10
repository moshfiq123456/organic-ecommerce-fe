"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { Mail, Loader2, Leaf, CheckCircle2, ArrowRight } from "lucide-react"

import { useForgotPasswordMutation } from "@/api/passwordApi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const [forgotPassword, { isLoading }] = useForgotPasswordMutation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim()) {
      setError("Please enter your email address.")
      return
    }

    try {
      await forgotPassword({ email: email.trim() }).unwrap()
      setSubmitted(true)
      toast.success("Check your email for password reset instructions")
    } catch (err: any) {
      const message = err?.data?.errors?.[0]?.message || "Something went wrong. Please try again."
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
        {!submitted ? (
          <>
            <div className="text-center space-y-2 mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-2">
                <Leaf className="w-7 h-7 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Reset Password</h1>
              <p className="text-muted-foreground text-sm">
                Enter your email and we&apos;ll send you a link to reset your password
              </p>
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
                  disabled={isLoading}
                />
              </div>

              {error && (
                <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-2.5">
                  {error}
                </p>
              )}

              <Button type="submit" disabled={isLoading} className="w-full gap-2">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                {isLoading ? "Sending..." : "Send Reset Link"}
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
            <h2 className="text-xl font-semibold text-foreground">Check your email</h2>
            <p className="text-muted-foreground">
              We&apos;ve sent a password reset link to <span className="font-medium text-foreground">{email}</span>
            </p>
            <p className="text-sm text-muted-foreground">The link expires in 1 hour.</p>

            <Button onClick={() => router.push("/login")} className="w-full gap-2 mt-6">
              Back to Sign In
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  )
}
