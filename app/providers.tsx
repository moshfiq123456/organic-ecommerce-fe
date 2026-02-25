"use client"

import React from "react"
import { store } from "@/store/store"
import { Provider } from "react-redux"
import { Toaster } from "@/components/ui/sonner"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      {children}
      <Toaster position="top-right" richColors closeButton />
    </Provider>
  )
}
