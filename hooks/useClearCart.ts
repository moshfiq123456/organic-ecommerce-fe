import { useDispatch, useSelector } from "react-redux"
import { clearCart } from "@/slices/cartSlice"
import { useClearCartMutation } from "@/api/cartApi"
import type { RootState } from "@/store/store"

export function useClearCart() {
  const dispatch = useDispatch()
  const user = useSelector((state: RootState) => state.auth.user)
  const [clearCartApi] = useClearCartMutation()

  const handleClearCart = async () => {
    // Always clear local Redux state (for UI)
    dispatch(clearCart())

    // If user is logged in, also sync to backend
    if (user?.id) {
      try {
        await clearCartApi().unwrap()
      } catch (error) {
        console.error("Failed to clear backend cart:", error)
      }
    }
  }

  return handleClearCart
}
