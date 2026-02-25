"use client"

import type React from "react"
import { useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { RootState, AppDispatch } from "@/store/store"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Footer } from "@/components/footer"
import { Minus, Plus, X, Loader2, AlertCircle, ShoppingBag, Truck } from "lucide-react"
import { removeFromCart, updateQuantity } from "@/slices/cartSlice"
import { useCreateOrderMutation } from "@/api/orderApi"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

// ─── Animation helpers ─────────────────────────────────────────────────────────

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.4, ease: "easeOut" as const },
})

const errorVariants = {
  hidden: { opacity: 0, height: 0, marginTop: 0 },
  visible: { opacity: 1, height: "auto", marginTop: 4, transition: { duration: 0.2 } },
  exit:   { opacity: 0, height: 0, marginTop: 0, transition: { duration: 0.15 } },
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function OrderPage() {
  const [createOrder, { isLoading }] = useCreateOrderMutation()
  const dispatch = useDispatch<AppDispatch>()
  const cartItems = useSelector((state: RootState) => state.cart.items)

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
    paymentMethod: "COD",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [shake, setShake]   = useState(false)

  // ─── Validation ──────────────────────────────────────────────────────────────

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "firstName":
      case "lastName":
        if (!value.trim()) return "This field is required"
        if (!/^[a-zA-Z\s]+$/.test(value)) return "Only letters are allowed"
        return ""
      case "email":
        if (!value.trim()) return "Email is required"
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Enter a valid email address"
        return ""
      case "phone":
        if (!value.trim()) return "Phone number is required"
        if (!/^[+\d][\d\s\-(). ]{5,}$/.test(value)) return "Enter a valid phone number"
        return ""
      case "address":
        if (!value.trim()) return "Address is required"
        if (value.trim().length < 5) return "Address must be at least 5 characters"
        return ""
      case "city":
        if (!value.trim()) return "City is required"
        if (!/^[a-zA-Z\s]+$/.test(value)) return "Only letters are allowed"
        return ""
      default:
        return ""
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (submitted) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }))
    }
  }

  // ─── Cart handlers ────────────────────────────────────────────────────────────

  const handleUpdateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) {
      dispatch(removeFromCart(id))
    } else {
      dispatch(updateQuantity({ id, quantity: newQuantity }))
    }
  }

  const handleRemoveItem = (id: number) => {
    dispatch(removeFromCart(id))
  }

  // ─── Totals ───────────────────────────────────────────────────────────────────

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping  = cartItems.length === 0 ? 0 : subtotal > 50 ? 0 : 8
  const total     = subtotal + shipping

  // ─── Submit ───────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)

    const required = ["firstName", "lastName", "email", "phone", "address", "city"]
    const newErrors: Record<string, string> = {}
    required.forEach((field) => {
      const err = validateField(field, formData[field as keyof typeof formData] as string)
      if (err) newErrors[field] = err
    })
    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      setShake(true)
      setTimeout(() => setShake(false), 600)
      return
    }

    const payload = {
      orderItems: cartItems.map((item) => ({
        product: item.id,
        quantity: item.quantity,
      })),
      paymentMethod: formData.paymentMethod,
      transactionId: null,
      phone: formData.phone,
      city: formData.city,
      address: formData.address,
      status: 2,
      notes: formData.notes || null,
      customerName: `${formData.firstName} ${formData.lastName}`.trim(),
    }

    try {
      const res = await createOrder(payload).unwrap()
      console.log("ORDER SUCCESS ✅", res)
      toast.success("Order placed!", {
        description: "We'll reach out shortly to confirm your delivery.",
      })
    } catch (error) {
      console.error("ORDER FAILED ❌", error)
      toast.error("Failed to place order", {
        description: "Something went wrong. Please try again.",
      })
    }
  }

  // ─── Helper: input border state ───────────────────────────────────────────────

  const fieldClass = (name: string) => {
    if (!submitted) return ""
    return errors[name]
      ? "border-destructive focus-visible:ring-destructive/20"
      : "border-green-500/60 focus-visible:ring-green-500/20"
  }

  // ─── Error message block ──────────────────────────────────────────────────────

  const ErrorMsg = ({ name }: { name: string }) => (
    <AnimatePresence>
      {submitted && errors[name] && (
        <motion.p
          key={name + "-error"}
          variants={errorVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="flex items-center gap-1 text-xs text-destructive overflow-hidden"
        >
          <AlertCircle className="h-3 w-3 shrink-0" />
          {errors[name]}
        </motion.p>
      )}
    </AnimatePresence>
  )

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-6xl mx-auto">

          {/* Page Header */}
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <p className="text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-3">Checkout</p>
            <h1 className="text-3xl md:text-4xl font-light text-foreground">Complete Your Order</h1>
            <div className="w-12 h-px bg-border mx-auto mt-5" />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10 items-start">

            {/* ── Left: Form ─────────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: -28 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <motion.form
                onSubmit={handleSubmit}
                animate={shake ? { x: [0, -10, 10, -8, 8, -4, 4, 0] } : { x: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-10"
              >

                {/* Section 1 — Personal Information */}
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold">1</span>
                    <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground">Personal Information</h2>
                  </div>

                  <div className="space-y-5">
                    {/* First / Last Name */}
                    <div className="grid grid-cols-2 gap-4">
                      <motion.div {...fadeUp(0)}>
                        <Label htmlFor="firstName" className="text-xs tracking-wide uppercase text-muted-foreground mb-2 block">
                          First Name
                        </Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                
                          placeholder="Jane"
                          className={fieldClass("firstName")}
                        />
                        <ErrorMsg name="firstName" />
                      </motion.div>

                      <motion.div {...fadeUp(0.07)}>
                        <Label htmlFor="lastName" className="text-xs tracking-wide uppercase text-muted-foreground mb-2 block">
                          Last Name
                        </Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                
                          placeholder="Doe"
                          className={fieldClass("lastName")}
                        />
                        <ErrorMsg name="lastName" />
                      </motion.div>
                    </div>

                    {/* Email */}
                    <motion.div {...fadeUp(0.14)}>
                      <Label htmlFor="email" className="text-xs tracking-wide uppercase text-muted-foreground mb-2 block">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
              
                        placeholder="jane@example.com"
                        className={fieldClass("email")}
                      />
                      <ErrorMsg name="email" />
                    </motion.div>

                    {/* Phone */}
                    <motion.div {...fadeUp(0.21)}>
                      <Label htmlFor="phone" className="text-xs tracking-wide uppercase text-muted-foreground mb-2 block">
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
              
                        placeholder="+1 (555) 000-0000"
                        className={fieldClass("phone")}
                      />
                      <ErrorMsg name="phone" />
                    </motion.div>
                  </div>
                </section>

                <div className="border-t border-border" />

                {/* Section 2 — Shipping Address */}
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold">2</span>
                    <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground">Shipping Address</h2>
                  </div>

                  <div className="space-y-5">
                    {/* Street Address */}
                    <motion.div {...fadeUp(0.28)}>
                      <Label htmlFor="address" className="text-xs tracking-wide uppercase text-muted-foreground mb-2 block">
                        Street Address
                      </Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
              
                        placeholder="123 Botanical Lane"
                        className={fieldClass("address")}
                      />
                      <ErrorMsg name="address" />
                    </motion.div>

                    {/* City */}
                    <motion.div {...fadeUp(0.35)}>
                      <Label htmlFor="city" className="text-xs tracking-wide uppercase text-muted-foreground mb-2 block">
                        City
                      </Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
              
                        placeholder="New York"
                        className={fieldClass("city")}
                      />
                      <ErrorMsg name="city" />
                    </motion.div>

                    {/* Notes */}
                    <motion.div {...fadeUp(0.42)}>
                      <Label htmlFor="notes" className="text-xs tracking-wide uppercase text-muted-foreground mb-2 block">
                        Order Notes{" "}
                        <span className="normal-case font-normal text-muted-foreground/60">(optional)</span>
                      </Label>
                      <Textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
              
                        placeholder="Special delivery instructions or requests…"
                        rows={3}
                        className="resize-none"
                      />
                    </motion.div>
                  </div>
                </section>

                {/* Submit */}
                <motion.div {...fadeUp(0.49)}>
                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}>
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full h-12 text-sm tracking-[0.15em] uppercase"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Placing Order…
                        </span>
                      ) : (
                        "Place Order"
                      )}
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.form>
            </motion.div>

            {/* ── Right: Order Summary ────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="lg:sticky lg:top-24"
            >
              <div className="border border-border rounded-xl overflow-hidden bg-card">

                {/* Header */}
                <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border">
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground">
                    Order Summary
                  </h2>
                  {cartItems.length > 0 && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      {cartItems.length} item{cartItems.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {/* Cart Items */}
                <div className="p-5">
                  <AnimatePresence initial={false} mode="wait">
                    {cartItems.length === 0 ? (
                      <motion.p
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="py-10 text-center text-sm text-muted-foreground"
                      >
                        Your cart is empty.
                      </motion.p>
                    ) : (
                      <motion.div key="items" className="space-y-3">
                        <AnimatePresence>
                          {cartItems.map((item) => (
                            <motion.div
                              key={item.id}
                              layout
                              initial={{ opacity: 0, y: -8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, height: 0, marginBottom: 0, transition: { duration: 0.2 } }}
                              transition={{ duration: 0.25 }}
                              className="overflow-hidden"
                            >
                              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                <img
                                  src={item.image || "/placeholder.svg"}
                                  alt={item.name}
                                  className="w-14 h-14 object-cover rounded-md shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-sm font-medium text-foreground truncate">{item.name}</h3>
                                  <p className="text-xs text-muted-foreground mt-0.5">${item.price.toFixed(2)} each</p>
                                </div>

                                {/* Quantity controls */}
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <motion.button
                                    type="button"
                                    whileTap={{ scale: 0.85 }}
                                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                    className="w-6 h-6 rounded-full border border-border flex items-center justify-center hover:bg-accent transition-colors"
                                  >
                                    <Minus className="h-3 w-3" />
                                  </motion.button>
                                  <span className="w-5 text-center text-sm font-medium">{item.quantity}</span>
                                  <motion.button
                                    type="button"
                                    whileTap={{ scale: 0.85 }}
                                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                    className="w-6 h-6 rounded-full border border-border flex items-center justify-center hover:bg-accent transition-colors"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </motion.button>
                                </div>

                                {/* Remove */}
                                <motion.button
                                  type="button"
                                  whileTap={{ scale: 0.85 }}
                                  onClick={() => handleRemoveItem(item.id)}
                                  className="w-6 h-6 ml-1 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                >
                                  <X className="h-3 w-3" />
                                </motion.button>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>

                        {/* Totals */}
                        <motion.div layout className="pt-4 mt-1 border-t border-border space-y-2.5">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span className="font-medium">${subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Shipping</span>
                            <span className={`font-medium ${shipping === 0 ? "text-green-600 dark:text-green-400" : ""}`}>
                              {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                            </span>
                          </div>

                          {/* Free shipping nudge */}
                          <AnimatePresence>
                            {subtotal > 0 && subtotal <= 50 && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 rounded-md px-2.5 py-1.5">
                                  <Truck className="h-3 w-3 shrink-0" />
                                  Add ${(50 - subtotal).toFixed(2)} more for free shipping
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <div className="flex justify-between text-base font-semibold pt-2 border-t border-border">
                            <span>Total</span>
                            <span>${total.toFixed(2)}</span>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Payment info */}
                <div className="px-5 pb-5">
                  <div className="bg-muted/40 border border-border/50 rounded-lg p-4">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      <strong className="text-foreground/80">Cash on Delivery —</strong> We'll reach out after
                      submission to confirm delivery details and arrange payment.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
