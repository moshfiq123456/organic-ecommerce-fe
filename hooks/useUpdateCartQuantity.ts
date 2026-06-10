import { useDispatch, useSelector } from "react-redux"
import { updateQuantity } from "@/slices/cartSlice"
import { useUpdateCartItemMutation } from "@/api/cartApi"
import type { RootState } from "@/store/store"

export function useUpdateCartQuantity() {
  const dispatch = useDispatch()
  const user = useSelector((state: RootState) => state.auth.user)
  const cartItems = useSelector((state: RootState) => state.cart.items)
  const [updateCartItemApi] = useUpdateCartItemMutation()

  const handleUpdateQuantity = async (itemId: number, quantity: number) => {
    const item = cartItems.find((i) => i.id === itemId)

    // Always update local Redux state (for UI)
    dispatch(updateQuantity({ id: itemId, quantity }))

    // If user is logged in and item has dbId, also sync to backend
    if (user?.id && item?.dbId) {
      try {
        await updateCartItemApi({
          cartItemId: item.dbId,
          quantity,
        }).unwrap()
      } catch (error) {
        console.error("Failed to update backend cart:", error)
      }
    }
  }

  return handleUpdateQuantity
}
