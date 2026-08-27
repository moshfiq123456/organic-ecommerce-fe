import { createApi } from "@reduxjs/toolkit/query/react"
import { axiosBaseQuery } from "./baseQuery"

const PAYLOAD_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL || "http://localhost:3000"

export interface PaymentSettings {
  id: number
  codEnabled: boolean
  codTitle?: string
  codDescription?: string
  preorderEnabled: boolean
  preorderTitle?: string
  preorderDescription?: string
  bkashNumber?: string
  instructionsTitle?: string
  instructions?: { step: string }[]
  /** Flat delivery fee for addresses inside Dhaka (৳). */
  deliveryInsideDhaka?: number
  /** Flat delivery fee for addresses outside Dhaka (৳). */
  deliveryOutsideDhaka?: number
}

/** Used when a sub-domain has no settings record yet. */
export const defaultPaymentSettings: PaymentSettings = {
  id: 0,
  codEnabled: true,
  codTitle: "Pay on Delivery",
  codDescription: "Pay with cash when your order arrives.",
  preorderEnabled: true,
  preorderTitle: "Pre-order — Pay with bKash",
  preorderDescription:
    "Payment is made in advance. We confirm your order once the payment is verified.",
  bkashNumber: "",
  instructionsTitle: "How payment works",
  instructions: [],
  deliveryInsideDhaka: 60,
  deliveryOutsideDhaka: 120,
}

/** Replaces {amount}, {bkashNumber} and {orderNumber} in an instruction step. */
export const fillInstruction = (
  step: string,
  vars: { amount?: string; bkashNumber?: string; orderNumber?: string },
) =>
  step
    .replace(/\{amount\}/g, vars.amount ?? "")
    .replace(/\{bkashNumber\}/g, vars.bkashNumber ?? "")
    .replace(/\{orderNumber\}/g, vars.orderNumber ?? "")

export const paymentSettingsApi = createApi({
  reducerPath: "paymentSettingsApi",
  baseQuery: axiosBaseQuery({ baseUrl: PAYLOAD_URL }),
  endpoints: (builder) => ({
    getPaymentSettings: builder.query<PaymentSettings, string>({
      query: (subdomain) => ({
        url: "/api/payment-settings",
        method: "GET",
        params: { "where[subDomain.code][equals]": subdomain, limit: 1, depth: 0 },
      }),
      transformResponse: (response: any) => response?.docs?.[0] ?? defaultPaymentSettings,
    }),
  }),
})

export const { useGetPaymentSettingsQuery } = paymentSettingsApi
