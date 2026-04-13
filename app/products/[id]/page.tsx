"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ShoppingCart, Heart, Share2, Loader2, ChevronRight } from "lucide-react"
import { useGetProductByIdQuery, useGetSuggestedProductsQuery, useGetSuggestedByCategoryQuery, getImageUrl } from "@/api/productsApi"

const ZOOM = 2

interface ProductPageProps {
  params: { id: string }
}

function ZoomableImage({ src, alt }: { src: string; alt: string }) {
  const [origin, setOrigin] = useState("50% 50%")
  const [hovered, setHovered] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const { left, top, width, height } = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - left) / width) * 100
    const y = ((e.clientY - top) / height) * 100
    setOrigin(`${x}% ${y}%`)
  }

  return (
    <div
      ref={containerRef}
      className="aspect-square rounded-lg bg-secondary/30 overflow-hidden cursor-zoom-in select-none"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        src={src}
        alt={alt}
        draggable={false}
        className="w-full h-full object-cover"
        style={{
          transform: hovered ? `scale(${ZOOM})` : "scale(1)",
          transformOrigin: origin,
          transition: hovered ? "transform 0.1s ease-out" : "transform 0.3s ease-out",
        }}
      />
    </div>
  )
}

function ProductGallery({ images, fallback, alt }: { images: { url: string; id: string }[]; fallback: string; alt: string }) {
  const allImages = images.length > 0 ? images : [{ url: fallback, id: "fallback" }]
  const [selected, setSelected] = useState(0)

  return (
    <div className="flex flex-col gap-3">
      <ZoomableImage src={getImageUrl(allImages[selected].url)} alt={alt} />
      {allImages.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {allImages.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setSelected(i)}
              className={`w-16 h-16 rounded-md overflow-hidden border-2 transition-colors shrink-0 ${
                selected === i ? "border-primary" : "border-transparent hover:border-border"
              }`}
            >
              <img src={getImageUrl(img.url)} alt={`${alt} ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ProductTabs({ ingredients, nutrition }: { ingredients?: string | null; nutrition?: string | null }) {
  const tabs = [
    ...(ingredients ? [{ key: "ingredients", label: "Ingredients" }] : []),
    ...(nutrition   ? [{ key: "nutrition",   label: "Nutrition"   }] : []),
  ]
  const [active, setActive] = useState(tabs[0]?.key ?? "")
  const content: Record<string, string | null | undefined> = { ingredients, nutrition }

  return (
    <div className="pt-6 border-t">
      <div className="flex gap-0 border-b mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              active === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
        {content[active]}
      </p>
    </div>
  )
}

export default function ProductPage({ params }: ProductPageProps) {
  const productId = Number.parseInt(params.id)

  const { data: product, isLoading, error } = useGetProductByIdQuery(productId)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg text-red-500">Product not found.</p>
      </div>
    )
  }

  console.log("product", product)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8 flex-wrap">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <Link href="/products" className="hover:text-foreground transition-colors">Products</Link>
          {product.subCategory?.title && (
            <>
              <ChevronRight className="h-3.5 w-3.5 shrink-0" />
              <Link href={`/products?subcategoryId=${product.subCategory.id}`} className="hover:text-foreground transition-colors">
                {product.subCategory.title}
              </Link>
            </>
          )}
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <span className="text-foreground font-medium truncate max-w-48">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Product Gallery */}
          <div className="space-y-4">
            <ProductGallery
              images={(product.images ?? []).map(({ image, id }) => ({ url: image.url, id }))}
              fallback={product.image?.url || product.image?.thumbnailURL}
              alt={product.title}
            />
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className="mb-3">
                {product.subCategory?.title}
              </Badge>
              <h1 className="text-3xl md:text-4xl font-light text-foreground mb-4">{product.title}</h1>

              {/* Price */}
              <div className="flex items-center gap-3 mb-4">
                {product.onSale && product.salePrice ? (
                  <>
                    <span className="text-2xl font-semibold text-primary">৳{product.salePrice}</span>
                    <span className="text-lg text-muted-foreground line-through">৳{product.price}</span>
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-semibold">
                      {product.discountType === "percentage" ? `${product.discountValue}% OFF` : `৳${product.discountValue} OFF`}
                    </span>
                  </>
                ) : (
                  <span className="text-2xl font-semibold text-primary">৳{product.price}</span>
                )}
              </div>

              {/* Stock */}
              <div className="flex items-center gap-2 mb-4">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${product.stockIn > 0 ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-500"}`}>
                  {product.stockIn > 0 ? `${product.stockIn} in stock` : "Out of stock"}
                </span>
              </div>

              <p className="text-lg text-muted-foreground leading-relaxed">{product.description}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Link href="/order" className="flex-1">
                <Button size="lg" className="w-full" disabled={product.stockIn === 0}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {product.stockIn > 0 ? "Add to Cart" : "Out of Stock"}
                </Button>
              </Link>
              {/* <Button variant="outline" size="lg">
                <Heart className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg">
                <Share2 className="h-4 w-4" />
              </Button> */}
            </div>

            {/* Product Meta */}
            <div className="space-y-3 pt-6 border-t text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Category</span>
                <span className="text-foreground font-medium">{product.subCategory?.title}</span>
              </div>
              <div className="flex justify-between">
                <span>Stock</span>
                <span className={`font-medium ${product.stockIn > 0 ? "text-green-600" : "text-red-500"}`}>
                  {product.stockIn > 0 ? `${product.stockIn} available` : "Out of stock"}
                </span>
              </div>
              {product.tagline && (
                <div className="flex justify-between">
                  <span>Tagline</span>
                  <span className="text-foreground font-medium">{product.tagline.replace(/_/g, " ")}</span>
                </div>
              )}
              {product.preOrder && (
                <div className="flex justify-between">
                  <span>Pre-order</span>
                  <span className="text-foreground font-medium">
                    {product.preOrderTime} {product.preOrderTimeUnit}s
                  </span>
                </div>
              )}
            </div>

            {/* Tabs — Ingredients / Nutrition */}
            {(product.ingredients || product.nutrition) && (
              <ProductTabs ingredients={product.ingredients} nutrition={product.nutrition} />
            )}
          </div>
        </div>
      </div>

      {/* ── Suggested Products ── */}
      <SuggestedProducts
        subCategoryId={product.subCategory?.id}
        categoryId={product.subCategory?.category?.id}
        excludeId={product.id}
      />

    </div>
  )
}

function SuggestedProducts({ subCategoryId, categoryId, excludeId }: { subCategoryId: number; categoryId?: number; excludeId: number }) {
  const { data: subCatData, isLoading: subCatLoading } = useGetSuggestedProductsQuery(
    { subCategoryId, excludeId },
    { skip: !subCategoryId }
  )

  const subCatResults = subCatData?.docs ?? []
  const needFallback = !subCatLoading && subCatResults.length === 0

  const { data: catData, isLoading: catLoading } = useGetSuggestedByCategoryQuery(
    { categoryId: categoryId!, excludeId },
    { skip: !needFallback || !categoryId }
  )

  const isLoading = subCatLoading || (needFallback && catLoading)
  const suggestions = subCatResults.length > 0 ? subCatResults : (catData?.docs ?? [])

  if (isLoading) {
    return (
      <section className="border-t mt-12 pt-10 pb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-6 w-48 bg-muted rounded animate-pulse mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-muted animate-pulse aspect-square" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (suggestions.length === 0) return null

  return (
    <section className="border-t mt-12 pt-10 pb-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-light text-foreground mb-8">You may also like</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {suggestions.map((p) => (
            <Link key={p.id} href={`/products/${p.id}`} className="group">
              <div className="bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-lg transition-shadow duration-300">
                <div className="aspect-square overflow-hidden bg-secondary/20 relative">
                  <img
                    src={getImageUrl(p.image?.thumbnailURL || p.image?.url || p.images?.[0]?.image?.url)}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {p.onSale && p.stockIn > 0 && (
                    <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full font-semibold">
                      Sale
                    </span>
                  )}
                  {p.stockIn === 0 && (
                    <span className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full">
                      Out of Stock
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs text-muted-foreground mb-1">{p.subCategory?.title}</p>
                  <h3 className="text-sm font-medium text-foreground line-clamp-1 mb-2">{p.title}</h3>
                  <div className="flex items-center gap-2">
                    {p.onSale && p.salePrice ? (
                      <>
                        <span className="text-sm font-semibold text-primary">৳{p.salePrice}</span>
                        <span className="text-xs text-muted-foreground line-through">৳{p.price}</span>
                      </>
                    ) : (
                      <span className="text-sm font-semibold text-primary">৳{p.price}</span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
