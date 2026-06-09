"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import Link from "next/link"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { UserPlus, Mail, Lock, User, Phone, MapPin, Loader2, Leaf } from "lucide-react"

import type { RootState } from "@/store/store"
import { useRegisterMutation } from "@/api/authApi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function RegisterPage() {
  const router = useRouter()
  const { user, hydrated } = useSelector((state: RootState) => state.auth)

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  const [register, { isLoading }] = useRegisterMutation()

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

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim() || !password) {
      setError("Please fill in all required fields.")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    try {
      await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim() || undefined,
        password,
      }).unwrap()
      toast.success("Account created — welcome!")
      router.push("/")
    } catch (err: any) {
      const message =
        err?.data?.errors?.[0]?.message ||
        err?.data?.message ||
        "We couldn't create your account. Please try again."
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
          <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
          <p className="text-muted-foreground text-sm">Join us to save favorites and track your orders</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-background rounded-2xl border border-border p-6 shadow-sm space-y-5"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="firstName" className="text-xs tracking-wide uppercase text-muted-foreground">
                <User className="w-3.5 h-3.5" /> First Name
              </Label>
              <Input
                id="firstName"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Jane"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lastName" className="text-xs tracking-wide uppercase text-muted-foreground">
                <User className="w-3.5 h-3.5" /> Last Name
              </Label>
              <Input
                id="lastName"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
              />
            </div>
          </div>

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
            <Label htmlFor="phone" className="text-xs tracking-wide uppercase text-muted-foreground">
              <Phone className="w-3.5 h-3.5" /> Phone Number
            </Label>
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="01700000000"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address" className="text-xs tracking-wide uppercase text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" /> Address <span className="normal-case text-muted-foreground/70">(optional)</span>
            </Label>
            <Input
              id="address"
              autoComplete="street-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="House 12, Road 5, Dhaka"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs tracking-wide uppercase text-muted-foreground">
                <Lock className="w-3.5 h-3.5" /> Password
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-xs tracking-wide uppercase text-muted-foreground">
                <Lock className="w-3.5 h-3.5" /> Confirm
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-2.5">
              {error}
            </p>
          )}

          <Button type="submit" disabled={isLoading} className="w-full gap-2">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  )
}
