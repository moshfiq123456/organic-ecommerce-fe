import { createApi } from "@reduxjs/toolkit/query/react"
import { axiosBaseQuery } from "./baseQuery"

const PAYLOAD_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL || "http://localhost:3000"

export const supportApi = createApi({
  reducerPath: "supportApi",
  baseQuery: axiosBaseQuery({ baseUrl: PAYLOAD_URL }),
  tagTypes: ["Support", "Tickets"],
  endpoints: (builder) => ({
    createGuestTicket: builder.mutation<
      {
        message: string
        ticket: {
          id: number
          ticketNumber: string
          subject: string
          status: string
        }
      },
      {
        guestName: string
        guestEmail: string
        subject: string
        description: string
        category: string
        priority?: string
      }
    >({
      query: (body) => ({
        url: "/api/support/guest-create",
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["Tickets"],
    }),

    getGuestTickets: builder.query<
      {
        tickets: Array<{
          id: number
          ticketNumber: string
          subject: string
          category: string
          priority: string
          status: string
          createdAt: string
          updatedAt: string
          repliesCount: number
        }>
        total: number
      },
      string
    >({
      query: (guestEmail) => ({
        url: "/api/support/get-guest-tickets",
        method: "POST",
        data: { guestEmail },
      }),
      providesTags: ["Tickets"],
    }),

    getTicketDetail: builder.query<
      {
        id: number
        ticketNumber: string
        subject: string
        description: string
        category: string
        priority: string
        status: string
        guestEmail?: string
        guestName?: string
        user?: { id: string; firstName: string; lastName: string; email: string }
        replies: Array<{
          authorName: string
          isStaff: boolean
          message: string
          createdAt?: string
        }>
        createdAt: string
        updatedAt: string
      },
      number | string
    >({
      query: (ticketId) => ({
        url: `/api/support?where[id][equals]=${ticketId}`,
        method: "GET",
      }),
      transformResponse: (response: any) => response.docs?.[0] || {},
      providesTags: ["Support"],
    }),

    addReply: builder.mutation<
      {
        message: string
        ticket: {
          id: number
          ticketNumber: string
          repliesCount: number
          emailSent: boolean
        }
      },
      {
        ticketId: string | number
        authorName: string
        message: string
        sendEmail?: boolean
      }
    >({
      query: (body) => ({
        url: "/api/support/reply",
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["Support", "Tickets"],
    }),

    sendDirectMessage: builder.mutation<
      {
        message: string
        success: boolean
      },
      {
        ticketId: string | number
        message: string
        subject?: string
      }
    >({
      query: (body) => ({
        url: "/api/support/send-message",
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["Support"],
    }),

    getUserTickets: builder.query<
      {
        docs: Array<{
          id: number
          ticketNumber: string
          subject: string
          category: string
          priority: string
          status: string
          createdAt: string
          updatedAt: string
        }>
        totalDocs: number
      },
      void
    >({
      query: () => ({
        url: "/api/support",
        method: "GET",
      }),
      providesTags: ["Tickets"],
    }),
  }),
})

export const {
  useCreateGuestTicketMutation,
  useGetGuestTicketsQuery,
  useGetTicketDetailQuery,
  useAddReplyMutation,
  useSendDirectMessageMutation,
  useGetUserTicketsQuery,
} = supportApi
