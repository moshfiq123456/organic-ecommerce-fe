"use client"

import React, { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingCart, Eye, X, Loader2, ChevronLeft, ChevronRight, ArrowRight, Images as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { WishlistButton } from "@/components/wishlist-button"
import { useGetProductByIdQuery, getImageUrl } from "@/api/productsApi"
import { useAddToCart } from "@/hooks/useAddToCart"
import { useRemoveFromCart } from "@/hooks/useRemoveFromCart"
import { useUpdateCartQuantity } from "@/hooks/useUpdateCartQuantity"
import { useSelector } from "react-redux"
import type { RootState } from "@/store/store"

export const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } },
  exit: { opacity: 0, scale: 0.93, transition: { duration: 0.25 } },
}

const productImage = (product: any) =>
  getImageUrl(product?.image?.thumbnailURL || product?.image?.url || product?.images?.[0]?.image?.url)

/** Every image on the product, in order — a product can have up to 6. */
const productImages = (product: any): string[] => {
  const fromArray = (product?.images ?? [])
    .map((entry: any) => entry?.image?.url || entry?.image?.thumbnailURL)
    .filter(Boolean)
    .map((url: string) => getImageUrl(url))
  return fromArray.length > 0 ? fromArray : [productImage(product)]
}

/** Shared "add to cart" payload for a product. */
const toCartItem = (product: any, quantity = 1) => ({
  id: product.id,
  name: product.title,
  price: product.onSale && product.salePrice ? product.salePrice : product.price,
  quantity,
  image: productImage(product),
})

/* ─────────────────────────── Quick View Modal ─────────────────────────── */

export function QuickViewModal({ productId, onClose }: { productId: number; onClose: () => void }) {
  const { data: product, isLoading } = useGetProductByIdQuery(productId)
  const [selectedImage, setSelectedImage] = useState(0)
  const [qty, setQty] = useState(1)
  const addToCart = useAddToCart()

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
                {allImages.length > 0 && (
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

                <span className={`text-xs w-fit px-2.5 py-1 rounded-full font-medium ${product.stockIn > 0 ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-500"}`}>
                  {product.stockIn > 0 ? `${product.stockIn} in stock` : "Out of stock"}
                </span>

                <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>

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

                <div className="flex flex-col gap-2 mt-auto pt-2">
                  <Button
                    className="w-full gap-2"
                    disabled={product.stockIn === 0}
                    onClick={() => { addToCart(toCartItem(product, qty)); onClose() }}
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

/**
 * Wires up Quick View for a page: render `quickView` once, pass
 * `openQuickView` to each card.
 */
export function useQuickView() {
  const [quickViewId, setQuickViewId] = useState<number | null>(null)
  const quickView = quickViewId ? (
    <QuickViewModal productId={quickViewId} onClose={() => setQuickViewId(null)} />
  ) : null
  return { openQuickView: setQuickViewId, quickView }
}

/* ───────────────────────────── Product Card ───────────────────────────── */

export function ProductCard({
  product,
  onQuickView,
}: {
  product: any
  onQuickView?: (id: number) => void
}) {
  const [hovered, setHovered] = useState(false)
  const images = productImages(product)
  const [activeImage, setActiveImage] = useState(0)
  const goImage = (dir: number) =>
    setActiveImage((i) => (i + dir + images.length) % images.length)

  // Show a "See more" that opens Quick View only when the 2-line clamp is
  // actually hiding part of the description — keeps card heights uniform.
  const descRef = useRef<HTMLParagraphElement>(null)
  const [descClamped, setDescClamped] = useState(false)
  useEffect(() => {
    const el = descRef.current
    if (el) setDescClamped(el.scrollHeight > el.clientHeight + 1)
  }, [product.description])
  const cartItems = useSelector((state: RootState) => state.cart.items)
  const currentQty = cartItems.find((item) => item.id === product.id)?.quantity || 0

  const addToCart = useAddToCart()
  const removeFromCart = useRemoveFromCart()
  const updateQuantity = useUpdateCartQuantity()

  const handleIncrement = () => {
    if (currentQty === 0) addToCart(toCartItem(product))
    else if (currentQty < product.stockIn) updateQuantity(product.id, currentQty + 1)
  }

  const handleDecrement = () => {
    if (currentQty > 1) updateQuantity(product.id, currentQty - 1)
    else if (currentQty === 1) removeFromCart(product.id)
  }

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
      {/* Image — a second image (if any) cross-fades in on hover */}
      <div className="relative aspect-square overflow-hidden bg-secondary/20 shrink-0">
        <AnimatePresence mode="wait">
          <motion.img
            key={activeImage}
            src={images[activeImage] ?? images[0]}
            alt={product.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, scale: hovered ? 1.06 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ opacity: { duration: 0.25 }, scale: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>

        {/* Prev / next — appear on hover when there's more than one image */}
        {images.length > 1 && (
          <AnimatePresence>
            {hovered && (
              <>
                <motion.button
                  type="button"
                  aria-label="Previous image"
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  onClick={(e) => { e.preventDefault(); goImage(-1) }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-black/45 text-white flex items-center justify-center hover:bg-black/65 backdrop-blur-sm"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </motion.button>
                <motion.button
                  type="button"
                  aria-label="Next image"
                  initial={{ opacity: 0, x: 6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 6 }}
                  onClick={(e) => { e.preventDefault(); goImage(1) }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-black/45 text-white flex items-center justify-center hover:bg-black/65 backdrop-blur-sm"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </motion.button>
              </>
            )}
          </AnimatePresence>
        )}

        {/* Image count badge */}
        {images.length > 1 && (
          <span className="absolute bottom-2.5 left-2.5 z-10 flex items-center gap-1 rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
            <ImageIcon className="h-2.5 w-2.5" />
            {activeImage + 1}/{images.length}
          </span>
        )}

        {/* Hover overlay — quick view */}
        {onQuickView && (
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
        )}

        {/* Wishlist toggle */}
        <div className="absolute bottom-2.5 right-2.5 z-10">
          <WishlistButton productId={product.id} size="sm" />
        </div>

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

      {/* Thumbnail strip — only when the product has more than one image */}
      {images.length > 1 && (
        <div className="flex gap-1.5 px-2.5 sm:px-3 pt-2.5">
          {images.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => { e.preventDefault(); setActiveImage(i) }}
              aria-label={`View image ${i + 1}`}
              className={`w-9 h-9 sm:w-11 sm:h-11 rounded-md overflow-hidden border-2 transition-colors shrink-0 ${
                i === activeImage ? "border-primary" : "border-transparent hover:border-border"
              }`}
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="p-2.5 sm:p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-1 mb-2">
          <span className="text-[10px] sm:text-xs font-medium text-primary bg-primary/10 px-1.5 sm:px-2 py-0.5 rounded-full truncate max-w-[60%]">
            {product.subCategory?.title}
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
        <div className="flex-1 min-h-0">
          <p
            ref={descRef}
            className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed line-clamp-2"
          >
            {product.description || "No description available"}
          </p>
          {descClamped &&
            (onQuickView ? (
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); onQuickView(product.id) }}
                className="mt-0.5 text-[11px] font-medium text-primary hover:underline"
              >
                See more
              </button>
            ) : (
              <Link
                href={`/products/${product.id}`}
                className="mt-0.5 inline-block text-[11px] font-medium text-primary hover:underline"
              >
                See more
              </Link>
            ))}
        </div>

        <div className="flex items-center gap-1.5 mt-1.5">
          <span className={`text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-medium ${product.stockIn > 0 ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-500"}`}>
            {product.stockIn > 0 ? `${product.stockIn} in stock` : "Out of stock"}
          </span>
        </div>

        <div className="space-y-2 mt-3">
          {/* Quantity controls */}
          {product.stockIn > 0 && (
            <div className="flex items-center justify-between gap-2">
              <span className="text-[9px] sm:text-[10px] text-muted-foreground font-medium">Qty</span>
              <div className="flex items-center gap-1 border border-border rounded-lg overflow-hidden bg-muted/50">
                <button
                  onClick={handleDecrement}
                  disabled={currentQty === 0}
                  className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs"
                >
                  −
                </button>
                <span className="w-6 text-center text-[10px] font-medium">{currentQty}</span>
                <button
                  onClick={handleIncrement}
                  disabled={currentQty >= product.stockIn}
                  className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs"
                >
                  +
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-1.5 sm:gap-2">
            <Link href={`/products/${product.id}`} className="flex-1">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}>
                <Button variant="outline" size="sm" className="w-full bg-transparent text-[10px] sm:text-xs rounded-xl px-1 sm:px-3">
                  Details
                </Button>
              </motion.div>
            </Link>
            {currentQty === 0 && (
              <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}>
                <Button
                  size="sm"
                  onClick={handleIncrement}
                  className="gap-0.5 sm:gap-1 text-[10px] sm:text-xs w-full rounded-xl px-1 sm:px-3"
                  disabled={product.stockIn === 0}
                >
                  <ShoppingCart className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0" />
                  <span className="truncate">{product.stockIn > 0 ? "Add to Cart" : "Out of Stock"}</span>
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
