"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ShoppingCart, Heart, Share2, Loader2 } from "lucide-react"
import { useGetProductByIdQuery, getImageUrl } from "@/api/productsApi"

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
        {/* Back Button */}
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Product Image with Zoom */}
          <div className="space-y-4">
            <ZoomableImage
              src={getImageUrl(product.image?.url || product.image?.thumbnailURL)}
              alt={product.title}
            />
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className="mb-3">
                {product.subCategory?.category?.title}
              </Badge>
              <h1 className="text-3xl md:text-4xl font-light text-foreground mb-4">{product.title}</h1>
              <p className="text-2xl font-semibold text-primary mb-4">৳{product.price}</p>
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
              <Button variant="outline" size="lg">
                <Heart className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Product Meta */}
            <div className="space-y-3 pt-6 border-t text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Category</span>
                <span className="text-foreground font-medium">{product.subCategory?.category?.title}</span>
              </div>
              <div className="flex justify-between">
                <span>Subcategory</span>
                <span className="text-foreground font-medium">{product.subCategory?.title}</span>
              </div>
              <div className="flex justify-between">
                <span>Stock</span>
                <span className="text-foreground font-medium">{product.stockIn} available</span>
              </div>
              {product.preOrder && (
                <div className="flex justify-between">
                  <span>Pre-order</span>
                  <span className="text-foreground font-medium">
                    {product.preOrderTime} {product.preOrderTimeUnit}s
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
