import { createApi } from "@reduxjs/toolkit/query/react"
import { axiosBaseQuery } from "./baseQuery"
import { wishlistApi } from "./wishlistApi"
import { cartApi } from "./cartApi"
import { setCredentials, clearCredentials, updateUser, type AuthUser } from "@/slices/authSlice"
import { clearCart } from "@/slices/cartSlice"

const PAYLOAD_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL || "http://localhost:3000"

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  message: string
  user: AuthUser
  token: string
  exp: number
}

export interface RegisterPayload {
  firstName: string
  lastName: string
  email: string
  password: string
  phone: string
  address?: string
}

export type RegisterResponse = LoginResponse

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: axiosBaseQuery({ baseUrl: PAYLOAD_URL }),
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginPayload>({
      query: (data) => ({
        url: "/api/users/login",
        method: "POST",
        data,
      }),
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled
          dispatch(setCredentials({ user: data.user, token: data.token }))
        } catch {
          // login failed — error surfaced to the caller via the mutation result
        }
      },
    }),
    register: builder.mutation<RegisterResponse, RegisterPayload>({
      query: (data) => ({
        url: "/api/users/register",
        method: "POST",
        data,
      }),
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled
          dispatch(setCredentials({ user: data.user, token: data.token }))
        } catch {
          // registration failed — error surfaced to the caller via the mutation result
        }
      },
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/api/users/logout",
        method: "POST",
      }),
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled
        } finally {
          dispatch(clearCredentials())
          dispatch(clearCart())
          // Invalidate tags to force refetch and clear cached data immediately
          dispatch(wishlistApi.util.invalidateTags(["Wishlist"]))
          dispatch(cartApi.util.invalidateTags(["Cart"]))
        }
      },
    }),
    getMe: builder.query<{ user: AuthUser | null }, void>({
      query: () => ({
        url: "/api/users/me",
        method: "GET",
      }),
    }),
    /**
     * Update the signed-in user's own profile. The backend only allows a user
     * to update their own record (`isSelf`), and `role` is locked at field
     * level, so this can't be used to change permissions.
     */
    updateProfile: builder.mutation<
      { doc: AuthUser },
      { id: number; firstName?: string; lastName?: string; phone?: string; address?: string }
    >({
      query: ({ id, ...data }) => ({
        url: `/api/users/${id}`,
        method: "PATCH",
        data,
      }),
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled
          if (data?.doc) dispatch(updateUser(data.doc))
        } catch {
          // failure surfaced to the caller via the mutation result
        }
      },
    }),
  }),
})

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetMeQuery,
  useUpdateProfileMutation,
} = authApi
