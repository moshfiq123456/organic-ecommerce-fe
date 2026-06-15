import { createApi } from "@reduxjs/toolkit/query/react"
import { axiosBaseQuery } from "./baseQuery"

const PAYLOAD_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL || "http://localhost:3000"

export const aboutApi = createApi({
  reducerPath: "aboutApi",
  baseQuery: axiosBaseQuery({ baseUrl: PAYLOAD_URL }),
  endpoints: (builder) => ({
    getAboutInfo: builder.query<
      {
        id: string
        title?: string
        address?: string
        brandMissionVision?: string
        whyThisPlatform?: string
        sourcingPhilosophy?: string
        media?: Array<{
          type: "photo" | "video"
          url?: {
            id: string
            filename: string
            url: string
          }
        }>
        testimonials?: Array<{
          author: {
            id: string
            firstName: string
            lastName: string
            email: string
          }
          message?: string
        }>
        socialMediaLinks?: Array<{
          socialAccount: {
            id: string
            title: string
            url?: string
          }
        }>
      },
      string
    >({
      query: (subdomain) => ({
        url: "/api/about",
        method: "GET",
        params: {
          "where[subDomain.code][equals]": subdomain,
        },
      }),
      transformResponse: (response: any) => response.docs?.[0] || {},
    }),

    getAllAbout: builder.query<
      {
        docs: Array<{
          id: string
          title?: string
          address?: string
          brandMissionVision?: string
          whyThisPlatform?: string
          sourcingPhilosophy?: string
          media?: Array<{
            type: "photo" | "video"
            url?: {
              id: string
              filename: string
              url: string
            }
          }>
          testimonials?: Array<{
            author: {
              id: string
              firstName: string
              lastName: string
              email: string
            }
            message?: string
          }>
        }>
      },
      void
    >({
      query: () => ({
        url: "/api/about",
        method: "GET",
      }),
    }),
  }),
})

export const { useGetAboutInfoQuery, useGetAllAboutQuery } = aboutApi
