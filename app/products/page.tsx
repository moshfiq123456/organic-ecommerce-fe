"use client"

import { useSearchParams } from "next/navigation"
import React, { useState, useMemo, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer"
import { Search, Filter, ShoppingCart, Loader2, Eye, X, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { businesses } from "@/lib/products"
import { useSubdomain } from "@/context/SubdomainContext"
import { useDispatch } from "react-redux"
import { AppDispatch } from "@/store/store"
import { useGetProductsQuery, useGetProductByIdQuery, getImageUrl } from "@/api/productsApi"
import { addToCart } from "@/slices/cartSlice"

const MAX_PRICE = 1000

// ── Product card variants ─────────────────────────────
const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } },
  exit:    { opacity: 0, scale: 0.93, transition: { duration: 0.25 } },
}

function QuickViewModal({ productId, onClose, onAddToCart }: { productId: number; onClose: () => void; onAddToCart: (p: any) => void }) {
  const { data: product, isLoading } = useGetProductByIdQuery(productId)
  const [selectedImage, setSelectedImage] = useState(0)
  const [qty, setQty] = useState(1)

  const allImages = product
    ? (product.images ?? []).length > 0
      ? (product.images ?? []).map((i: any) => i.image)
      : [product.image]
    : []

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = "" }
  }, [onClose])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="bg-background rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative"
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          {isLoading || !product ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              {/* Gallery */}
              <div className="p-5 flex flex-col gap-3">
                <div className="aspect-square rounded-xl overflow-hidden bg-secondary/20 relative">
                  <img
                    src={getImageUrl(allImages[selectedImage]?.url)}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                  {allImages.length > 1 && (
                    <>
                      <button
                        onClick={() => setSelectedImage((i) => (i - 1 + allImages.length) % allImages.length)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setSelectedImage((i) => (i + 1) % allImages.length)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
                {allImages.length > 1 && (
                  <div className="flex gap-2 flex-wrap">
                    {allImages.map((img: any, i: number) => (
                      <button
                        key={i}
                        onClick={() => setSelectedImage(i)}
                        className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-colors shrink-0 ${i === selectedImage ? "border-primary" : "border-transparent hover:border-border"}`}
                      >
                        <img src={getImageUrl(img?.url)} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="p-5 flex flex-col gap-4 border-t md:border-t-0 md:border-l border-border">
                <div>
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {product.subCategory?.title}
                  </span>
                  <h2 className="text-xl font-semibold text-foreground mt-2 mb-1">{product.title}</h2>
                  {product.tagline && (
                    <p className="text-xs text-muted-foreground">{product.tagline.replace(/_/g, " ")}</p>
                  )}
                </div>

                {/* Price */}
                <div className="flex items-center gap-2">
                  {product.onSale && product.salePrice ? (
                    <>
                      <span className="text-2xl font-bold text-primary">৳{product.salePrice}</span>
                      <span className="text-base text-muted-foreground line-through">৳{product.price}</span>
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-semibold">
                        {product.discountType === "percentage" ? `${product.discountValue}% OFF` : `৳${product.discountValue} OFF`}
                      </span>
                    </>
                  ) : (
                    <span className="text-2xl font-bold text-primary">৳{product.price}</span>
                  )}
                </div>

                {/* Stock */}
                <span className={`text-xs w-fit px-2.5 py-1 rounded-full font-medium ${product.stockIn > 0 ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-500"}`}>
                  {product.stockIn > 0 ? `${product.stockIn} in stock` : "Out of stock"}
                </span>

                <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>

                {/* Quantity */}
                {product.stockIn > 0 && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">Qty</span>
                    <div className="flex items-center border border-border rounded-lg overflow-hidden">
                      <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors text-lg">−</button>
                      <span className="w-10 text-center text-sm font-medium">{qty}</span>
                      <button onClick={() => setQty((q) => Math.min(product.stockIn, q + 1))} className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors text-lg">+</button>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-2 mt-auto pt-2">
                  <Button
                    className="w-full gap-2"
                    disabled={product.stockIn === 0}
                    onClick={() => { onAddToCart({ ...product, quantity: qty }); onClose() }}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {product.stockIn > 0 ? "Add to Cart" : "Out of Stock"}
                  </Button>
                  <Link href={`/products/${product.id}`} onClick={onClose}>
                    <Button variant="outline" className="w-full gap-2 bg-transparent">
                      View Full Details <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function ProductCard({
  product,
  onAddToCart,
  onQuickView,
}: {
  product: ApiProduct
  onAddToCart: (p: ApiProduct) => void
  onQuickView: (id: number) => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      layout
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-secondary/20 shrink-0">
        <motion.img
          src={getImageUrl(product.image?.thumbnailURL || product.image?.url || product.images?.[0]?.image?.url)}
          alt={product.title}
          animate={{ scale: hovered ? 1.08 : 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full h-full object-cover"
        />

        {/* Hover overlay — quick view */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="absolute inset-0 bg-black/25 flex items-end justify-center pb-4"
            >
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 8, opacity: 0 }}
                transition={{ delay: 0.04, duration: 0.2 }}
              >
                <Button
                  size="sm"
                  variant="secondary"
                  className="gap-1.5 text-xs shadow-lg rounded-full px-4"
                  onClick={(e) => { e.preventDefault(); onQuickView(product.id) }}
                >
                  <Eye className="h-3.5 w-3.5" /> Quick View
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Badges */}
        {product.stockIn === 0 && (
          <span className="absolute top-2.5 right-2.5 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full">
            Out of Stock
          </span>
        )}
        {product.onSale && product.stockIn > 0 && (
          <span className="absolute top-2.5 left-2.5 bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full font-semibold">
            Sale
          </span>
        )}
        {product.preOrder && (
          <span className={`absolute text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/90 text-white ${product.onSale ? "top-8 left-2.5" : "top-2.5 left-2.5"}`}>
            Pre-order · {product.preOrderTime} {product.preOrderTimeUnit}s
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-2.5 sm:p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-1 mb-2">
          <span className="text-[10px] sm:text-xs font-medium text-primary bg-primary/10 px-1.5 sm:px-2 py-0.5 rounded-full truncate max-w-[60%]">
            {product.subCategory.title}
          </span>
          <div className="flex flex-col items-end shrink-0">
            {product.onSale && product.salePrice ? (
              <>
                <span className="text-[10px] text-muted-foreground line-through leading-none">৳{product.price}</span>
                <span className="text-xs sm:text-sm font-semibold text-primary">৳{product.salePrice}</span>
              </>
            ) : (
              <span className="text-xs sm:text-sm font-semibold text-primary">৳{product.price}</span>
            )}
          </div>
        </div>

        <h3 className="font-semibold text-foreground text-xs sm:text-sm mb-1 line-clamp-2">{product.title}</h3>
        <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed line-clamp-2 flex-1">
          {product.description || "No description available"}
        </p>

        <div className="flex items-center gap-1.5 mt-1.5">
          <span className={`text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-medium ${product.stockIn > 0 ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-500"}`}>
            {product.stockIn > 0 ? `${product.stockIn} in stock` : "Out of stock"}
          </span>
        </div>

        <div className="flex gap-1.5 sm:gap-2 mt-3">
          <Link href={`/products/${product.id}`} className="flex-1">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}>
              <Button variant="outline" size="sm" className="w-full bg-transparent text-[10px] sm:text-xs rounded-xl px-1 sm:px-3">
                Details
              </Button>
            </motion.div>
          </Link>
          <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}>
            <Button
              size="sm"
              onClick={() => onAddToCart(product)}
              className="gap-0.5 sm:gap-1 text-[10px] sm:text-xs w-full rounded-xl px-1 sm:px-3"
              disabled={product.stockIn === 0}
            >
              <ShoppingCart className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0" />
              <span className="truncate">{product.stockIn > 0 ? "Add to Cart" : "Out of Stock"}</span>
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

interface ApiProduct {
  id: number
  title: string
  slug: string
  price: number
  image: {
    url: string
    thumbnailURL: string | null
  }
  subCategory: {
    id: number
    title: string
    slug: string
    category: {
      id: number
      title: string
      slug: string
    }
  }
  description: string | null
  available: boolean
  stockIn: number
  stockOut: number
  preOrder?: boolean
  preOrderTime?: number
  preOrderTimeUnit?: string
}

interface ApiCategory {
  id: number
  title: string
  slug: string
}

export default function ProductsPage() {
  const dispatch = useDispatch<AppDispatch>()
  const searchParams = useSearchParams()

  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState<number[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, MAX_PRICE])
  const [searchQuery, setSearchQuery] = useState("")
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedBusiness, setSelectedBusiness] = useState<string | null>(null)
  const [quickViewId, setQuickViewId] = useState<number | null>(null)
  const slug = useSubdomain()

  // Debounce search query — 400ms
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery)
  const [debouncedPrice, setDebouncedPrice] = useState<[number, number]>(priceRange)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const priceDebounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => setDebouncedSearch(searchQuery), 400)
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current) }
  }, [searchQuery])

  useEffect(() => {
    if (priceDebounceTimer.current) clearTimeout(priceDebounceTimer.current)
    priceDebounceTimer.current = setTimeout(() => setDebouncedPrice(priceRange), 600)
    return () => { if (priceDebounceTimer.current) clearTimeout(priceDebounceTimer.current) }
  }, [priceRange])

  // Fetch products — filtered by tenant slug via subCategory.category.code
  const { data: productsData, error, isLoading } = useGetProductsQuery(
    {
      page: 1,
      limit: 100,
      categoryCode: slug,
      subcategoryIds: selectedSubcategoryIds.length > 0 ? selectedSubcategoryIds : undefined,
      q: debouncedSearch || undefined,
      minPrice: debouncedPrice[0] > 0 ? debouncedPrice[0] : undefined,
      maxPrice: debouncedPrice[1] < MAX_PRICE ? debouncedPrice[1] : undefined,
    },
    { skip: !slug }
  )

  // Extract available subcategories from products
  const availableSubcategories = useMemo(() => {
    if (!productsData?.docs) return []
    const subcats = new Map<number, { id: number; title: string }>()
    productsData.docs.forEach((product) => {
      const subcat = product.subCategory
      if (!subcats.has(subcat.id)) {
        subcats.set(subcat.id, { id: subcat.id, title: subcat.title })
      }
    })
    return Array.from(subcats.values())
  }, [productsData])

  // Initialize subcategory from URL params
  useEffect(() => {
    const subcategoryParam = searchParams.get("subcategoryId")
    if (subcategoryParam) setSelectedSubcategoryIds([Number(subcategoryParam)])
  }, [searchParams])

  const filteredProducts = productsData?.docs ?? []

  const toggleSubcategory = (subcategoryId: number) => {
    setSelectedSubcategoryIds((prev) =>
      prev.includes(subcategoryId) ? prev.filter((id) => id !== subcategoryId) : [...prev, subcategoryId]
    )
  }

  const clearFilters = () => {
    setSelectedBusiness(null)
    setSelectedSubcategoryIds([])
    setPriceRange([0, MAX_PRICE])
    setSearchQuery("")
  }

  type CartProductSource = {
    id: number
    title?: string
    name?: string
    price: number
    image?: { url?: string; thumbnailURL?: string | null } | string | null
    images?: { image: { url: string } }[]
  }

  const handleAddToCart = (product: CartProductSource) => {
    const imageUrl =
      typeof product.image === "string"
        ? product.image
        : product.image?.thumbnailURL || product.image?.url || product.images?.[0]?.image?.url

    dispatch(
      addToCart({
        id: product.id,
        name: product.title || product.name || "Item",
        price: product.price,
        image: getImageUrl(imageUrl),
        quantity: 1,
      })
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading products...</span>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-lg text-red-500">Error loading products. Please try again.</p>
        </div>
      </div>
    )
  }

  const totalProducts = productsData?.docs?.length || 0

  return (
    <div className="min-h-screen bg-background">
      {/* Quick View Modal */}
      {quickViewId !== null && (
        <QuickViewModal
          productId={quickViewId}
          onClose={() => setQuickViewId(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Hero Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl md:text-5xl font-light text-foreground mb-6"
            >
              Our Product Collection
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="text-lg text-muted-foreground leading-relaxed"
            >
              Discover our complete range of organic products, each carefully selected for quality and freshness.
            </motion.p>
          </div>
        </div>
      </section>


      {/* Main Content Section */}
      <section className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar - Filters (Desktop Only) */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-1">
                {/* Search Bar */}
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-full"
                    />
                  </div>
                </div>

                {/* Filters Label */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-base font-semibold text-foreground">Filters</span>
                </div>

                {/* Filter Accordion */}
                <Accordion type="single" collapsible className="w-full">
                  {/* Subcategory Filter */}
                  {availableSubcategories.length > 0 && (
                    <AccordionItem value="subcategory" className="border-b">
                      <AccordionTrigger className="px-0 py-3 hover:no-underline hover:text-primary">
                        <span className="text-sm font-medium text-left">Subcategory</span>
                      </AccordionTrigger>
                      <AccordionContent className="px-0 py-3 pb-4">
                        <div className="flex flex-col gap-3">
                          {availableSubcategories.map((subcategory) => (
                            <div
                              key={subcategory.id}
                              className="flex items-center gap-3 p-2 rounded hover:bg-secondary/50 transition-colors"
                            >
                              <Checkbox
                                id={`subcategory-${subcategory.id}`}
                                checked={selectedSubcategoryIds.includes(subcategory.id)}
                                onCheckedChange={() => toggleSubcategory(subcategory.id)}
                                className="border-2 w-5 h-5"
                              />
                              <label
                                htmlFor={`subcategory-${subcategory.id}`}
                                className="text-sm cursor-pointer flex-1 font-medium"
                              >
                                {subcategory.title}
                              </label>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {/* Price Range Filter */}
                  <AccordionItem value="price" className="border-b">
                    <AccordionTrigger className="px-0 py-3 hover:no-underline hover:text-primary">
                      <span className="text-sm font-medium text-left">Price Range</span>
                    </AccordionTrigger>
                    <AccordionContent className="px-0 py-3 pb-4">
                      <div className="flex flex-col gap-4">
                        {/* Range Slider */}
                        <div className="relative pt-2">
                          <input
                            type="range"
                            min="0"
                            max={MAX_PRICE}
                            value={priceRange[0]}
                            onChange={(e) => {
                              const newMin = Math.min(Number(e.target.value), priceRange[1])
                              setPriceRange([newMin, priceRange[1]])
                            }}
                            className="absolute w-full h-2 bg-primary/20 rounded-lg appearance-none cursor-pointer z-5 accent-primary"
                          />
                          <input
                            type="range"
                            min="0"
                            max={MAX_PRICE}
                            value={priceRange[1]}
                            onChange={(e) => {
                              const newMax = Math.max(Number(e.target.value), priceRange[0])
                              setPriceRange([priceRange[0], newMax])
                            }}
                            className="absolute w-full h-2 bg-primary/20 rounded-lg appearance-none cursor-pointer z-3 accent-primary"
                          />
                        </div>

                        {/* Price Inputs */}
                        <div className="flex gap-3 items-center mt-4">
                          <div className="flex-1">
                            <label className="text-xs text-muted-foreground block mb-1">Min</label>
                            <Input
                              type="number"
                              min="0"
                              max={MAX_PRICE}
                              value={priceRange[0]}
                              onChange={(e) => {
                                const newMin = Math.min(Number(e.target.value), priceRange[1])
                                setPriceRange([newMin, priceRange[1]])
                              }}
                              className="text-sm"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="text-xs text-muted-foreground block mb-1">Max</label>
                            <Input
                              type="number"
                              min="0"
                              max={MAX_PRICE}
                              value={priceRange[1]}
                              onChange={(e) => {
                                const newMax = Math.max(Number(e.target.value), priceRange[0])
                                setPriceRange([priceRange[0], newMax])
                              }}
                              className="text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {/* Clear Filters Button */}
                {(selectedSubcategoryIds.length > 0 ||
                  priceRange[0] !== 0 ||
                  priceRange[1] !== MAX_PRICE ||
                  searchQuery !== "") && (
                  <Button variant="outline" size="sm" onClick={clearFilters} className="w-full mt-6 bg-transparent">
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>

            {/* Main Content - Products */}
            <div className="lg:col-span-3">
              {/* Results Header with Filter Button for Mobile */}
              <div className="flex justify-between items-center mb-6 gap-4">
                <div className="text-sm text-muted-foreground">
                  Showing {filteredProducts.length} of {totalProducts} products
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDrawerOpen(true)}
                  className="lg:hidden flex items-center gap-2 bg-transparent"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </div>

              {/* Products Grid */}
              {filteredProducts.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <p className="text-lg text-muted-foreground mb-4">No products found matching your criteria.</p>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </motion.div>
              ) : (
                <motion.div layout className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                  <AnimatePresence mode="popLayout">
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={handleAddToCart}
                        onQuickView={(id) => setQuickViewId(id)}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Mobile/Tablet Filter Drawer */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent>
          <DrawerHeader className="border-b">
            <div className="flex items-center justify-between">
              <DrawerTitle>Filters</DrawerTitle>
              <DrawerClose asChild>
                <Button variant="ghost" size="sm">
                  ✕
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>
          <div className="max-h-[70vh] overflow-y-auto px-4 py-4">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            </div>

            {/* Filters - Same structure as desktop */}
            <Accordion type="single" collapsible className="w-full">
              {availableSubcategories.length > 0 && (
                <AccordionItem value="subcategory" className="border-b">
                  <AccordionTrigger className="px-0 py-3 hover:no-underline hover:text-primary">
                    <span className="text-sm font-medium text-left">Subcategory</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-0 py-3 pb-4">
                    <div className="flex flex-col gap-3">
                      {availableSubcategories.map((subcategory) => (
                        <div
                          key={subcategory.id}
                          className="flex items-center gap-3 p-2 rounded hover:bg-secondary/50 transition-colors"
                        >
                          <Checkbox
                            id={`drawer-subcategory-${subcategory.id}`}
                            checked={selectedSubcategoryIds.includes(subcategory.id)}
                            onCheckedChange={() => toggleSubcategory(subcategory.id)}
                            className="border-2 w-5 h-5"
                          />
                          <label
                            htmlFor={`drawer-subcategory-${subcategory.id}`}
                            className="text-sm cursor-pointer flex-1 font-medium"
                          >
                            {subcategory.title}
                          </label>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              <AccordionItem value="price" className="border-b">
                <AccordionTrigger className="px-0 py-3 hover:no-underline hover:text-primary">
                  <span className="text-sm font-medium text-left">Price Range</span>
                </AccordionTrigger>
                <AccordionContent className="px-0 py-3 pb-4">
                  <div className="flex flex-col gap-4">
                    <div className="relative pt-2">
                      <input
                        type="range"
                        min="0"
                        max={MAX_PRICE}
                        value={priceRange[0]}
                        onChange={(e) => {
                          const newMin = Math.min(Number(e.target.value), priceRange[1])
                          setPriceRange([newMin, priceRange[1]])
                        }}
                        className="absolute w-full h-2 bg-primary/20 rounded-lg appearance-none cursor-pointer z-5 accent-primary"
                      />
                      <input
                        type="range"
                        min="0"
                        max={MAX_PRICE}
                        value={priceRange[1]}
                        onChange={(e) => {
                          const newMax = Math.max(Number(e.target.value), priceRange[0])
                          setPriceRange([priceRange[0], newMax])
                        }}
                        className="absolute w-full h-2 bg-primary/20 rounded-lg appearance-none cursor-pointer z-3 accent-primary"
                      />
                    </div>
                    <div className="flex gap-3 items-center mt-4">
                      <div className="flex-1">
                        <label className="text-xs text-muted-foreground block mb-1">Min</label>
                        <Input
                          type="number"
                          min="0"
                          max={MAX_PRICE}
                          value={priceRange[0]}
                          onChange={(e) => {
                            const newMin = Math.min(Number(e.target.value), priceRange[1])
                            setPriceRange([newMin, priceRange[1]])
                          }}
                          className="text-sm"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs text-muted-foreground block mb-1">Max</label>
                        <Input
                          type="number"
                          min="0"
                          max={MAX_PRICE}
                          value={priceRange[1]}
                          onChange={(e) => {
                            const newMax = Math.max(Number(e.target.value), priceRange[0])
                            setPriceRange([priceRange[0], newMax])
                          }}
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {(selectedSubcategoryIds.length > 0 ||
              priceRange[0] !== 0 ||
              priceRange[1] !== MAX_PRICE ||
              searchQuery !== "") && (
              <Button variant="outline" size="sm" onClick={clearFilters} className="w-full mt-6 bg-transparent">
                Clear Filters
              </Button>
            )}
          </div>
        </DrawerContent>
      </Drawer>

    </div>
  )
}