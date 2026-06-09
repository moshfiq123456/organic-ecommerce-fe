"use client"

import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { Heart, Loader2, ShoppingBag, Trash2 } from "lucide-react"

import { getImageUrl } from "@/api/productsApi"
import { useGetWishlistQuery, useRemoveFromWishlistMutation, type WishlistItem } from "@/api/wishlistApi"
import { Button } from "@/components/ui/button"
import { RequireAuth } from "@/components/require-auth"

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
  const { data: items, isLoading, isFetching } = useGetWishlistQuery()
  const [removeFromWishlist, { isLoading: isRemoving }] = useRemoveFromWishlistMutation()

  const handleRemove = async (item: WishlistItem) => {
    try {
      await removeFromWishlist(item.id).unwrap()
      toast.success(`Removed "${item.product.title}" from your wishlist`)
    } catch {
      toast.error("Couldn't remove this item. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-secondary/20 py-16 px-4">
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
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.25 }}
                  className="bg-card rounded-2xl overflow-hidden border border-border shadow-sm flex flex-col"
                >
                  <Link href={`/products/${item.product.id}`} className="relative aspect-square overflow-hidden bg-secondary/20 block">
                    <img
                      src={getImageUrl(item.product.image?.thumbnailURL || item.product.image?.url)}
                      alt={item.product.title}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  <div className="p-2.5 sm:p-4 flex flex-col flex-1">
                    <h3 className="font-semibold text-foreground text-xs sm:text-sm mb-1 line-clamp-2">
                      <Link href={`/products/${item.product.id}`} className="hover:text-primary transition-colors">
                        {item.product.title}
                      </Link>
                    </h3>

                    <div className="mt-1">
                      {item.product.onSale && item.product.salePrice ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs sm:text-sm font-semibold text-primary">৳{item.product.salePrice}</span>
                          <span className="text-[10px] text-muted-foreground line-through">৳{item.product.price}</span>
                        </div>
                      ) : (
                        <span className="text-xs sm:text-sm font-semibold text-primary">৳{item.product.price}</span>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemove(item)}
                      disabled={isRemoving || isFetching}
                      className="gap-1.5 text-[10px] sm:text-xs w-full rounded-xl mt-3"
                    >
                      <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      Remove
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
