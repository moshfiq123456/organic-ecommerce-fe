import { createApi } from "@reduxjs/toolkit/query/react"
import { axiosBaseQuery } from "./baseQuery"
import type { Product } from "./productsApi"

const PAYLOAD_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL || "http://localhost:3000"

export interface CartItem {
  id: number
  user: number
  product: Product
  quantity: number
  itemPrice: number
  totalPrice: number
  status: "active" | "completed"
  createdAt: string
  updatedAt: string
}

interface CartResponse {
  docs: CartItem[]
}

export const cartApi = createApi({
  reducerPath: "cartApi",
  baseQuery: axiosBaseQuery({ baseUrl: PAYLOAD_URL }),
  tagTypes: ["Cart"],
  endpoints: (builder) => ({
    getCart: builder.query<CartItem[], void>({
      query: () => ({
        url: "/api/carts",
        method: "GET",
        params: { limit: 100, depth: 2, where: { status: { equals: "active" } } },
      }),
      transformResponse: (response: CartResponse) => response.docs,
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "Cart" as const, id })), { type: "Cart" as const, id: "LIST" }]
          : [{ type: "Cart" as const, id: "LIST" }],
    }),
    addToCart: builder.mutation<CartItem, { productId: number; quantity: number }>({
      query: ({ productId, quantity }) => ({
        url: "/api/carts",
        method: "POST",
        data: { product: productId, quantity },
      }),
      invalidatesTags: [{ type: "Cart", id: "LIST" }],
    }),
    updateCartItem: builder.mutation<CartItem, { cartItemId: number; quantity: number }>({
      query: ({ cartItemId, quantity }) => ({
        url: `/api/carts/${cartItemId}`,
        method: "PATCH",
        data: { quantity },
      }),
      invalidatesTags: [{ type: "Cart", id: "LIST" }],
    }),
    removeFromCart: builder.mutation<void, number>({
      query: (cartItemId) => ({
        url: `/api/carts/${cartItemId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Cart", id: "LIST" }],
    }),
    clearCart: builder.mutation<void, void>({
      query: () => ({
        url: "/api/carts",
        method: "PATCH",
        params: { where: { status: { equals: "active" } } },
        data: { status: "completed" },
      }),
      invalidatesTags: [{ type: "Cart", id: "LIST" }],
    }),
  }),
})

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
} = cartApi
