"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTrackOrderQuery } from "@/api/orderApi"
import { Package, Phone, Hash, CheckCircle2, Clock, Truck, XCircle, Search, MapPin, CreditCard, User, Calendar } from "lucide-react"

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode; step: number }> = {
  pending:    { label: "Pending",    color: "text-amber-500",   icon: <Clock className="w-5 h-5" />,         step: 1 },
  confirmed:  { label: "Confirmed",  color: "text-blue-500",    icon: <CheckCircle2 className="w-5 h-5" />,  step: 2 },
  processing: { label: "Processing", color: "text-violet-500",  icon: <Package className="w-5 h-5" />,       step: 3 },
  shipped:    { label: "Shipped",    color: "text-indigo-500",  icon: <Truck className="w-5 h-5" />,         step: 4 },
  delivered:  { label: "Delivered",  color: "text-emerald-500", icon: <CheckCircle2 className="w-5 h-5" />, step: 5 },
  cancelled:  { label: "Cancelled",  color: "text-red-500",     icon: <XCircle className="w-5 h-5" />,       step: 0 },
}

const STEPS = [
  { code: "pending",    label: "Order Placed" },
  { code: "confirmed",  label: "Confirmed" },
  { code: "processing", label: "Processing" },
  { code: "shipped",    label: "Shipped" },
  { code: "delivered",  label: "Delivered" },
]

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-BD", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

export default function OrderTrackPage() {
  const [orderNumber, setOrderNumber] = useState("")
  const [phone, setPhone] = useState("")
  const [submitted, setSubmitted] = useState<{ orderNumber: string; phone: string } | null>(null)

  const { data, isFetching, isError } = useTrackOrderQuery(
    submitted ?? { orderNumber: "", phone: "" },
    { skip: !submitted }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderNumber.trim() || !phone.trim()) return
    setSubmitted({ orderNumber: orderNumber.trim(), phone: phone.trim() })
  }

  const statusCode = data?.status?.code ?? ""
  const statusCfg = STATUS_CONFIG[statusCode] ?? STATUS_CONFIG["pending"]
  const currentStep = statusCode === "cancelled" ? -1 : statusCfg.step

  return (
    <div className="min-h-screen bg-secondary/20 py-16 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-2">
            <Package className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Track Your Order</h1>
          <p className="text-muted-foreground text-sm">Enter your order ID and phone number to see the latest status</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-background rounded-2xl border border-border p-6 shadow-sm space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-muted-foreground" /> Order Number
            </label>
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="e.g. 748291836472"
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-secondary/30 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-muted-foreground" /> Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 01712345678"
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-secondary/30 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>

          <button
            type="submit"
            disabled={isFetching}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {isFetching ? (
              <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            {isFetching ? "Searching..." : "Track Order"}
          </button>
        </form>

        {/* Error */}
        <AnimatePresence>
          {isError && submitted && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="bg-destructive/10 border border-destructive/20 rounded-2xl p-5 flex items-center gap-3"
            >
              <XCircle className="w-5 h-5 text-destructive shrink-0" />
              <div>
                <p className="text-sm font-medium text-destructive">Order not found</p>
                <p className="text-xs text-destructive/70 mt-0.5">Please check your Order ID and phone number and try again.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result */}
        <AnimatePresence>
          {data && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Status banner */}
              <div className="bg-background rounded-2xl border border-border p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Order ID</p>
                    <p className="text-sm font-mono font-semibold text-foreground mt-0.5">{data.id}</p>
                  </div>
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full bg-current/10 ${statusCfg.color}`}>
                    {statusCfg.icon}
                    <span className="text-sm font-semibold">{data.status?.title ?? statusCfg.label}</span>
                  </div>
                </div>

                {/* Progress steps (hidden for cancelled) */}
                {statusCode !== "cancelled" && (
                  <div className="relative flex items-center justify-between">
                    {/* connecting line */}
                    <div className="absolute left-0 right-0 top-4 h-0.5 bg-border -z-0" />
                    <div
                      className="absolute left-0 top-4 h-0.5 bg-primary transition-all duration-700 -z-0"
                      style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                    />
                    {STEPS.map((step, i) => {
                      const done = i + 1 < currentStep
                      const active = i + 1 === currentStep
                      return (
                        <div key={step.code} className="flex flex-col items-center gap-2 z-10">
                          <div className={[
                            "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                            done    ? "bg-primary border-primary text-primary-foreground" :
                            active  ? "bg-primary border-primary text-primary-foreground scale-110 shadow-md shadow-primary/30" :
                                      "bg-background border-border text-muted-foreground",
                          ].join(" ")}>
                            {done ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-xs font-bold">{i + 1}</span>}
                          </div>
                          <span className={`text-[10px] font-medium text-center leading-tight max-w-12 ${active ? "text-primary" : done ? "text-foreground" : "text-muted-foreground"}`}>
                            {step.label}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Order items */}
              <div className="bg-background rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-border">
                  <h2 className="text-sm font-semibold text-foreground">Order Items</h2>
                </div>
                <ul className="divide-y divide-border">
                  {data.orderItems.map((item, i) => (
                    <li key={i} className="flex items-center justify-between px-5 py-4 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <Package className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{item.product.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Qty: {item.quantity} × ৳{item.price}</p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-foreground shrink-0">৳{item.quantity * item.price}</p>
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between px-5 py-4 border-t border-border bg-secondary/20">
                  <span className="text-sm text-muted-foreground">Total Amount</span>
                  <span className="text-base font-bold text-foreground">৳{data.totalAmount}</span>
                </div>
              </div>

              {/* Details */}
              <div className="bg-background rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-border">
                  <h2 className="text-sm font-semibold text-foreground">Delivery Details</h2>
                </div>
                <div className="divide-y divide-border">
                  <DetailRow icon={<User className="w-4 h-4" />} label="Customer" value={data.customerName} />
                  <DetailRow icon={<Phone className="w-4 h-4" />} label="Phone" value={data.phone} />
                  <DetailRow icon={<MapPin className="w-4 h-4" />} label="Address" value={`${data.address}, ${data.city}`} />
                  <DetailRow icon={<CreditCard className="w-4 h-4" />} label="Payment" value={data.paymentMethod} />
                  {data.transactionId && (
                    <DetailRow icon={<Hash className="w-4 h-4" />} label="Transaction ID" value={data.transactionId} />
                  )}
                  <DetailRow icon={<Calendar className="w-4 h-4" />} label="Placed On" value={formatDate(data.createdAt)} />
                </div>
              </div>

              {data.notes && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl px-5 py-4">
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1">Note</p>
                  <p className="text-sm text-amber-800 dark:text-amber-300">{data.notes}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3.5">
      <span className="text-muted-foreground shrink-0">{icon}</span>
      <span className="text-sm text-muted-foreground w-28 shrink-0">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}
