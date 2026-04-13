"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useDispatch } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Leaf, Heart, Sparkles, ShoppingCart, Eye } from "lucide-react"
import { useGetProductsQuery, getImageUrl } from "@/api/productsApi"
import { useGetSubCategoriesQuery } from "@/api/categories"
import { useSubdomain } from "@/context/SubdomainContext"
import { addToCart } from "@/slices/cartSlice"
import { HeroCarousel } from "@/components/hero-carousel"
import type { AppDispatch } from "@/store/store"

// ── Variants ──────────────────────────────────────────
const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

// ── Skeleton ──────────────────────────────────────────
function ProductSkeleton() {
  return (
    <div className="bg-card rounded-2xl overflow-hidden border border-border flex flex-col animate-pulse">
      <div className="aspect-square bg-muted" />
      <div className="p-4 space-y-3">
        <div className="flex justify-between">
          <div className="h-4 bg-muted rounded-full w-1/3" />
          <div className="h-4 bg-muted rounded-full w-1/4" />
        </div>
        <div className="h-4 bg-muted rounded-full w-3/4" />
        <div className="h-3 bg-muted rounded-full w-full" />
        <div className="h-3 bg-muted rounded-full w-2/3" />
        <div className="flex gap-2 pt-2">
          <div className="h-8 bg-muted rounded-xl flex-1" />
          <div className="h-8 bg-muted rounded-xl flex-1" />
        </div>
      </div>
    </div>
  )
}

// ── Product Card ──────────────────────────────────────
function FeaturedProductCard({ product, onAddToCart }: { product: any; onAddToCart: (p: any) => void }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col"
    >
      <div className="relative aspect-square overflow-hidden bg-secondary/20 shrink-0">
        <motion.img
          src={getImageUrl(product.image?.thumbnailURL || product.image?.url || product.images?.[0]?.image?.url)}
          alt={product.title}
          animate={{ scale: hovered ? 1.08 : 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full h-full object-cover"
        />

        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="absolute inset-0 bg-black/25 flex items-end justify-center pb-4"
            >
              <motion.div
                initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 8, opacity: 0 }}
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

        {/* Badges — top-right for stock, top-left for sale/preorder (no overlap) */}
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
            Pre-order
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            {product.subCategory?.title}
          </span>
          <div className="flex items-center gap-1.5">
            {product.onSale && product.salePrice ? (
              <>
                <span className="text-xs text-muted-foreground line-through">৳{product.price}</span>
                <span className="text-sm font-semibold text-primary">৳{product.salePrice}</span>
              </>
            ) : (
              <span className="text-sm font-semibold text-primary">৳{product.price}</span>
            )}
          </div>
        </div>

        <h3 className="font-semibold text-foreground text-sm mb-1.5 line-clamp-1">{product.title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 flex-1">
          {product.description || "No description available"}
        </p>

        <div className="flex items-center gap-1.5 mt-2">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${product.stockIn > 0 ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-500"}`}>
            {product.stockIn > 0 ? `${product.stockIn} in stock` : "Out of stock"}
          </span>
        </div>

        <div className="flex gap-2 mt-4">
          <Link href={`/products/${product.id}`} className="flex-1">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}>
              <Button variant="outline" size="sm" className="w-full bg-transparent text-xs rounded-xl">Details</Button>
            </motion.div>
          </Link>
          <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}>
            <Button size="sm" onClick={() => onAddToCart(product)} className="gap-1 text-xs w-full rounded-xl" disabled={product.stockIn === 0}>
              <ShoppingCart className="h-3 w-3" />
              {product.stockIn > 0 ? "Add to Cart" : "Out of Stock"}
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

// ── Product Section ───────────────────────────────────
function ProductSection({ title, subtitle, products, isLoading, emptyMessage }: {
  title: string
  subtitle: string
  products: any[]
  isLoading: boolean
  emptyMessage?: string
}) {
  const dispatch = useDispatch<AppDispatch>()

  const handleAddToCart = (product: any) => {
    const imageUrl = product.image?.thumbnailURL || product.image?.url || product.images?.[0]?.image?.url
    dispatch(addToCart({ id: product.id, name: product.title, price: product.salePrice || product.price, image: getImageUrl(imageUrl), quantity: 1 }))
  }

  return (
    <div>
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-light text-foreground mb-3">{title}</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {Array.from({ length: 3 }).map((_, i) => <ProductSkeleton key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">{emptyMessage || "No products available right now."}</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {products.map((product) => (
            <FeaturedProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Back to Top ───────────────────────────────────────

// ── Page ──────────────────────────────────────────────
export default function HomePage() {
  const slug = useSubdomain()

  const { data: featuredData, isLoading: featuredLoading } = useGetProductsQuery(
    { limit: 6, categoryCode: slug, productType: "featured" },
    { skip: !slug }
  )

  const { data: saleData, isLoading: saleLoading } = useGetProductsQuery(
    { limit: 6, categoryCode: slug, onSale: true },
    { skip: !slug }
  )

  const { data: subCategoriesData } = useGetSubCategoriesQuery(
    { categoryCode: slug },
    { skip: !slug }
  )

  const featuredProducts = featuredData?.docs ?? []
  const saleProducts = saleData?.docs ?? []
  const subcategories = subCategoriesData?.docs ?? []

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="-mt-18">
        <HeroCarousel />
      </div>

      {/* Category Quick Links */}
      {subcategories.length > 0 && (
        <section className="py-8 border-b border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 flex-wrap justify-center">
              <Link href="/products">
                <motion.span
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center px-4 py-2 rounded-full border border-primary/30 text-sm font-medium text-primary bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer"
                >
                  All Products
                </motion.span>
              </Link>
              {subcategories.map((cat, i) => (
                <Link key={cat.id} href={`/products?subcategoryId=${cat.id}`}>
                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center px-4 py-2 rounded-full border border-border text-sm font-medium text-foreground/70 hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors cursor-pointer"
                  >
                    {cat.title}
                  </motion.span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ProductSection
            title="Featured Products"
            subtitle="Discover our most loved organic beauty essentials"
            products={featuredProducts}
            isLoading={featuredLoading}
            emptyMessage="No featured products at the moment. Check back soon!"
          />
          <div className="text-center mt-10">
            <Link href="/products">
              <Button variant="outline" size="lg">View All Products</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* On Sale */}
      {(saleLoading || saleProducts.length > 0) && (
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ProductSection
              title="On Sale"
              subtitle="Limited time offers — grab them before they're gone"
              products={saleProducts}
              isLoading={saleLoading}
            />
            {saleProducts.length > 0 && (
              <div className="text-center mt-10">
                <Link href="/products">
                  <Button variant="outline" size="lg">Shop All Sales</Button>
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Values Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-3xl md:text-4xl font-light text-foreground mb-4"
              >
                Our Commitment
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-muted-foreground"
              >
                Every product is crafted with intention and care
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: <Leaf className="h-8 w-8" />, title: "100% Organic", description: "Certified organic ingredients sourced from sustainable farms worldwide" },
                { icon: <Heart className="h-8 w-8" />, title: "Cruelty-Free", description: "Never tested on animals, always developed with compassion and care" },
                { icon: <Sparkles className="h-8 w-8" />, title: "Clean Beauty", description: "Free from harmful chemicals, parabens, and synthetic fragrances" },
              ].map((value, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-60px" }}
                  className="text-center"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 18 }}
                    className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4 text-primary"
                  >
                    {value.icon}
                  </motion.div>
                  <h3 className="font-semibold text-foreground mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-light mb-4"
          >
            Ready to transform your routine?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg mb-8 opacity-90 max-w-2xl mx-auto"
          >
            Join thousands of customers who have discovered the power of organic beauty
          </motion.p>
          <Link href="/products">
            <Button size="lg" variant="secondary">Start Shopping</Button>
          </Link>
        </div>
      </section>

    </div>
  )
}
