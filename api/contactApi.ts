import { createApi } from "@reduxjs/toolkit/query/react"
import { axiosBaseQuery } from "./baseQuery"

const PAYLOAD_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL || "http://localhost:3000"

export const contactApi = createApi({
  reducerPath: "contactApi",
  baseQuery: axiosBaseQuery({ baseUrl: PAYLOAD_URL }),
  endpoints: (builder) => ({
    submitContact: builder.mutation<void, {
      title: string
      email: string
      phone: string
      message: string
      subDomain: string
    }>({
      query: (body) => ({
        url: "/api/contacts",
        method: "POST",
        data: body,
      }),
    }),
  }),
})

export const { useSubmitContactMutation } = contactApi
