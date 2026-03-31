import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"

import "./globals.css"
import { Providers } from "./providers"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "Pure Botanics - Organic Beauty Products",
  description:
    "Discover our collection of organic, natural beauty products crafted with the finest botanical ingredients",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <Providers>
          <Header />
          <Suspense fallback={null}>
            <main className="pt-18 [&:has(.hero-fullbleed)]:pt-0">
              {children}
            </main>
          </Suspense>
          <Footer />
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
