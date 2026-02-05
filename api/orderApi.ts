import { createApi } from "@reduxjs/toolkit/query/react"
import { axiosBaseQuery } from "./baseQuery"

const BASE_URL =
  process.env.NEXT_PUBLIC_PAYLOAD_URL || "http://localhost:3000"

export interface OrderItemPayload {
  product: number
  quantity: number
}

export interface CreateOrderPayload {
  orderItems: OrderItemPayload[]
  paymentMethod: string
  transactionId: string | null
  phone: string
  city: string
  address: string
  status: number
  notes: string | null
  customerName: string
}

export const ordersApi = createApi({
  reducerPath: "ordersApi",
  baseQuery: axiosBaseQuery({ baseUrl: BASE_URL }),
  tagTypes: ["Orders"],
  endpoints: (builder) => ({
    createOrder: builder.mutation<any, CreateOrderPayload>({
      query: (data) => ({
        url: "/api/orders",
        method: "POST",
        data,
      }),
      invalidatesTags: ["Orders"],
    }),
  }),
})

export const { useCreateOrderMutation } = ordersApi
