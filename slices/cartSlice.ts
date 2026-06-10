import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  [key: string]: any
}

interface CartState {
  items: CartItem[]
}

const initialState: CartState = {
  items: [],
}

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existing = state.items.find((item) => item.id === action.payload.id)
      if (existing) {
        existing.quantity += 1
      } else {
        state.items.push({ ...action.payload, quantity: 1 })
      }
    },
    removeFromCart: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((item) => item.id !== action.payload)
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ id: number; quantity: number }>
    ) => {
      const item = state.items.find((i) => i.id === action.payload.id)
      if (item) item.quantity = action.payload.quantity
    },
    clearCart: (state) => {
      state.items = []
    },
    syncCartFromBackend: (state, action: PayloadAction<any[]>) => {
      state.items = action.payload.map((item: any) => ({
        id: item.product.id,
        name: item.product.title || item.product.name,
        price: item.itemPrice,
        quantity: item.quantity,
        dbId: item.id,
      }))
    },
  },
})

export const { addToCart, removeFromCart, updateQuantity, clearCart, syncCartFromBackend } =
  cartSlice.actions

export default cartSlice.reducer
