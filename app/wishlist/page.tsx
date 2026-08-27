"use client"

import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, Loader2, ShoppingBag } from "lucide-react"

import { useGetWishlistQuery } from "@/api/wishlistApi"
import { Button } from "@/components/ui/button"
import { RequireAuth } from "@/components/require-auth"
import { ProductCard, useQuickView } from "@/components/product-card"

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.4, ease: "easeOut" as const },
})

export default function WishlistPage() {
  return (
    <RequireAuth>
      <WishlistContent />
    </RequireAuth>
  )
}

function WishlistContent() {
  const { data: items, isLoading } = useGetWishlistQuery()
  const { openQuickView, quickView } = useQuickView()

  return (
    <div className="min-h-screen bg-secondary/20 py-16 px-4">
      {quickView}
      <motion.div {...fadeUp()} className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
            <Heart className="w-6 h-6 text-primary" /> My Wishlist
          </h1>
          <p className="text-muted-foreground text-sm">Products you've saved for later</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : !items || items.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center gap-3 py-24 bg-background rounded-2xl border border-border">
            <Heart className="w-10 h-10 text-muted-foreground/40" />
            <p className="text-foreground font-medium">Your wishlist is empty</p>
            <p className="text-muted-foreground text-sm max-w-sm">
              Tap the heart icon on any product to save it here for later.
            </p>
            <Link href="/products">
              <Button className="gap-2 mt-2">
                <ShoppingBag className="w-4 h-4" /> Browse Products
              </Button>
            </Link>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <ProductCard key={item.id} product={item.product} onQuickView={openQuickView} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
