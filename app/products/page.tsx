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
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/store/store"
import { useGetProductsQuery, useGetProductByIdQuery, getImageUrl } from "@/api/productsApi"
import { useAddToCart } from "@/hooks/useAddToCart"
import { useRemoveFromCart } from "@/hooks/useRemoveFromCart"
import { useUpdateCartQuantity } from "@/hooks/useUpdateCartQuantity"
import { WishlistButton } from "@/components/wishlist-button"
import { ProductCard, useQuickView } from "@/components/product-card"

const MAX_PRICE = 1000

// ── Product card variants ─────────────────────────────
const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } },
  exit:    { opacity: 0, scale: 0.93, transition: { duration: 0.25 } },
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
  const { openQuickView, quickView } = useQuickView()
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
  // `isFetching` is true for every refetch (incl. filter changes); `isLoading`
  // is only true on the very first load.
  const { data: productsData, error, isLoading, isFetching } = useGetProductsQuery(
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

  // Keep the last successful result on screen while a new filter is fetching,
  // so the grid dims + shows a loader instead of blanking out between calls.
  const lastProductsData = useRef<typeof productsData>(undefined)
  if (productsData) lastProductsData.current = productsData
  const displayData = productsData ?? lastProductsData.current

  // Extract available subcategories from products
  const availableSubcategories = useMemo(() => {
    if (!displayData?.docs) return []
    const subcats = new Map<number, { id: number; title: string }>()
    displayData.docs.forEach((product) => {
      const subcat = product.subCategory
      if (!subcats.has(subcat.id)) {
        subcats.set(subcat.id, { id: subcat.id, title: subcat.title })
      }
    })
    return Array.from(subcats.values())
  }, [displayData])

  // Initialize subcategory from URL params
  useEffect(() => {
    const subcategoryParam = searchParams.get("subcategoryId")
    if (subcategoryParam) setSelectedSubcategoryIds([Number(subcategoryParam)])
  }, [searchParams])

  const filteredProducts = displayData?.docs ?? []

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
    quantity?: number
    image?: { url?: string; thumbnailURL?: string | null } | string | null
    images?: { image: { url: string } }[]
  }

  const handleAddToCartBase = useAddToCart()

  const handleAddToCart = (product: CartProductSource) => {
    const imageUrl =
      typeof product.image === "string"
        ? product.image
        : product.image?.thumbnailURL || product.image?.url || product.images?.[0]?.image?.url

    handleAddToCartBase({
      id: product.id,
      name: product.title || product.name || "Item",
      price: product.price,
      quantity: product.quantity || 1,
      image: getImageUrl(imageUrl),
    })
  }

  // Full-page loader only on the very first load (no data yet). Filter
  // refetches keep the page and use the grid overlay below instead.
  if (isLoading && !displayData) {
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
      {quickView}

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
              <div className="relative min-h-[40vh]">
                {/* Loader overlay shown while a filter change is fetching */}
                {isFetching && (
                  <div className="absolute inset-0 z-10 flex items-start justify-center pt-24 bg-background/50 backdrop-blur-[1px] rounded-xl">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <span className="text-sm">Updating results…</span>
                    </div>
                  </div>
                )}

                {filteredProducts.length === 0 ? (
                  // Only show the empty state once fetching settles, so it
                  // doesn't flash between filter changes.
                  !isFetching && (
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
                  )
                ) : (
                  <motion.div
                    layout
                    className={`grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 transition-opacity ${isFetching ? "opacity-40 pointer-events-none" : "opacity-100"}`}
                  >
                    <AnimatePresence mode="popLayout">
                      {filteredProducts.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onQuickView={openQuickView}
                        />
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )}
              </div>
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