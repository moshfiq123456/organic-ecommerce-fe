import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./baseQuery";

const PAYLOAD_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL || "http://localhost:3000";

export interface SocialItem {
  id: string;
  socialAccount: {
    id: number;
    title: string;
    url: string;
  };
  url: string;
}

export interface SocialMenuDoc {
  id: number;
  title: string;
  subDomain: { id: number; title: string; code: string };
  items: SocialItem[];
}

export interface SocialMenuResponse {
  docs: SocialMenuDoc[];
}

export const socialMenuApi = createApi({
  reducerPath: "socialMenuApi",
  baseQuery: axiosBaseQuery({ baseUrl: PAYLOAD_URL }),
  endpoints: (builder) => ({
    getSocialMenu: builder.query<SocialMenuResponse, string>({
      query: (code) => ({
        url: `/api/social-account-menus`,
        params: { "where[subDomain.code][equals]": code },
      }),
    }),
  }),
});

export const { useGetSocialMenuQuery } = socialMenuApi;
