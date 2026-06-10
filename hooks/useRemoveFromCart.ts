import { useDispatch, useSelector } from "react-redux"
import { removeFromCart } from "@/slices/cartSlice"
import { useRemoveFromCartMutation } from "@/api/cartApi"
import type { RootState } from "@/store/store"

export function useRemoveFromCart() {
  const dispatch = useDispatch()
  const user = useSelector((state: RootState) => state.auth.user)
  const cartItems = useSelector((state: RootState) => state.cart.items)
  const [removeFromCartApi] = useRemoveFromCartMutation()

  const handleRemoveFromCart = async (itemId: number) => {
    const item = cartItems.find((i) => i.id === itemId)

    // Always remove from local Redux state (for UI)
    dispatch(removeFromCart(itemId))

    // If user is logged in and item has dbId, also sync to backend
    if (user?.id && item?.dbId) {
      try {
        await removeFromCartApi(item.dbId).unwrap()
      } catch (error) {
        console.error("Failed to remove from backend cart:", error)
      }
    }
  }

  return handleRemoveFromCart
}
