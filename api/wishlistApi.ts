import { createApi } from "@reduxjs/toolkit/query/react"
import { axiosBaseQuery } from "./baseQuery"
import type { Product } from "./productsApi"

const PAYLOAD_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL || "http://localhost:3000"

export interface WishlistItem {
  id: number
  user: number
  product: Product
  createdAt: string
  updatedAt: string
}

interface WishlistResponse {
  docs: WishlistItem[]
}

export const wishlistApi = createApi({
  reducerPath: "wishlistApi",
  baseQuery: axiosBaseQuery({ baseUrl: PAYLOAD_URL }),
  tagTypes: ["Wishlist"],
  endpoints: (builder) => ({
    getWishlist: builder.query<WishlistItem[], void>({
      query: () => ({
        url: "/api/wishlists",
        method: "GET",
        params: { limit: 100, depth: 2 },
      }),
      transformResponse: (response: WishlistResponse) => response.docs,
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "Wishlist" as const, id })), { type: "Wishlist" as const, id: "LIST" }]
          : [{ type: "Wishlist" as const, id: "LIST" }],
    }),
    addToWishlist: builder.mutation<WishlistItem, number>({
      query: (productId) => ({
        url: "/api/wishlists",
        method: "POST",
        data: { product: productId },
      }),
      invalidatesTags: [{ type: "Wishlist", id: "LIST" }],
    }),
    removeFromWishlist: builder.mutation<void, number>({
      query: (wishlistItemId) => ({
        url: `/api/wishlists/${wishlistItemId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Wishlist", id: "LIST" }],
    }),
  }),
})

export const { useGetWishlistQuery, useAddToWishlistMutation, useRemoveFromWishlistMutation } = wishlistApi
