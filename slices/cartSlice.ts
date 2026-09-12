import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  /** Brand this product belongs to (its category `code`, e.g. "just-healthy").
   * Used to keep each brand's cart separate on its own subdomain. */
  categoryCode?: string
  [key: string]: any
}

interface CartState {
  items: CartItem[]
  /**
   * Increments only when the user explicitly adds something to the cart.
   * Loading the cart from the backend (e.g. right after login) does NOT
   * bump it — that's what stops the cart drawer opening on its own.
   */
  addSeq: number
}

const initialState: CartState = {
  items: [],
  addSeq: 0,
}

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem & { silent?: boolean }>) => {
      const { silent, ...payload } = action.payload
      const existing = state.items.find((item) => item.id === payload.id)
      if (existing) {
        existing.quantity += 1
      } else {
        state.items.push({ ...payload, quantity: 1 })
      }
      // A `silent` add (e.g. the inline +/- stepper on a card) updates the cart
      // without popping the drawer open; only explicit adds bump the counter.
      if (!silent) state.addSeq += 1
    },
    removeFromCart: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((item) => item.id !== action.payload)
    },
    // Remove a set of items by product id — used after checkout to clear only
    // the ordered (current-brand) items, leaving the other brand's cart intact.
    removeItemsByIds: (state, action: PayloadAction<number[]>) => {
      const ids = new Set(action.payload)
      state.items = state.items.filter((item) => !ids.has(item.id))
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
        categoryCode: item.product?.subCategory?.category?.code,
      }))
    },
  },
})

export const {
  addToCart,
  removeFromCart,
  removeItemsByIds,
  updateQuantity,
  clearCart,
  syncCartFromBackend,
} = cartSlice.actions

export default cartSlice.reducer
