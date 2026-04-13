import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Cormorant_Garamond, Lora } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { headers } from "next/headers"

import "./globals.css"
import { Providers } from "./providers"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PageLoader } from "@/components/page-loader"
import { FloatingSocial } from "@/components/floating-social"

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-cormorant",
})

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-lora",
})

const SUBDOMAIN_META: Record<string, { title: string; description: string; favicon: string }> = {
  "just-healthy": {
    title: "Just Healthy - Fresh & Organic",
    description: "Discover our range of fresh, healthy, and organic food products.",
    favicon: "/just-healthy.png",
  },
  "la-luminosite": {
    title: "La Luminosité - Organic Beauty Products",
    description: "Discover our collection of organic, natural beauty products crafted with the finest botanical ingredients.",
    favicon: "/la-luminosite.png",
  },
}

export async function generateMetadata(): Promise<Metadata> {
  const headersList = headers()
  const host = headersList.get("host") ?? ""
  const slug = host.split(":")[0].split(".")[0]
  const meta = SUBDOMAIN_META[slug] ?? SUBDOMAIN_META["la-luminosite"]

  return {
    title: meta.title,
    description: meta.description,
    icons: { icon: meta.favicon, apple: meta.favicon },
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const headersList = headers()
  const host = headersList.get("host") ?? ""
  const slug = host.split(":")[0].split(".")[0]
  const knownThemes = ["just-healthy", "la-luminosite"]
  const theme = knownThemes.includes(slug) ? slug : undefined
  const isKnown = knownThemes.includes(slug)

  return (
    <html lang="en" {...(theme ? { "data-theme": theme } : {})}>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} ${cormorant.variable} ${lora.variable} antialiased`}>
        <Providers slug={slug}>
          {isKnown && <PageLoader />}
          {isKnown && <Header />}
          <Suspense fallback={null}>
            <main className={isKnown ? "pt-18 [&:has(.hero-fullbleed)]:pt-0" : ""}>
              {children}
            </main>
          </Suspense>
          {isKnown && <Footer />}
          {isKnown && <FloatingSocial />}
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
