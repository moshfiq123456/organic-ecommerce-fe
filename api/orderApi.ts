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

export interface TrackOrderParams {
  orderId: string
  phone: string
}

export interface OrderItem {
  product: {
    id: string
    title: string
    price: number
    slug: string
  }
  quantity: number
  price: number
}

export interface OrderTrackResponse {
  id: string
  orderItems: OrderItem[]
  status: {
    id: string
    title: string
    code: string
  }
  transactionId: string | null
  customerName: string
  phone: string
  email: string
  city: string
  address: string
  notes: string | null
  totalAmount: number
  paymentMethod: string
  createdAt: string
  updatedAt: string
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
    trackOrder: builder.query<OrderTrackResponse, TrackOrderParams>({
      query: ({ orderId, phone }) => ({
        url: "/api/orders/track",
        params: { orderId, phone },
      }),
    }),
  }),
})

export const { useCreateOrderMutation, useTrackOrderQuery } = ordersApi
