import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useGetCartQuery } from "@/api/cartApi"
import { syncCartFromBackend, clearCart } from "@/slices/cartSlice"
import type { RootState } from "@/store/store"

export function useCartSync() {
  const dispatch = useDispatch()
  const user = useSelector((state: RootState) => state.auth.user)
  const { data: backendCart, isLoading } = useGetCartQuery(undefined, {
    skip: !user?.id,
  })

  useEffect(() => {
    if (user?.id && backendCart) {
      // User is logged in and we have backend cart data - sync it
      dispatch(syncCartFromBackend(backendCart))
    } else if (!user?.id) {
      // User logged out - clear cart to prevent guest seeing logged-in user's cart
      dispatch(clearCart())
    }
  }, [user?.id, backendCart, dispatch])

  return { isLoading }
}
