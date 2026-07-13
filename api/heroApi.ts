import { createApi } from "@reduxjs/toolkit/query/react"
import { axiosBaseQuery } from "./baseQuery"

const PAYLOAD_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL || "http://localhost:3000"

export interface HeroItem {
  title: string
  secondaryTitle?: string
  description?: string
  buttonText: string
  buttonLink?: string
  image: { url: string }
}

export interface HeroSectionDoc {
  id: number
  title: string
  subDomain?: { code: string }
  items: HeroItem[]
}

export interface HeroResponse {
  docs: HeroSectionDoc[]
  totalDocs: number
}

export const heroApi = createApi({
  reducerPath: "heroApi",
  baseQuery: axiosBaseQuery({ baseUrl: PAYLOAD_URL }),
  endpoints: (builder) => ({
    // Hero is a Payload Collection — one document per sub-domain.
    // Filtering is done server-side by the sub-domain's category code.
    getHero: builder.query<HeroResponse, string>({
      query: (code) => ({
        url: "/api/hero-sections",
        params: {
          "where[subDomain.code][equals]": code,
          depth: 1,
          limit: 1,
        },
      }),
    }),
  }),
})

export const { useGetHeroQuery } = heroApi
