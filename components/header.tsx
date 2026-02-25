"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSelector, useDispatch } from "react-redux"
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion"
import { ShoppingBag, Menu, X, Leaf, Minus, Plus, Trash2, ShoppingCart } from "lucide-react"
import type { RootState } from "@/store/store"
import { removeFromCart, updateQuantity } from "@/slices/cartSlice"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerTitle,
} from "@/components/ui/drawer"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/order", label: "Order" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [hoveredLink, setHoveredLink] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [isHiding, setIsHiding] = useState(false)
  const [cartBounce, setCartBounce] = useState(false)

  const pathname = usePathname()
  const dispatch = useDispatch()
  const cartItems = useSelector((state: RootState) => state.cart.items)
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const prevCartCount = useRef(cartCount)
  const lastScrollY = useRef(0)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, "change", (latest) => {
    const delta = latest - lastScrollY.current
    setScrolled(latest > 20)
    if (latest > 100 && delta > 5) setIsHiding(true)
    else if (delta < -5) setIsHiding(false)
    lastScrollY.current = latest
  })

  // Shake + auto-open cart drawer when item is added
  useEffect(() => {
    if (cartCount > prevCartCount.current) {
      setCartBounce(true)
      setIsCartOpen(true)
      const t = setTimeout(() => setCartBounce(false), 600)
      return () => clearTimeout(t)
    }
    prevCartCount.current = cartCount
  }, [cartCount])

  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  const handleQty = (id: number, current: number, delta: number) => {
    const next = current + delta
    if (next < 1) dispatch(removeFromCart(id))
    else dispatch(updateQuantity({ id, quantity: next }))
  }

  return (
    <>
      {/* ── Main Header ── */}
      <motion.header
        className="sticky top-0 z-50 w-full"
        animate={{ y: isHiding ? "-100%" : 0 }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      >
        <div
          className={[
            "transition-all duration-500 w-full",
            scrolled
              ? "bg-background/90 backdrop-blur-xl shadow-[0_1px_28px_rgba(0,0,0,0.08)] border-b border-border"
              : "bg-transparent border-b border-transparent",
          ].join(" ")}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="flex items-center justify-between"
              animate={{ height: scrolled ? 56 : 72 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              {/* ── Logo ── */}
              <motion.div
                initial={{ opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <Link href="/" className="flex items-center gap-2.5">
                  <motion.div
                    whileHover={{ rotate: 18, scale: 1.12 }}
                    transition={{ type: "spring", stiffness: 280, damping: 14 }}
                    className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-sm shrink-0"
                  >
                    <Leaf className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
                  </motion.div>
                  <div className="flex flex-col leading-none">
                    <span className="text-[15px] font-bold tracking-tight text-foreground">Pure Botanics</span>
                    <span className="text-[10px] tracking-widest uppercase text-muted-foreground mt-0.5">Organic Beauty</span>
                  </div>
                </Link>
              </motion.div>

              {/* ── Desktop Nav ── */}
              <nav
                className="hidden md:flex items-center gap-0.5"
                onMouseLeave={() => setHoveredLink(null)}
              >
                {navLinks.map((link, i) => {
                  const isActive = pathname === link.href
                  return (
                    <motion.div
                      key={link.href}
                      className="relative"
                      onMouseEnter={() => setHoveredLink(link.href)}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07, duration: 0.4, ease: "easeOut" }}
                    >
                      {hoveredLink === link.href && (
                        <motion.div
                          layoutId="nav-pill"
                          className="absolute inset-0 rounded-lg bg-foreground/6"
                          initial={false}
                          transition={{ type: "spring", stiffness: 400, damping: 32 }}
                        />
                      )}
                      <Link
                        href={link.href}
                        className={[
                          "relative z-10 px-4 py-2 text-sm block transition-colors duration-150",
                          isActive ? "text-primary font-semibold" : "font-medium text-foreground/60 hover:text-foreground",
                        ].join(" ")}
                      >
                        {link.label}
                      </Link>
                      {isActive && (
                        <motion.div
                          layoutId="active-underline"
                          className="absolute bottom-0 left-3 right-3 h-[2.5px] rounded-full bg-linear-to-r from-primary/40 via-primary to-primary/40"
                          initial={false}
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                    </motion.div>
                  )
                })}
              </nav>

              {/* ── Actions ── */}
              <motion.div
                className="flex items-center gap-0.5"
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                {/* Cart button — opens cart drawer */}
                <motion.button
                  onClick={() => setIsCartOpen(true)}
                  animate={cartBounce ? { rotate: [0, -14, 14, -10, 10, -5, 5, 0] } : { rotate: 0 }}
                  transition={{ duration: 0.55, ease: "easeInOut" }}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  className="relative p-2.5 rounded-xl hover:bg-foreground/6 transition-colors"
                  aria-label="Open cart"
                >
                  <ShoppingBag className="h-5 w-5" />
                  <AnimatePresence mode="popLayout">
                    {cartCount > 0 && (
                      <motion.span
                        key={cartCount}
                        initial={{ scale: 0, y: 4 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0, y: -4 }}
                        transition={{ type: "spring", stiffness: 600, damping: 22 }}
                        className="absolute -top-0.5 -right-0.5 h-4.5 min-w-4.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center px-1 shadow-sm"
                      >
                        {cartCount > 9 ? "9+" : cartCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>

                {/* Mobile hamburger */}
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  className="md:hidden p-2.5 rounded-xl hover:bg-foreground/6 transition-colors"
                  onClick={() => setIsMenuOpen((v) => !v)}
                  aria-label="Toggle menu"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={isMenuOpen ? "x" : "menu"}
                      initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                      animate={{ rotate: 0, opacity: 1, scale: 1 }}
                      exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.18, ease: "easeInOut" }}
                    >
                      {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </motion.div>
                  </AnimatePresence>
                </motion.button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* ── Cart Drawer ── */}
      <Drawer open={isCartOpen} onOpenChange={setIsCartOpen} direction="right">
        <DrawerContent className="flex flex-col p-0 w-85! sm:w-100!">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              <DrawerTitle className="text-base font-semibold">Your Cart</DrawerTitle>
              {cartCount > 0 && (
                <span className="h-5 min-w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center px-1">
                  {cartCount}
                </span>
              )}
            </div>
            <DrawerClose asChild>
              <button className="p-1.5 rounded-lg hover:bg-muted transition-colors" aria-label="Close cart">
                <X className="w-4 h-4" />
              </button>
            </DrawerClose>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto">
            {cartItems.length === 0 ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center h-full gap-4 py-16 px-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Your cart is empty</p>
                  <p className="text-sm text-muted-foreground mt-1">Add some products to get started</p>
                </div>
                <DrawerClose asChild>
                  <Link
                    href="/products"
                    className="mt-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Shop Now
                  </Link>
                </DrawerClose>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {cartItems.map((item) => (
                  <li key={item.id} className="flex gap-3 px-5 py-4">
                    {/* Product image */}
                    <div className="w-16 h-16 rounded-xl bg-muted overflow-hidden shrink-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Info + controls */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">৳{item.price} each</p>

                      <div className="flex items-center justify-between mt-2">
                        {/* Qty controls */}
                        <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
                          <button
                            onClick={() => handleQty(item.id, item.quantity, -1)}
                            className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-background transition-colors"
                            aria-label="Decrease"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => handleQty(item.id, item.quantity, 1)}
                            className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-background transition-colors"
                            aria-label="Increase"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-primary">
                            ৳{(item.price * item.quantity).toFixed(0)}
                          </span>
                          <button
                            onClick={() => dispatch(removeFromCart(item.id))}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer — only when cart has items */}
          {cartItems.length > 0 && (
            <DrawerFooter className="border-t border-border gap-3 pt-4">
              {/* Totals */}
              <div className="flex items-center justify-between text-sm px-1">
                <span className="text-muted-foreground">
                  {cartCount} {cartCount === 1 ? "item" : "items"}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Total</span>
                  <span className="text-lg font-bold text-foreground ml-1">৳{cartTotal.toFixed(0)}</span>
                </div>
              </div>

              {/* Checkout */}
              <DrawerClose asChild>
                <Link
                  href="/order"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  Checkout · ৳{cartTotal.toFixed(0)}
                </Link>
              </DrawerClose>

              {/* Continue shopping */}
              <DrawerClose asChild>
                <button className="text-sm text-muted-foreground hover:text-foreground transition-colors py-1">
                  Continue shopping
                </button>
              </DrawerClose>
            </DrawerFooter>
          )}
        </DrawerContent>
      </Drawer>

      {/* ── Mobile Nav Drawer ── */}
      <Drawer open={isMenuOpen} onOpenChange={setIsMenuOpen} direction="right">
        <DrawerContent className="flex flex-col p-0">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
            <Link href="/" className="flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
              <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
                <Leaf className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <span className="font-bold text-sm tracking-tight">Pure Botanics</span>
            </Link>
            <DrawerClose asChild>
              <button className="p-1.5 rounded-lg hover:bg-muted transition-colors" aria-label="Close menu">
                <X className="w-4 h-4" />
              </button>
            </DrawerClose>
          </div>

          <nav className="flex flex-col gap-1 p-4 flex-1 overflow-y-auto">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={[
                    "relative flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors overflow-hidden",
                    isActive ? "text-primary bg-primary/8" : "text-foreground hover:bg-muted",
                  ].join(" ")}
                >
                  {isActive && (
                    <motion.span
                      layoutId="drawer-bar"
                      className="absolute left-0 top-2 bottom-2 w-0.75 rounded-full bg-primary"
                    />
                  )}
                  <span className={isActive ? "pl-3" : ""}>{link.label}</span>
                </Link>
              )
            })}
          </nav>

          <DrawerFooter className="border-t border-border pt-4">
            <DrawerClose asChild>
              <button
                onClick={() => { setIsMenuOpen(false); setIsCartOpen(true) }}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                View Cart
                {cartCount > 0 && (
                  <span className="bg-white/20 text-white text-xs font-bold rounded-full px-2 py-0.5">
                    {cartCount}
                  </span>
                )}
              </button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}
