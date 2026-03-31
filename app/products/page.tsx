"use client"

import { useSearchParams } from "next/navigation"
import React, { useState, useMemo, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer"
import { Search, Filter, ShoppingCart, Loader2, Eye } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { businesses } from "@/lib/products"
import { useDispatch } from "react-redux"
import { AppDispatch } from "@/store/store"
import { useGetProductsQuery, getImageUrl } from "@/api/productsApi"
import { addToCart } from "@/slices/cartSlice"

const MAX_PRICE = 1000

// ── Product card variants ─────────────────────────────
const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } },
  exit:    { opacity: 0, scale: 0.93, transition: { duration: 0.25 } },
}

function ProductCard({
  product,
  onAddToCart,
}: {
  product: ApiProduct
  onAddToCart: (p: ApiProduct) => void
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
          src={product.image.thumbnailURL || product.image.url || "/placeholder.svg"}
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
                <Link href={`/products/${product.id}`}>
                  <Button size="sm" variant="secondary" className="gap-1.5 text-xs shadow-lg rounded-full px-4">
                    <Eye className="h-3.5 w-3.5" /> Quick View
                  </Button>
                </Link>
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
        {product.preOrder && (
          <span className="absolute top-2.5 left-2.5 bg-yellow-500/90 text-white text-[10px] px-2 py-0.5 rounded-full">
            Pre-order · {product.preOrderTime} {product.preOrderTimeUnit}s
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            {product.subCategory.title}
          </span>
          <span className="text-sm font-semibold text-primary">৳{product.price}</span>
        </div>

        <h3 className="font-semibold text-foreground text-sm mb-1.5 line-clamp-1">{product.title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 flex-1">
          {product.description || "No description available"}
        </p>

        <div className="flex gap-2 mt-4">
          <Link href={`/products/${product.id}`} className="flex-1">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}>
              <Button variant="outline" size="sm" className="w-full bg-transparent text-xs rounded-xl">
                Details
              </Button>
            </motion.div>
          </Link>
          <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}>
            <Button
              size="sm"
              onClick={() => onAddToCart(product)}
              className="gap-1 text-xs w-full rounded-xl"
              disabled={product.stockIn === 0}
            >
              <ShoppingCart className="h-3 w-3" />
              {product.stockIn > 0 ? "Add to Cart" : "Out of Stock"}
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
  const [slug, setSlug] = useState<string | undefined>(undefined)

  // Read tenant slug from hostname
  useEffect(() => {
    setSlug(window.location.hostname.split(".")[0])
  }, [])

  // Debounce search query — 400ms
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => setDebouncedSearch(searchQuery), 400)
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current) }
  }, [searchQuery])

  // Fetch products — filtered by tenant slug via subCategory.category.code
  const { data: productsData, error, isLoading } = useGetProductsQuery(
    {
      page: 1,
      limit: 100,
      categoryCode: slug,
      subcategoryIds: selectedSubcategoryIds.length > 0 ? selectedSubcategoryIds : undefined,
      q: debouncedSearch || undefined,
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

  // Filter products client-side by price only (search is handled by the API)
  const filteredProducts = useMemo(() => {
    if (!productsData?.docs) return []
    return productsData.docs.filter(
      (product) => product.price >= priceRange[0] && product.price <= priceRange[1]
    )
  }, [productsData, priceRange])

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
  }

  const handleAddToCart = (product: CartProductSource) => {
    const imageUrl =
      typeof product.image === "string" ? product.image : product.image?.thumbnailURL || product.image?.url

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
              <div className="sticky top-4">
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
                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence mode="popLayout">
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={handleAddToCart}
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