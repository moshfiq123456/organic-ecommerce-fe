"use client"

import React, { useEffect } from "react"
import { store } from "@/store/store"
import { Provider } from "react-redux"
import { Toaster } from "@/components/ui/sonner"

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const slug = window.location.hostname.split(".")[0]
    console.log(slug)

    const themes = ["just-healthy", "la-luminosite"]
    if (themes.includes(slug)) {
      document.documentElement.setAttribute("data-theme", slug)
    } else {
      document.documentElement.removeAttribute("data-theme")
    }
  }, [])

  return (
    <Provider store={store}>
      {children}
      <Toaster position="top-right" richColors closeButton />
    </Provider>
  )
}
