"use client"

import { useSearchParams } from "next/navigation"
import React, { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Search, Filter, ShoppingCart, Loader2 } from "lucide-react"
import { businesses } from "@/lib/products"
import { useDispatch } from "react-redux"
import { AppDispatch } from "@/store/store"
import { useGetProductsQuery, getImageUrl } from "@/api/productsApi"
import { addToCart } from "@/slices/cartSlice"
import { useGetCategoriesQuery } from "@/api/categories"

const MAX_PRICE = 1000

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

  // Filter state - using IDs instead of titles
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState<number[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, MAX_PRICE])
  const [searchQuery, setSearchQuery] = useState("")
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedBusiness, setSelectedBusiness] = useState<string | null>(null)

  // Fetch categories from API
  const { data: categoriesData, isLoading: categoriesLoading } = useGetCategoriesQuery({
    page: 1,
    limit: 50,
  })

  // Fetch products with category filter - Pass IDs to API
  const { data: productsData, error, isLoading } = useGetProductsQuery({
    page: 1,
    limit: 100,
    categoryId: selectedCategoryId || undefined,
    subcategoryIds: selectedSubcategoryIds.length > 0 ? selectedSubcategoryIds : undefined,
  })

  // Get categories from API
  const apiCategories = useMemo(() => {
    return categoriesData?.docs ?? []
  }, [categoriesData])

  // Extract available subcategories from filtered products
  const availableSubcategories = useMemo(() => {
    if (!selectedCategoryId || !productsData?.docs) return []

    const subcats = new Map<number, { id: number; title: string }>()

    productsData.docs.forEach((product) => {
      if (product.subCategory.category.id === selectedCategoryId) {
        const subcat = product.subCategory
        if (!subcats.has(subcat.id)) {
          subcats.set(subcat.id, {
            id: subcat.id,
            title: subcat.title,
          })
        }
      }
    })

    return Array.from(subcats.values())
  }, [selectedCategoryId, productsData])

  // Initialize filters from URL params
  useEffect(() => {
    const categoryParam = searchParams.get("categoryId")
    const subcategoryParam = searchParams.get("subcategoryId")

    if (categoryParam) {
      setSelectedCategoryId(Number(categoryParam))
    }
    if (subcategoryParam) {
      setSelectedSubcategoryIds([Number(subcategoryParam)])
    }
  }, [searchParams])

  // Filter products client-side by price and search
  const filteredProducts = useMemo(() => {
    if (!productsData?.docs) return []

    return productsData.docs.filter((product) => {
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]
      const matchesSearch =
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))

      return matchesPrice && matchesSearch
    })
  }, [productsData, priceRange, searchQuery])

  const toggleCategory = (categoryId: number) => {
    setSelectedCategoryId(selectedCategoryId === categoryId ? null : categoryId)
    setSelectedSubcategoryIds([]) // Clear subcategories when category changes
  }

  const toggleSubcategory = (subcategoryId: number) => {
    setSelectedSubcategoryIds((prev) =>
      prev.includes(subcategoryId) ? prev.filter((id) => id !== subcategoryId) : [...prev, subcategoryId]
    )
  }

  const clearFilters = () => {
    setSelectedBusiness(null)
    setSelectedCategoryId(null)
    setSelectedSubcategoryIds([])
    setPriceRange([0, MAX_PRICE])
    setSearchQuery("")
  }

  type CartProductSource = {
    id: number
    title?: string
    name?: string
    price: number
    image?: { url?: string; thumbnailURL?: string } | string | null
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
  if (isLoading || categoriesLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading products...</span>
        </div>
        <Footer />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-lg text-red-500">Error loading products. Please try again.</p>
        </div>
        <Footer />
      </div>
    )
  }

  const totalProducts = productsData?.docs?.length || 0

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-light text-foreground mb-6">Our Product Collection</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Discover our complete range of organic products, each carefully selected for quality and freshness.
            </p>
          </div>
        </div>
      </section>

      {/* Business Tabs Section */}
      {businesses && businesses.length > 0 && (
        <section className="py-4 sm:py-6 border-b bg-secondary/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-3 sm:mb-4">Browse by Business</p>
              <div className="flex gap-2 sm:gap-3 justify-start flex-wrap sm:flex-nowrap">
                <button
                  onClick={() => setSelectedBusiness(null)}
                  className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-full whitespace-nowrap border text-xs sm:text-sm transition-all ${
                    selectedBusiness === null
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border hover:border-primary/50"
                  }`}
                >
                  All
                </button>
                {businesses.map((business) => (
                  <button
                    key={business.id}
                    onClick={() => setSelectedBusiness(business.id)}
                    className={`flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-full border text-xs sm:text-sm transition-all ${
                      selectedBusiness === business.id
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border hover:border-primary/50"
                    }`}
                  >
                    <img
                      src={business.logo || "/placeholder.svg"}
                      alt={business.name}
                      className="w-6 h-6 sm:w-6 sm:h-6 rounded-full object-cover"
                    />
                    <span className="hidden sm:inline font-medium">{business.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

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
                  {/* Category Filter */}
                  {apiCategories.length > 0 && (
                    <AccordionItem value="category" className="border-b">
                      <AccordionTrigger className="px-0 py-3 hover:no-underline hover:text-primary">
                        <span className="text-sm font-medium text-left">Category</span>
                      </AccordionTrigger>
                      <AccordionContent className="px-0 py-3 pb-4">
                        <div className="flex flex-col gap-3">
                          {apiCategories.map((category) => (
                            <div
                              key={category.id}
                              className="flex items-center gap-3 p-2 rounded hover:bg-secondary/50 transition-colors"
                            >
                              <Checkbox
                                id={`category-${category.id}`}
                                checked={selectedCategoryId === category.id}
                                onCheckedChange={() => toggleCategory(category.id)}
                                className="border-2 w-5 h-5"
                              />
                              <label
                                htmlFor={`category-${category.id}`}
                                className="text-sm cursor-pointer flex-1 font-medium"
                              >
                                {category.title}
                              </label>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}

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
                {(selectedCategoryId !== null ||
                  selectedSubcategoryIds.length > 0 ||
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
                <div className="text-center py-12">
                  <p className="text-lg text-muted-foreground mb-4">No products found matching your criteria.</p>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <Card key={product.id} className="group hover:shadow-lg transition-shadow duration-300">
                      <CardContent className="p-0">
                        <div className="aspect-square overflow-hidden rounded-t-lg relative">
                          <img
                            src={product.image.thumbnailURL || product.image.url || "/placeholder.svg"}
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="p-5">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                              {product.subCategory.title}
                            </span>
                            <span className="text-sm font-semibold text-primary">৳{product.price}</span>
                          </div>
                          <h3 className="font-semibold text-foreground mb-2 text-sm">{product.title}</h3>
                          <p className="text-xs text-muted-foreground mb-4 leading-relaxed line-clamp-2">
                            {product.description || "No description available"}
                          </p>
                          <div className="flex items-center gap-2 mb-4">
                            {product.preOrder && (
                              <span className="text-xs bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded">
                                Pre-Order ({product.preOrderTime} {product.preOrderTimeUnit}s)
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Link href={`/products/${product.id}`} className="flex-1">
                              <Button variant="outline" size="sm" className="w-full bg-transparent text-xs">
                                Details
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              onClick={() => handleAddToCart(product)}
                              className="gap-1 text-xs flex-1"
                              disabled={product.stockIn === 0}
                            >
                              <ShoppingCart className="h-3 w-3" />
                              {product.stockIn > 0 ? "Add to Cart" : "Out of Stock"}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
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
              {apiCategories.length > 0 && (
                <AccordionItem value="category" className="border-b">
                  <AccordionTrigger className="px-0 py-3 hover:no-underline hover:text-primary">
                    <span className="text-sm font-medium text-left">Category</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-0 py-3 pb-4">
                    <div className="flex flex-col gap-3">
                      {apiCategories.map((category) => (
                        <div
                          key={category.id}
                          className="flex items-center gap-3 p-2 rounded hover:bg-secondary/50 transition-colors"
                        >
                          <Checkbox
                            id={`drawer-category-${category.id}`}
                            checked={selectedCategoryId === category.id}
                            onCheckedChange={() => toggleCategory(category.id)}
                            className="border-2 w-5 h-5"
                          />
                          <label
                            htmlFor={`drawer-category-${category.id}`}
                            className="text-sm cursor-pointer flex-1 font-medium"
                          >
                            {category.title}
                          </label>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

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

            {(selectedCategoryId !== null ||
              selectedSubcategoryIds.length > 0 ||
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

      <Footer />
    </div>
  )
}