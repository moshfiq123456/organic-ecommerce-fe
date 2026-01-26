"use client"

import Link from "next/link"
import { useState, useMemo, useEffect } from "react"
import { useDispatch } from "react-redux"
import { AppDispatch } from "@/store/store"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Search, Filter, ShoppingCart, Loader2 } from "lucide-react"
import { useGetProductsQuery, getImageUrl } from "@/api/productsApi"
import { addToCart } from "@/slices/cartSlice"

const categories = ["All", "Organic Product"]
const priceRanges = [
  { label: "All Prices", min: 0, max: Number.POSITIVE_INFINITY },
  { label: "Under $500", min: 0, max: 500 },
  { label: "$500 - $1000", min: 500, max: 1000 },
  { label: "$1000+", min: 1000, max: Number.POSITIVE_INFINITY },
]

export default function ProductsPage() {
  const dispatch = useDispatch<AppDispatch>()
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedPriceRange, setSelectedPriceRange] = useState(priceRanges[0])
  const [searchQuery, setSearchQuery] = useState("")

  // Fetch products using RTK Query
  const { data: productsData, error, isLoading } = useGetProductsQuery({ page: 1, limit: 100 })

  // Console log the response
  useEffect(() => {
    if (productsData) {
      console.log('Products API Response:', productsData)
      console.log('Products:', productsData.docs)
    }
  }, [productsData])

  useEffect(() => {
    if (error) {
      console.error('Products API Error:', error)
    }
  }, [error])

  const filteredProducts = useMemo(() => {
    if (!productsData?.docs) return []

    return productsData.docs.filter((product) => {
      const matchesCategory = selectedCategory === "All" || product.subCategory.category.title === selectedCategory
      const matchesPrice = product.price >= selectedPriceRange.min && product.price <= selectedPriceRange.max
      const matchesSearch =
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesCategory && matchesPrice && matchesSearch
    })
  }, [productsData, selectedCategory, selectedPriceRange, searchQuery])

  const handleAddToCart = (product: any) => {
    dispatch(addToCart({
      id: product.id,
      name: product.title,
      price: product.price,
      image: getImageUrl(product.image?.sizes?.card?.url || product.image?.url),
      quantity: 1
    }))
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-light text-foreground mb-6">Our Product Collection</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Discover our complete range of organic beauty products, each carefully formulated with the finest
              botanical ingredients for your natural beauty routine.
            </p>
          </div>
        </div>
      </section>

      <section className="py-8 border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Filter by:</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {/* Category Filter */}
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className="text-xs"
                    >
                      {category}
                    </Button>
                  ))}
                </div>

                {/* Price Range Filter */}
                <div className="flex flex-wrap gap-2">
                  {priceRanges.map((range) => (
                    <Button
                      key={range.label}
                      variant={selectedPriceRange.label === range.label ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedPriceRange(range)}
                      className="text-xs"
                    >
                      {range.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results Count */}
            {!isLoading && productsData && (
              <div className="mt-4 text-sm text-muted-foreground">
                Showing {filteredProducts.length} of {productsData.totalDocs} products
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading products...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-lg text-destructive mb-4">Error loading products. Please try again.</p>
              <p className="text-sm text-muted-foreground">Check console for details.</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground mb-4">No products found matching your criteria.</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedCategory("All")
                  setSelectedPriceRange(priceRanges[0])
                  setSearchQuery("")
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {filteredProducts.map((product:any) => (
                <Card key={product.id} className="group hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-0">
                    <div className="aspect-square overflow-hidden rounded-t-lg">
                      <img
                        src={getImageUrl(product.image?.sizes?.card?.url || product.image?.url)}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                          {product.subCategory.title}
                        </span>
                        <span className="text-lg font-semibold text-primary">${product.price}</span>
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">{product.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4 leading-relaxed line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex items-center gap-2 mb-4">
                        {product.preOrder && (
                          <span className="text-xs bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded">
                            Pre-Order ({product.preOrderTime} {product.preOrderTimeUnit}s)
                          </span>
                        )}
                        {product.purity && (
                          <span className="text-xs bg-green-500/10 text-green-700 dark:text-green-400 px-2 py-1 rounded">
                            {product.purity.replace(/_/g, ' ')}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/products/${product.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full bg-transparent">
                            View Details
                          </Button>
                        </Link>
                          <Button 
                            size="sm" 
                            onClick={() => handleAddToCart(product)}
                            className="gap-1"
                            disabled={!product.isAvailable || product.stockIn === 0}
                          >
                            <ShoppingCart className="h-4 w-4" />
                            {product.isAvailable && product.stockIn > 0 ? 'Add to Cart' : 'Out of Stock'}
                          </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}