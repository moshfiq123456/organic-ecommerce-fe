import { useDispatch, useSelector } from "react-redux"
import { addToCart } from "@/slices/cartSlice"
import { useAddToCartMutation, useUpdateCartItemMutation } from "@/api/cartApi"
import type { RootState } from "@/store/store"

export function useAddToCart() {
  const dispatch = useDispatch()
  const user = useSelector((state: RootState) => state.auth.user)
  const cartItems = useSelector((state: RootState) => state.cart.items)
  const [addToCartApi] = useAddToCartMutation()
  const [updateCartItemApi] = useUpdateCartItemMutation()

  const handleAddToCart = async (product: {
    id: number
    name: string
    price: number
    quantity?: number
    [key: string]: any
  }) => {
    const qty = product.quantity || 1

    // Always add to local Redux state (for UI)
    dispatch(
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: qty,
        ...product,
      })
    )

    // If user is logged in, also sync to backend
    if (user?.id) {
      try {
        const existingItem = cartItems.find((item) => item.id === product.id)

        if (existingItem?.dbId) {
          // Item already exists in cart - update quantity
          await updateCartItemApi({
            cartItemId: existingItem.dbId,
            quantity: existingItem.quantity + qty,
          }).unwrap()
        } else {
          // New item - add to cart
          await addToCartApi({ productId: product.id, quantity: qty }).unwrap()
        }
      } catch (error) {
        console.error("Failed to sync cart to backend:", error)
      }
    }
  }

  return handleAddToCart
}
