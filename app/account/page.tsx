"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { useState } from "react"
import {
  LogOut, Mail, Phone, MapPin, ShieldCheck, Loader2, Heart, ShoppingBag,
  LifeBuoy, Package, ArrowRight, CalendarDays, Truck, Sparkles, ChevronRight,
  Pencil, Save, X,
} from "lucide-react"

import type { RootState } from "@/store/store"
import { useLogoutMutation, useUpdateProfileMutation } from "@/api/authApi"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useGetWishlistQuery } from "@/api/wishlistApi"
import { useGetUserTicketsQuery } from "@/api/supportApi"
import { useGetNotificationsQuery, useMarkNotificationReadMutation } from "@/api/notificationsApi"
import { getImageUrl } from "@/api/productsApi"
import { Button } from "@/components/ui/button"
import { RequireAuth } from "@/components/require-auth"

export default function AccountPage() {
  return (
    <RequireAuth>
      <AccountContent />
    </RequireAuth>
  )
}

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

const statusStyles: Record<string, string> = {
  open: "bg-green-500/10 text-green-600",
  pending: "bg-yellow-500/10 text-yellow-600",
  in_progress: "bg-blue-500/10 text-blue-600",
  resolved: "bg-primary/10 text-primary",
  closed: "bg-muted text-muted-foreground",
}

const productImage = (p: any) =>
  getImageUrl(p?.image?.thumbnailURL || p?.image?.url || p?.images?.[0]?.image?.url)

function AccountContent() {
  const router = useRouter()
  const user = useSelector((state: RootState) => state.auth.user)!
  const cartItems = useSelector((state: RootState) => state.cart.items)
  const [logout, { isLoading }] = useLogoutMutation()

  const { data: wishlist } = useGetWishlistQuery()
  const { data: ticketData } = useGetUserTicketsQuery()
  const { data: notificationData } = useGetNotificationsQuery()
  const [markRead] = useMarkNotificationReadMutation()

  const notifications = notificationData?.docs ?? []
  const unreadCount = notifications.filter((n) => !n.isRead).length

  const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation()
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    phone: user.phone ?? "",
    address: user.address ?? "",
  })

  const startEditing = () => {
    setForm({
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      phone: user.phone ?? "",
      address: user.address ?? "",
    })
    setIsEditing(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.firstName.trim() || !form.lastName.trim() || !form.phone.trim()) {
      toast.error("Name and phone are required")
      return
    }
    try {
      await updateProfile({
        id: user.id,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
      }).unwrap()
      toast.success("Profile updated")
      setIsEditing(false)
    } catch (err: any) {
      const message =
        err?.data?.errors?.[0]?.message ||
        (String(err?.status) === "409" ? "That phone number is already in use" : "") ||
        "Could not update your profile. Please try again."
      toast.error(message)
    }
  }

  const wishlistItems = wishlist ?? []
  const tickets = ticketData?.docs ?? []
  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0)
  const cartTotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0)

  const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() || "U"
  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" })
    : null

  const handleLogout = async () => {
    try {
      await logout().unwrap()
    } catch {
      // even if the server call fails, credentials are cleared locally
    }
    toast.success("You've been signed out")
    router.push("/")
  }

  const stats = [
    { icon: Heart, label: "Wishlist", value: wishlistItems.length, href: "/wishlist" },
    { icon: ShoppingBag, label: "In Cart", value: cartCount, href: "/order" },
    { icon: Package, label: "Cart Value", value: `৳${cartTotal}`, href: "/order" },
    { icon: LifeBuoy, label: "Tickets", value: tickets.length, href: "/support" },
  ]

  const details = [
    { icon: Mail, label: "Email", value: user.email },
    { icon: Phone, label: "Phone", value: user.phone || "—" },
    { icon: MapPin, label: "Address", value: user.address || "Not added yet" },
    { icon: ShieldCheck, label: "Role", value: user.role, capitalize: true },
  ]

  const actions = [
    { icon: ShoppingBag, label: "Continue Shopping", desc: "Browse the full collection", href: "/products" },
    { icon: Truck, label: "Track an Order", desc: "See where your order is", href: "/order/track" },
    { icon: Heart, label: "My Wishlist", desc: `${wishlistItems.length} saved item${wishlistItems.length === 1 ? "" : "s"}`, href: "/wishlist" },
    { icon: LifeBuoy, label: "Get Support", desc: "Questions or an issue?", href: "/support" },
  ]

  return (
    <div className="min-h-screen bg-secondary/20 py-10 sm:py-14 px-4">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* ── Profile header ── */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp}
          className="relative overflow-hidden rounded-2xl border border-border bg-background shadow-sm"
        >
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-primary/15 via-primary/5 to-transparent" />
          <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-2xl font-semibold shrink-0 shadow-md">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-foreground truncate">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-sm text-muted-foreground truncate">{user.email}</p>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="inline-flex items-center gap-1 text-[11px] font-medium capitalize bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                  <ShieldCheck className="w-3 h-3" /> {user.role}
                </span>
                {memberSince && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-muted text-muted-foreground px-2.5 py-1 rounded-full">
                    <CalendarDays className="w-3 h-3" /> Member since {memberSince}
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((s, i) => (
            <motion.div key={s.label} custom={i + 1} initial="hidden" animate="visible" variants={fadeUp}>
              <Link href={s.href}>
                <div className="bg-background rounded-2xl border border-border p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all h-full">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <s.icon className="w-3.5 h-3.5" />
                    <span className="text-[11px] uppercase tracking-wide font-medium">{s.label}</span>
                  </div>
                  <p className="text-2xl font-semibold text-foreground">{s.value}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left column ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Account details */}
            <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp}
              className="bg-background rounded-2xl border border-border shadow-sm overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-border flex items-center justify-between gap-3">
                <h2 className="font-semibold text-foreground">Account Details</h2>
                {!isEditing && (
                  <Button variant="ghost" size="sm" onClick={startEditing} className="gap-1.5 h-8 text-xs">
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </Button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSave} className="p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="firstName" className="text-xs">First Name</Label>
                      <Input
                        id="firstName"
                        value={form.firstName}
                        onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="lastName" className="text-xs">Last Name</Label>
                      <Input
                        id="lastName"
                        value={form.lastName}
                        onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs">Phone</Label>
                    <Input
                      id="phone"
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="address" className="text-xs">Address</Label>
                    <Textarea
                      id="address"
                      rows={3}
                      placeholder="Street, area, city…"
                      value={form.address}
                      onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Email</Label>
                    <Input value={user.email} disabled />
                    <p className="text-[11px] text-muted-foreground">
                      Email can&apos;t be changed here — contact support if you need it updated.
                    </p>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button type="submit" disabled={isSaving} className="gap-2">
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {isSaving ? "Saving…" : "Save Changes"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving} className="gap-2">
                      <X className="w-4 h-4" /> Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="divide-y divide-border">
                  {details.map(({ icon: Icon, label, value, capitalize }) => (
                    <div key={label} className="flex items-start justify-between gap-4 px-6 py-3.5 text-sm">
                      <span className="text-muted-foreground flex items-center gap-2 shrink-0">
                        <Icon className="w-3.5 h-3.5" /> {label}
                      </span>
                      <span className={`font-medium text-foreground text-right break-words ${capitalize ? "capitalize" : ""}`}>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Notifications */}
            {notifications.length > 0 && (
              <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp}
                className="bg-background rounded-2xl border border-border shadow-sm overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-border flex items-center gap-2">
                  <h2 className="font-semibold text-foreground">Notifications</h2>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-semibold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="divide-y divide-border">
                  {notifications.slice(0, 5).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => { if (!n.isRead) markRead(n.id) }}
                      className={`px-6 py-3.5 flex gap-3 cursor-pointer transition-colors ${
                        n.isRead ? "hover:bg-secondary/30" : "bg-primary/5 hover:bg-primary/10"
                      }`}
                    >
                      <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${n.isRead ? "bg-transparent" : "bg-primary"}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${n.isRead ? "text-foreground" : "font-semibold text-foreground"}`}>
                          {n.title}
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line line-clamp-3 mt-0.5">
                          {n.message}
                        </p>
                        <p className="text-[11px] text-muted-foreground/70 mt-1">
                          {new Date(n.createdAt).toLocaleString("en-GB", {
                            day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Recent support tickets */}
            {tickets.length > 0 && (
              <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp}
                className="bg-background rounded-2xl border border-border shadow-sm overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                  <h2 className="font-semibold text-foreground">Recent Support Tickets</h2>
                  <Link href="/support" className="text-xs text-primary hover:underline">View all</Link>
                </div>
                <div className="divide-y divide-border">
                  {tickets.slice(0, 4).map((t) => (
                    <Link key={t.id} href={`/support/ticket/${t.id}`} className="flex items-center gap-3 px-6 py-3.5 hover:bg-secondary/40 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{t.subject}</p>
                        <p className="text-[11px] text-muted-foreground">
                          #{t.ticketNumber} · {new Date(t.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                        </p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize shrink-0 ${statusStyles[t.status] ?? "bg-muted text-muted-foreground"}`}>
                        {t.status?.replace(/_/g, " ")}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Wishlist preview */}
            {wishlistItems.length > 0 && (
              <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUp}
                className="bg-background rounded-2xl border border-border shadow-sm overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                  <h2 className="font-semibold text-foreground">Saved for Later</h2>
                  <Link href="/wishlist" className="text-xs text-primary hover:underline">View all</Link>
                </div>
                <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {wishlistItems.slice(0, 4).map((item: any) => (
                    <Link key={item.id} href={`/products/${item.product?.id}`} className="group">
                      <div className="aspect-square rounded-xl overflow-hidden bg-secondary/30 mb-2">
                        <img
                          src={productImage(item.product)}
                          alt={item.product?.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <p className="text-xs font-medium text-foreground line-clamp-1">{item.product?.title}</p>
                      <p className="text-xs text-primary font-semibold">৳{item.product?.salePrice || item.product?.price}</p>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* ── Right column ── */}
          <div className="space-y-6">
            <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp}
              className="bg-background rounded-2xl border border-border shadow-sm overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-border">
                <h2 className="font-semibold text-foreground">Quick Actions</h2>
              </div>
              <div className="divide-y divide-border">
                {actions.map(({ icon: Icon, label, desc, href }) => (
                  <Link key={label} href={href} className="flex items-center gap-3 px-5 py-3.5 hover:bg-secondary/40 transition-colors group">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{label}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{desc}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Perks / reassurance */}
            <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUp}
              className="rounded-2xl border border-border bg-primary/5 p-5"
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Your account perks</h3>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1.5 leading-relaxed">
                <li>• Your cart is saved across devices</li>
                <li>• Faster checkout with saved details</li>
                <li>• Track orders and support tickets in one place</li>
              </ul>
            </motion.div>

            <Button
              variant="outline"
              onClick={handleLogout}
              disabled={isLoading}
              className="w-full gap-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
              {isLoading ? "Signing out..." : "Sign Out"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
