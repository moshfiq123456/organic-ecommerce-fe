import { createApi } from "@reduxjs/toolkit/query/react"
import { axiosBaseQuery } from "./baseQuery"

const PAYLOAD_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL || "http://localhost:3000"

export interface Faq {
  id: number
  question: string
  answer: string
  isAvailable?: boolean
  subDomain?: { code: string } | null
}

export interface FaqResponse {
  docs: Faq[]
  totalDocs: number
}

export const faqApi = createApi({
  reducerPath: "faqApi",
  baseQuery: axiosBaseQuery({ baseUrl: PAYLOAD_URL }),
  endpoints: (builder) => ({
    // Available FAQs for this sub-domain, plus global FAQs (no sub-domain set).
    getFaqs: builder.query<FaqResponse, string>({
      query: (subdomain) => ({
        url: "/api/faqs",
        method: "GET",
        params: {
          "where[and][0][isAvailable][equals]": true,
          "where[and][1][or][0][subDomain.code][equals]": subdomain,
          "where[and][1][or][1][subDomain][exists]": false,
          limit: 100,
          depth: 1,
          sort: "createdAt",
        },
      }),
    }),
  }),
})

export const { useGetFaqsQuery } = faqApi
