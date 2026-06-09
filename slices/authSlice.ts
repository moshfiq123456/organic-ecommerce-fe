import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export interface AuthUser {
  id: number
  email: string
  firstName: string
  lastName: string
  phone: string
  role: "client" | "editor" | "admin"
  [key: string]: any
}

interface AuthState {
  user: AuthUser | null
  token: string | null
  /** Becomes true once the client has checked localStorage for a persisted session. */
  hydrated: boolean
}

const STORAGE_KEY = "auth"

// Always start "logged out" so server and client render the same markup —
// the persisted session (if any) is loaded client-side after mount via `hydrate`.
const initialState: AuthState = { user: null, token: null, hydrated: false }

function persist(state: Pick<AuthState, "user" | "token">) {
  if (typeof window === "undefined") return
  if (state.token && state.user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
}

export function loadPersistedAuth(): { user: AuthUser; token: string } | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed?.user && parsed?.token) return { user: parsed.user, token: parsed.token }
    return null
  } catch {
    return null
  }
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: AuthUser; token: string }>) => {
      state.user = action.payload.user
      state.token = action.payload.token
      persist(state)
    },
    clearCredentials: (state) => {
      state.user = null
      state.token = null
      persist(state)
    },
    hydrate: (state, action: PayloadAction<{ user: AuthUser; token: string } | null>) => {
      if (action.payload) {
        state.user = action.payload.user
        state.token = action.payload.token
      }
      state.hydrated = true
    },
  },
})

export const { setCredentials, clearCredentials, hydrate } = authSlice.actions
export default authSlice.reducer
