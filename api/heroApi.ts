import { createApi } from "@reduxjs/toolkit/query/react"
import { axiosBaseQuery } from "./baseQuery"

const PAYLOAD_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL || "http://localhost:3000"

export interface HeroItem {
  title: string
  secondaryTitle: string
  description: string
  buttonText: string
  buttonLink: string
  image: { url: string }
  subDomain?: { code: string }
}

export interface HeroResponse {
  title: string
  items: HeroItem[]
}

export const heroApi = createApi({
  reducerPath: "heroApi",
  baseQuery: axiosBaseQuery({ baseUrl: PAYLOAD_URL }),
  endpoints: (builder) => ({
    getHero: builder.query<HeroResponse, string>({
      query: (code) => ({
        url: "/api/globals/hero",
        params: { "where[items.subDomain.code][equals]": code },
      }),
    }),
  }),
})

export const { useGetHeroQuery } = heroApi
