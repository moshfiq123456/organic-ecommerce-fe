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
  /** `cod` = pay on delivery, `preorder` = paid up front via bKash. */
  orderType: "cod" | "preorder"
  paymentMethod: string
  transactionId: string | null
  /** bKash account the customer paid from — required for pre-orders. */
  bkashNumber?: string | null
  phone: string
  email: string
  city: string
  /** Delivery area the customer chose — the backend resolves the charge from it. */
  deliveryZone: "inside_dhaka" | "outside_dhaka"
  address: string
  status: number
  notes: string | null
  customerName: string
}

export interface TrackOrderParams {
  orderNumber: string
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
  deliveryZone?: "inside_dhaka" | "outside_dhaka"
  deliveryCharge?: number
  address: string
  notes: string | null
  totalAmount: number
  paymentMethod: string
  createdAt: string
  updatedAt: string
}

export interface MyOrder {
  id: number
  orderNumber: string
  orderItems: OrderItem[]
  status: { id: number; title: string; code: string } | null
  transactionId: string | null
  customerName: string
  phone: string
  email: string
  city: string
  deliveryZone?: "inside_dhaka" | "outside_dhaka"
  deliveryCharge?: number
  address: string
  totalAmount: number
  paymentMethod: string
  paymentStatus?: string
  orderType?: string
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
    getMyOrders: builder.query<MyOrder[], void>({
      query: () => ({
        url: "/api/orders/mine",
        method: "GET",
      }),
      providesTags: ["Orders"],
    }),
    trackOrder: builder.query<OrderTrackResponse, TrackOrderParams>({
      query: ({ orderNumber, phone }) => ({
        url: "/api/orders/track",
        params: { orderNumber, phone },
      }),
    }),
  }),
})

export const { useCreateOrderMutation, useTrackOrderQuery, useGetMyOrdersQuery } = ordersApi
