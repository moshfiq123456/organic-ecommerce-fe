import { createApi } from "@reduxjs/toolkit/query/react"
import { axiosBaseQuery } from "./baseQuery"

const PAYLOAD_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL || "http://localhost:3000"

export interface ForgotPasswordPayload {
  email: string
}

export interface ForgotPasswordResponse {
  message: string
}

export interface ResetPasswordPayload {
  token: string
  email: string
  password: string
}

export interface ResetPasswordResponse {
  message: string
}

export const passwordApi = createApi({
  reducerPath: "passwordApi",
  baseQuery: axiosBaseQuery({ baseUrl: PAYLOAD_URL }),
  endpoints: (builder) => ({
    forgotPassword: builder.mutation<ForgotPasswordResponse, ForgotPasswordPayload>({
      query: (data) => ({
        url: "/api/users/forgot-password",
        method: "POST",
        data,
      }),
    }),
    resetPassword: builder.mutation<ResetPasswordResponse, ResetPasswordPayload>({
      query: (data) => ({
        url: "/api/users/reset-password",
        method: "POST",
        data,
      }),
    }),
  }),
})

export const { useForgotPasswordMutation, useResetPasswordMutation } = passwordApi
