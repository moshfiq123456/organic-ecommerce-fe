"use client"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { useSelector, useDispatch } from "react-redux"
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion"
import { ShoppingBag, Menu, X, Leaf, Minus, Plus, Trash2, ShoppingCart, Search, User, Heart, ChevronDown } from "lucide-react"
import type { RootState } from "@/store/store"
import { useRemoveFromCart } from "@/hooks/useRemoveFromCart"
import { useUpdateCartQuantity } from "@/hooks/useUpdateCartQuantity"
import { useGetProductsQuery, getImageUrl } from "@/api/productsApi"
import { useGetMainMenuQuery } from "@/api/mainMenuApi"
import { useGetWishlistQuery } from "@/api/wishlistApi"
import { useGetSubCategoriesQuery } from "@/api/categories"
import { useRouter } from "next/navigation"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerTitle,
} from "@/components/ui/drawer"
import { useSubdomain } from "@/context/SubdomainContext"

function NavSearch({ isTransparent }: { isTransparent: boolean }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => setDebouncedQuery(query), 400)
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current) }
  }, [query])

  const { data, isFetching } = useGetProductsQuery(
    { page: 1, limit: 6, q: debouncedQuery || undefined },
    { skip: debouncedQuery.trim().length < 1 }
  )

  const results = data?.docs ?? []

  // Focus input when overlay opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
    else { setQuery(""); setDebouncedQuery("") }
  }, [open])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false) }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [])

  const handleSelect = (id: number) => {
    router.push(`/products/${id}`)
    setOpen(false)
  }

  return (
    <>
      {/* Search icon button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen(true)}
        className={`p-2.5 rounded-xl transition-colors ${isTransparent ? "text-white hover:bg-white/10" : "hover:bg-foreground/6"}`}
        aria-label="Search"
      >
        <Search className="h-5 w-5" />
      </motion.button>

      {/* Portal — renders at body level so backdrop covers full screen */}
      {typeof window !== "undefined" && createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-md flex items-start justify-center pt-24 px-4"
              onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-2xl bg-background rounded-2xl shadow-2xl border border-border overflow-hidden"
              >
                {/* Search input */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
                  <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search products..."
                    className="flex-1 bg-transparent text-foreground text-sm outline-none placeholder:text-muted-foreground"
                  />
                  <button
                    onClick={() => setOpen(false)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Results */}
                <div className="max-h-105 overflow-y-auto p-3">
                  {debouncedQuery.trim().length < 1 ? (
                    <p className="text-muted-foreground text-sm text-center py-10">Type to search products...</p>
                  ) : isFetching ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl">
                          <div className="w-12 h-12 rounded-lg bg-muted animate-pulse shrink-0" />
                          <div className="flex-1 space-y-2">
                            <div className="h-3 bg-muted animate-pulse rounded-full w-3/4" />
                            <div className="h-3 bg-muted animate-pulse rounded-full w-1/3" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : results.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                        <Search className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-foreground">No products found</p>
                        <p className="text-xs text-muted-foreground mt-1">No results for <span className="font-semibold">"{debouncedQuery}"</span></p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {results.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => handleSelect(product.id)}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors text-left border border-transparent hover:border-border"
                        >
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-secondary/40 shrink-0">
                            <img
                              src={getImageUrl(product.image?.thumbnailURL || product.image?.url)}
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-foreground font-medium text-sm truncate">{product.title}</p>
                            <p className="text-muted-foreground text-xs mt-0.5">৳{product.price}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}

const SUBDOMAIN_BRAND: Record<string, { name: string; logo: string; fontClass: string; color: string; wordmark?: boolean }> = {
  "just-healthy": {
    name: "Just Healthy",
    logo: "/just-healthy-logo.png",
    fontClass: "font-(family-name:--font-lora)",
    color: "#2D5A27",
    // Logo image already contains the brand name — show it alone, no text.
    wordmark: true,
  },
  "la-luminosite": {
    name: "La Luminosité",
    logo: "/la-luminosite-logo.png",
    fontClass: "font-(family-name:--font-cormorant)",
    color: "#7B4F2E",
    // Logo image already contains the brand name — show it alone, no text.
    wordmark: true,
  },
}

const DEFAULT_BRAND = SUBDOMAIN_BRAND["la-luminosite"]

const TITLE_TO_HREF: Record<string, string> = {
  home: "/",
  products: "/products",
  order: "/order",
  "track order": "/order/track",
  about: "/about",
  "about us": "/about",
  support: "/support",
  contact: "/contact",
}

interface NavLink { href: string; label: string }

const FALLBACK_NAV: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/order", label: "Order" },
  { href: "/order/track", label: "Track Order" },
  { href: "/about", label: "About Us" },
  { href: "/support", label: "Support" },
  { href: "/contact", label: "Contact" },
]

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [hoveredLink, setHoveredLink] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [cartBounce, setCartBounce] = useState(false)
  const [expandedMobileLinks, setExpandedMobileLinks] = useState<Set<string>>(new Set())
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const slug = useSubdomain()

  const { data: mainMenuData } = useGetMainMenuQuery(slug, { skip: !slug })
  // Only this brand's sub categories.
  const { data: subCategoriesData } = useGetSubCategoriesQuery(
    { categoryCode: slug, limit: 100 },
    { skip: !slug }
  )

  // Products shown inside the Products mega-menu — only fetched once the user
  // hovers a specific sub category, since that column is hidden until then.
  const [hoveredSubCat, setHoveredSubCat] = useState<number | null>(null)
  const { data: navProductsData, isFetching: navProductsLoading } = useGetProductsQuery(
    {
      limit: 4,
      categoryCode: slug,
      subcategoryIds: hoveredSubCat ? [hoveredSubCat] : undefined,
    },
    { skip: !slug || !hoveredSubCat }
  )
  const navProducts = navProductsData?.docs ?? []

  const menuDoc = mainMenuData?.docs?.[0]
  const navLinks: NavLink[] = menuDoc?.items?.length
    ? menuDoc.items.map((item: { id: string; title: string }) => ({
        href: TITLE_TO_HREF[item.title.toLowerCase()] ?? `/${item.title.toLowerCase().replace(/\s+/g, "-")}`,
        label: item.title,
      }))
    : FALLBACK_NAV
  const logoUrl = menuDoc?.logo?.url ?? null
  const subdomainBrand = SUBDOMAIN_BRAND[slug] ?? DEFAULT_BRAND
  const brandName = menuDoc?.subDomain?.title ?? subdomainBrand.name

  const pathname = usePathname()
  const searchParams = useSearchParams()
  // Currently-selected subcategory (from /products?subcategoryId=…), used to
  // mark the matching nav item active. Query params aren't in `pathname`.
  const activeSubcategoryId = searchParams.get("subcategoryId")
  // When the drawer opens on a subcategory page, expand Products so the
  // selected subcategory is visible without an extra tap.
  useEffect(() => {
    if (isMenuOpen && activeSubcategoryId) {
      setExpandedMobileLinks((prev) => (prev.has("/products") ? prev : new Set(prev).add("/products")))
    }
  }, [isMenuOpen, activeSubcategoryId])
  const dispatch = useDispatch()
  const authUser = useSelector((state: RootState) => state.auth.user)
  const { data: wishlistItems } = useGetWishlistQuery(undefined, { skip: !authUser })
  const wishlistCount = authUser ? (wishlistItems?.length ?? 0) : 0
  const cartItems = useSelector((state: RootState) => state.cart.items)
  const addSeq = useSelector((state: RootState) => state.cart.addSeq ?? 0)
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 20)
  })

  // Shake + auto-open the cart drawer only when the user actually adds an item.
  // `addSeq` bumps on an explicit add, never on cart hydration after login, so
  // signing in no longer pops the drawer open.
  const prevAddSeq = useRef(addSeq)
  useEffect(() => {
    const added = addSeq > prevAddSeq.current
    prevAddSeq.current = addSeq

    const isOnOrderPage = pathname === "/order" || pathname.startsWith("/order/")
    if (!added || isOnOrderPage) return

    setCartBounce(true)
    setIsCartOpen(true)
    const t = setTimeout(() => setCartBounce(false), 600)
    return () => clearTimeout(t)
  }, [addSeq, pathname])

  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  const handleRemoveFromCart = useRemoveFromCart()
  const handleUpdateCartQuantity = useUpdateCartQuantity()

  const handleQty = (id: number, current: number, delta: number) => {
    const next = current + delta
    if (next < 1) handleRemoveFromCart(id)
    else handleUpdateCartQuantity(id, next)
  }

  // Transparent only on home page when at top
  const isHome = pathname === "/"
  const isTransparent = isHome && !scrolled

  return (
    <>
      {/* ── Main Header ── */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 w-full pointer-events-none"
        animate={{ paddingTop: scrolled ? 12 : 0, paddingLeft: scrolled ? 16 : 0, paddingRight: scrolled ? 16 : 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      >
        <motion.div
          className={[
            "pointer-events-auto transition-colors duration-500 w-full",
            isTransparent
              ? "bg-transparent border-b border-white/10"
              : scrolled
                ? "bg-background/90 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-border"
                : "bg-background/90 backdrop-blur-xl shadow-[0_1px_28px_rgba(0,0,0,0.08)] border-b border-border",
          ].join(" ")}
          animate={{ borderRadius: scrolled ? 16 : 0 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="flex items-center justify-between"
              animate={{ height: scrolled ? 64 : 84 }}
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
                    whileHover={{ scale: 1.08 }}
                    transition={{ type: "spring", stiffness: 280, damping: 14 }}
                    className="shrink-0"
                  >
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt={brandName}
                        className={`w-auto object-contain rounded-xl ${subdomainBrand.wordmark ? "h-[4.5rem] md:h-20" : "h-9"}`}
                      />
                    ) : (
                      <img
                        src={subdomainBrand.logo}
                        alt={brandName}
                        className={`w-auto object-contain transition-all duration-500 ${
                          subdomainBrand.wordmark
                            ? `h-[4.5rem] md:h-20 ${isTransparent ? "brightness-0 invert" : ""}`
                            : `h-12 ${isTransparent ? "brightness-0 invert" : "mix-blend-multiply dark:mix-blend-screen dark:invert"}`
                        }`}
                      />
                    )}
                  </motion.div>
                  {!subdomainBrand.wordmark && (
                    <div className="flex flex-col leading-none">
                      <span
                        className={`${subdomainBrand.fontClass} text-[22px] font-semibold tracking-wide transition-colors duration-500 ${isTransparent ? "text-white" : ""}`}
                        style={!isTransparent ? { color: subdomainBrand.color } : undefined}
                      >
                        {brandName}
                      </span>
                    </div>
                  )}
                </Link>
              </motion.div>

              {/* ── Desktop Nav ── */}
              <nav
                className="hidden md:flex items-center gap-0.5"
              >
                {navLinks.map((link, i) => {
                  const isActive = pathname === link.href
                  const isProductsLink = link.label === "Products"
                  const subCategories = subCategoriesData?.docs || []

                  return (
                    <motion.div
                      key={link.href}
                      className="relative group"
                      onMouseEnter={() => {
                        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
                        setHoveredLink(link.href)
                      }}
                      onMouseLeave={() => {
                        hoverTimeoutRef.current = setTimeout(() => {
                          setHoveredLink(null)
                          setHoveredSubCat(null)
                        }, 250)
                      }}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07, duration: 0.4, ease: "easeOut" }}
                    >
                      {hoveredLink === link.href && (
                        <motion.div
                          layoutId="nav-pill"
                          className={`absolute inset-0 rounded-lg ${isTransparent ? "bg-white/10" : "bg-foreground/6"}`}
                          initial={false}
                          transition={{ type: "spring", stiffness: 400, damping: 32 }}
                        />
                      )}

                      {/* Hover zone extender for dropdown */}
                      {isProductsLink && hoveredLink === link.href && (
                        <div className="absolute top-full left-0 right-0 h-80 pointer-events-auto" />
                      )}
                      <Link
                        href={link.href}
                        className={[
                          "relative z-10 px-4 py-2 text-sm block transition-colors duration-150",
                          isTransparent
                            ? isActive ? "text-white font-semibold" : "font-medium text-white/70 hover:text-white"
                            : isActive ? "text-primary font-semibold" : "font-medium text-foreground/60 hover:text-foreground",
                        ].join(" ")}
                      >
                        {link.label}
                      </Link>

                      {/* Products Dropdown */}
                      {isProductsLink && hoveredLink === link.href && subCategories.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{
                            duration: 0.2,
                            ease: "easeOut",
                            layout: { type: "spring", stiffness: 420, damping: 38 },
                          }}
                          layout
                          className={`absolute top-full left-0 -translate-x-12 mt-0 pt-4 rounded-xl shadow-2xl z-50 max-w-[calc(100vw-2rem)] ${
                            hoveredSubCat ? "w-[30rem] sm:w-[28rem] md:w-[34rem]" : "w-[17rem]"
                          }`}
                          onMouseEnter={() => {
                            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
                          }}
                          onMouseLeave={() => {
                            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
                          }}
                        >
                          <div className={`${isTransparent ? "bg-gray-900/95 backdrop-blur" : "bg-background/95 backdrop-blur"} border ${isTransparent ? "border-white/10" : "border-border"} rounded-xl p-4 sm:p-6`}>
                            <div className={`grid gap-5 sm:gap-8 ${hoveredSubCat ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
                              {/* Sub categories first */}
                              <div>
                                <p className={`text-xs font-semibold tracking-widest mb-3 sm:mb-4 ${isTransparent ? "text-white/40" : "text-foreground/40"}`}>
                                  OUR RANGE
                                </p>
                                <div className="space-y-1">
                                  {subCategories.map((subCategory: any, idx: number) => (
                                    <motion.div
                                      key={subCategory.id}
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: idx * 0.04 }}
                                    >
                                      <Link
                                        href={`/products?subcategoryId=${subCategory.id}`}
                                        onMouseEnter={() => setHoveredSubCat(subCategory.id)}
                                        className={`block px-2 sm:px-3 py-2 rounded-lg transition-all duration-200 group ${
                                          hoveredSubCat === subCategory.id
                                            ? isTransparent
                                              ? "text-white bg-white/10"
                                              : "text-foreground bg-foreground/6"
                                            : isTransparent
                                              ? "text-white/80 hover:text-white hover:bg-white/10"
                                              : "text-foreground/80 hover:text-foreground hover:bg-foreground/6"
                                        }`}
                                      >
                                        <p className="text-sm font-medium">{subCategory.title}</p>
                                        <p className={`text-xs ${isTransparent ? "text-white/40 group-hover:text-white/60" : "text-foreground/40 group-hover:text-foreground/60"}`}>
                                          Explore collection
                                        </p>
                                      </Link>
                                    </motion.div>
                                  ))}
                                </div>
                              </div>

                              {/* Products — only once a sub category is hovered */}
                              {hoveredSubCat && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.22, delay: 0.06 }}
                                className="min-h-[16rem]"
                              >
                                <p className={`text-xs font-semibold tracking-widest mb-3 sm:mb-4 truncate ${isTransparent ? "text-white/40" : "text-foreground/40"}`}>
                                  {subCategories.find((s: any) => s.id === hoveredSubCat)?.title?.toUpperCase() || "PRODUCTS"}
                                </p>

                                {navProductsLoading ? (
                                  <div className="space-y-1">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                      <div key={i} className="flex items-center gap-3 px-2 py-1.5">
                                        <div className={`w-10 h-10 rounded-lg animate-pulse shrink-0 ${isTransparent ? "bg-white/10" : "bg-muted"}`} />
                                        <div className="flex-1 space-y-1.5">
                                          <div className={`h-3.5 rounded-full animate-pulse w-3/4 ${isTransparent ? "bg-white/10" : "bg-muted"}`} />
                                          <div className={`h-3 rounded-full animate-pulse w-1/4 ${isTransparent ? "bg-white/10" : "bg-muted"}`} />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : navProducts.length === 0 ? (
                                  <p className={`text-xs px-2 py-3 ${isTransparent ? "text-white/40" : "text-foreground/40"}`}>
                                    No products in this collection yet.
                                  </p>
                                ) : (
                                  <div className="space-y-1">
                                    {navProducts.map((product: any) => (
                                      <div key={product.id}>
                                        <Link
                                          href={`/products/${product.id}`}
                                          className={`flex items-center gap-3 px-2 py-1.5 rounded-lg transition-all duration-200 group ${
                                            isTransparent
                                              ? "text-white/80 hover:text-white hover:bg-white/10"
                                              : "text-foreground/80 hover:text-foreground hover:bg-foreground/6"
                                          }`}
                                        >
                                          <span className={`w-10 h-10 rounded-lg overflow-hidden shrink-0 ${isTransparent ? "bg-white/10" : "bg-secondary/40"}`}>
                                            <img
                                              src={getImageUrl(product.image?.thumbnailURL || product.image?.url || product.images?.[0]?.image?.url)}
                                              alt={product.title}
                                              className="w-full h-full object-cover"
                                            />
                                          </span>
                                          <span className="min-w-0 flex-1">
                                            <span className="block text-sm font-medium truncate">{product.title}</span>
                                            <span className={`block text-xs ${isTransparent ? "text-white/40" : "text-foreground/40"}`}>
                                              ৳{product.onSale && product.salePrice ? product.salePrice : product.price}
                                            </span>
                                          </span>
                                        </Link>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                <Link
                                  href={`/products?subcategoryId=${hoveredSubCat}`}
                                  className={`inline-flex items-center gap-1 mt-3 px-2 text-xs font-medium ${
                                    isTransparent ? "text-white/70 hover:text-white" : "text-primary hover:underline"
                                  }`}
                                >
                                  View all products →
                                </Link>
                              </motion.div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {isActive && (
                        <motion.div
                          layoutId="active-underline"
                          className={`absolute bottom-0 left-3 right-3 h-[2.5px] rounded-full ${isTransparent ? "bg-white/60" : "bg-linear-to-r from-primary/40 via-primary to-primary/40"}`}
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
                {/* Search */}
                <NavSearch isTransparent={isTransparent} />

                {/* Account — signed in shows an initials avatar, signed out a plain icon */}
                <Link
                  href={authUser ? "/account" : "/login"}
                  aria-label={authUser ? `My account — ${authUser.firstName} ${authUser.lastName}` : "Sign in"}
                  title={authUser ? `${authUser.firstName} ${authUser.lastName}` : "Sign in"}
                >
                  <motion.span
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    className={
                      authUser
                        ? "flex items-center justify-center p-1"
                        : `flex items-center justify-center p-2.5 rounded-xl transition-colors ${isTransparent ? "text-white hover:bg-white/10" : "hover:bg-foreground/6"}`
                    }
                  >
                    {authUser ? (
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold ring-2 transition-colors ${
                          isTransparent
                            ? "bg-white text-gray-900 ring-white/30"
                            : "bg-primary text-primary-foreground ring-primary/20"
                        }`}
                      >
                        {`${authUser.firstName?.[0] ?? ""}${authUser.lastName?.[0] ?? ""}`.toUpperCase() || "U"}
                      </span>
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </motion.span>
                </Link>

                {/* Wishlist — links to wishlist page (or login, if signed out) */}
                <Link href={authUser ? "/wishlist" : "/login"} aria-label="Wishlist">
                  <motion.span
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    className={`relative flex items-center justify-center p-2.5 rounded-xl transition-colors ${isTransparent ? "text-white hover:bg-white/10" : "hover:bg-foreground/6"}`}
                  >
                    <Heart className="h-5 w-5" />
                    <AnimatePresence mode="popLayout">
                      {wishlistCount > 0 && (
                        <motion.span
                          key={wishlistCount}
                          initial={{ scale: 0, y: 4 }}
                          animate={{ scale: 1, y: 0 }}
                          exit={{ scale: 0, y: -4 }}
                          transition={{ type: "spring", stiffness: 600, damping: 22 }}
                          className="absolute -top-0.5 -right-0.5 h-4.5 min-w-4.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center px-1 shadow-sm"
                        >
                          {wishlistCount > 9 ? "9+" : wishlistCount}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.span>
                </Link>

                {/* Cart button — opens cart drawer */}
                <motion.button
                  onClick={() => setIsCartOpen(true)}
                  animate={cartBounce ? { rotate: [0, -14, 14, -10, 10, -5, 5, 0] } : { rotate: 0 }}
                  transition={{ duration: 0.55, ease: "easeInOut" }}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  className={`relative p-2.5 rounded-xl transition-colors ${isTransparent ? "text-white hover:bg-white/10" : "hover:bg-foreground/6"}`}
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
                  className={`md:hidden p-2.5 rounded-xl transition-colors ${isTransparent ? "text-white hover:bg-white/10" : "hover:bg-foreground/6"}`}
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
        </motion.div>
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
                            onClick={() => handleRemoveFromCart(item.id)}
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
              {logoUrl ? (
                <img src={logoUrl} alt={brandName} className="h-7 w-auto object-contain rounded-lg" />
              ) : subdomainBrand.wordmark ? (
                <img src={subdomainBrand.logo} alt={brandName} className="h-14 w-auto object-contain" />
              ) : (
                <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
                  <Leaf className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
                </div>
              )}
              {!subdomainBrand.wordmark && <span className="font-bold text-sm tracking-tight">{brandName}</span>}
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
              const isProductsLink = link.label === "Products"
              const isExpanded = expandedMobileLinks.has(link.href)

              return (
                <div key={link.href}>
                  <div className="flex items-center">
                    <Link
                      href={link.href}
                      className={[
                        "relative flex-1 flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors overflow-hidden",
                        isActive ? "text-primary bg-primary/8" : "text-foreground hover:bg-muted",
                      ].join(" ")}
                      onClick={(e) => {
                        if (isProductsLink) {
                          e.preventDefault()
                          setExpandedMobileLinks(prev => {
                            const next = new Set(prev)
                            if (next.has(link.href)) {
                              next.delete(link.href)
                            } else {
                              next.add(link.href)
                            }
                            return next
                          })
                        }
                      }}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="drawer-bar"
                          className="absolute left-0 top-2 bottom-2 w-0.75 rounded-full bg-primary"
                        />
                      )}
                      <span className={isActive ? "pl-3" : ""}>{link.label}</span>
                    </Link>
                    {isProductsLink && (
                      <button
                        onClick={() => {
                          setExpandedMobileLinks(prev => {
                            const next = new Set(prev)
                            if (next.has(link.href)) {
                              next.delete(link.href)
                            } else {
                              next.add(link.href)
                            }
                            return next
                          })
                        }}
                        className="p-2 text-foreground hover:bg-muted rounded-lg transition-colors"
                      >
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </motion.div>
                      </button>
                    )}
                  </div>

                  {/* Subcategories for Products */}
                  {isProductsLink && isExpanded && subCategoriesData?.docs && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pl-4 space-y-1 mt-1">
                        {(() => {
                          const allActive = pathname === "/products" && !activeSubcategoryId
                          return (
                            <Link
                              href="/products"
                              onClick={() => setIsMenuOpen(false)}
                              className={[
                                "flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                                allActive
                                  ? "text-primary bg-primary/10"
                                  : "text-primary/90 hover:bg-primary/10",
                              ].join(" ")}
                            >
                              All Products
                            </Link>
                          )
                        })()}
                        {subCategoriesData.docs.map((subCategory: any) => {
                          const subActive = activeSubcategoryId === String(subCategory.id)
                          return (
                            <Link
                              key={subCategory.id}
                              href={`/products?subcategoryId=${subCategory.id}`}
                              onClick={() => setIsMenuOpen(false)}
                              className={[
                                "flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors",
                                subActive
                                  ? "text-primary font-medium bg-primary/8"
                                  : "text-foreground/70 hover:text-foreground hover:bg-muted",
                              ].join(" ")}
                            >
                              {subActive && <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                              {subCategory.title}
                            </Link>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}
                </div>
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
