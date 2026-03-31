import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./baseQuery";

const PAYLOAD_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL || "http://localhost:3000";

export const mainMenuApi = createApi({
  reducerPath: "mainMenuApi",
  baseQuery: axiosBaseQuery({ baseUrl: PAYLOAD_URL }),
  endpoints: (builder) => ({
    getMainMenu: builder.query<any, string>({
      query: (slug) => ({
        url: `/api/main-menus`,
        params: { "where[subDomain.code][equals]": slug },
      }),
    }),
  }),
});

export const { useGetMainMenuQuery } = mainMenuApi;
