"use client"

import { createContext, useContext } from "react"

export const SubdomainContext = createContext<string>("")

export function useSubdomain() {
  return useContext(SubdomainContext)
}
