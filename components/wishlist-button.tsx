"use client"

import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { Heart, Loader2 } from "lucide-react"

import type { RootState } from "@/store/store"
import { useGetWishlistQuery, useAddToWishlistMutation, useRemoveFromWishlistMutation } from "@/api/wishlistApi"
import { cn } from "@/lib/utils"

interface WishlistButtonProps {
  productId: number
  className?: string
  size?: "sm" | "md"
}

const SIZE_CLASSES: Record<"sm" | "md", { button: string; icon: string }> = {
  sm: { button: "h-8 w-8", icon: "h-3.5 w-3.5" },
  md: { button: "h-10 w-10", icon: "h-4 w-4" },
}

// Saves/removes a product from the signed-in user's wishlist (backend `wishlists`
// collection). Guests are prompted to sign in rather than silently failing, since
// the collection requires authentication to create entries.
export function WishlistButton({ productId, className, size = "md" }: WishlistButtonProps) {
  const router = useRouter()
  const user = useSelector((state: RootState) => state.auth.user)

  const { data: items } = useGetWishlistQuery(undefined, { skip: !user })
  const [addToWishlist, { isLoading: isAdding }] = useAddToWishlistMutation()
  const [removeFromWishlist, { isLoading: isRemoving }] = useRemoveFromWishlistMutation()

  const wishlistItem = items?.find((item) => item.product?.id === productId)
  const isSaved = !!wishlistItem
  const isBusy = isAdding || isRemoving
  const { button: buttonSize, icon: iconSize } = SIZE_CLASSES[size]

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      toast("Sign in to save products to your wishlist", {
        action: { label: "Sign in", onClick: () => router.push("/login") },
      })
      return
    }

    try {
      if (wishlistItem) {
        await removeFromWishlist(wishlistItem.id).unwrap()
        toast.success("Removed from wishlist")
      } else {
        await addToWishlist(productId).unwrap()
        toast.success("Added to wishlist")
      }
    } catch {
      toast.error("Something went wrong. Please try again.")
    }
  }

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      disabled={isBusy}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={isSaved}
      className={cn(
        "inline-flex items-center justify-center rounded-full border shrink-0 transition-colors disabled:opacity-60",
        isSaved
          ? "bg-primary/10 border-primary/30 text-primary"
          : "bg-background/80 border-border text-muted-foreground hover:text-primary hover:border-primary/30",
        buttonSize,
        className
      )}
    >
      {isBusy ? (
        <Loader2 className={cn(iconSize, "animate-spin")} />
      ) : (
        <Heart className={cn(iconSize, isSaved && "fill-current")} />
      )}
    </motion.button>
  )
}
