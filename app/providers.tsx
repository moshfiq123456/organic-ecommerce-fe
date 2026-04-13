"use client"

import React from "react"
import { store } from "@/store/store"
import { Provider } from "react-redux"
import { Toaster } from "@/components/ui/sonner"
import { SubdomainContext } from "@/context/SubdomainContext"

export function Providers({ children, slug }: { children: React.ReactNode; slug: string }) {
  return (
    <SubdomainContext.Provider value={slug}>
      <Provider store={store}>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </Provider>
    </SubdomainContext.Provider>
  )
}
