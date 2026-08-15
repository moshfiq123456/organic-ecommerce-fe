import { createApi } from "@reduxjs/toolkit/query/react"
import { axiosBaseQuery } from "./baseQuery"

const PAYLOAD_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL || "http://localhost:3000"

export interface AppNotification {
  id: number
  title: string
  message: string
  type: "order" | "payment" | "general"
  isRead: boolean
  createdAt: string
  order?: { id: number; orderNumber?: string } | number | null
}

interface NotificationsResponse {
  docs: AppNotification[]
  totalDocs: number
}

export const notificationsApi = createApi({
  reducerPath: "notificationsApi",
  baseQuery: axiosBaseQuery({ baseUrl: PAYLOAD_URL }),
  tagTypes: ["Notifications"],
  endpoints: (builder) => ({
    // Access control limits this to the signed-in user's own notifications.
    getNotifications: builder.query<NotificationsResponse, void>({
      query: () => ({
        url: "/api/notifications",
        method: "GET",
        params: { limit: 20, sort: "-createdAt", depth: 1 },
      }),
      providesTags: ["Notifications"],
    }),
    markNotificationRead: builder.mutation<unknown, number>({
      query: (id) => ({
        url: `/api/notifications/${id}`,
        method: "PATCH",
        data: { isRead: true },
      }),
      invalidatesTags: ["Notifications"],
    }),
  }),
})

export const { useGetNotificationsQuery, useMarkNotificationReadMutation } = notificationsApi
