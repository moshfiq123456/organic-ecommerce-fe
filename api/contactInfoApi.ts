import { createApi } from "@reduxjs/toolkit/query/react"
import { axiosBaseQuery } from "./baseQuery"

const PAYLOAD_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL || "http://localhost:3000"

export interface ContactInfoDoc {
  id: number
  title: string
  emails: { email: string; id: string }[]
  phones: { phone: string; label: string; id: string }[]
  address: string
  businessHours: { day: string; hours: string; id: string }[]
  subDomain: { id: number; title: string; code: string }
}

export interface ContactInfoResponse {
  docs: ContactInfoDoc[]
}

export const contactInfoApi = createApi({
  reducerPath: "contactInfoApi",
  baseQuery: axiosBaseQuery({ baseUrl: PAYLOAD_URL }),
  endpoints: (builder) => ({
    getContactInfo: builder.query<ContactInfoResponse, string>({
      query: (code) => ({
        url: "/api/contact-info",
        params: { "where[subDomain.code][equals]": code },
      }),
    }),
  }),
})

export const { useGetContactInfoQuery } = contactInfoApi
