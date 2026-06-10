"use client"

import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { hydrate, loadPersistedAuth } from "@/slices/authSlice"
import { useCartSync } from "@/hooks/useCartSync"

// Loads a persisted session from localStorage after mount, client-side only —
// keeps the server-rendered markup (always "logged out") in sync with the
// first client render so React doesn't report a hydration mismatch.
function CartSyncWrapper() {
  useCartSync()
  return null
}

export function AuthHydrator() {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(hydrate(loadPersistedAuth()))
  }, [dispatch])

  return <CartSyncWrapper />
}
