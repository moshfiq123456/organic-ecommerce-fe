"use client"

import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { LogOut, Mail, Phone, MapPin, ShieldCheck, Loader2 } from "lucide-react"

import type { RootState } from "@/store/store"
import { useLogoutMutation } from "@/api/authApi"
import { Button } from "@/components/ui/button"
import { RequireAuth } from "@/components/require-auth"

export default function AccountPage() {
  return (
    <RequireAuth>
      <AccountContent />
    </RequireAuth>
  )
}

function AccountContent() {
  const router = useRouter()
  const user = useSelector((state: RootState) => state.auth.user)!
  const [logout, { isLoading }] = useLogoutMutation()

  const handleLogout = async () => {
    try {
      await logout().unwrap()
    } catch {
      // even if the server call fails, credentials are cleared locally
    }
    toast.success("You've been signed out")
    router.push("/")
  }

  const rows = [
    { icon: Mail, label: "Email", value: user.email, capitalize: false },
    { icon: Phone, label: "Phone", value: user.phone, capitalize: false },
    { icon: MapPin, label: "Address", value: user.address || "—", capitalize: false },
    { icon: ShieldCheck, label: "Role", value: user.role, capitalize: true },
  ]

  return (
    <div className="min-h-screen bg-secondary/20 py-16 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="max-w-xl mx-auto space-y-6"
      >
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-foreground">
            {user.firstName} {user.lastName}
          </h1>
          <p className="text-muted-foreground text-sm">Manage your account details</p>
        </div>

        <div className="bg-background rounded-2xl border border-border p-6 shadow-sm space-y-4">
          {rows.map(({ icon: Icon, label, value, capitalize }) => (
            <div key={label} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5" /> {label}
              </span>
              <span className={`font-medium text-foreground ${capitalize ? "capitalize" : ""}`}>{value}</span>
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          onClick={handleLogout}
          disabled={isLoading}
          className="w-full gap-2"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
          {isLoading ? "Signing out..." : "Sign Out"}
        </Button>
      </motion.div>
    </div>
  )
}
