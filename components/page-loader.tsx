"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSubdomain } from "@/context/SubdomainContext"

const BRAND: Record<string, { name: string; fontClass: string }> = {
  "just-healthy": { name: "Just Healthy", fontClass: "font-(family-name:--font-lora)" },
  "la-luminosite": { name: "La Luminosité", fontClass: "font-(family-name:--font-cormorant)" },
}

export function PageLoader() {
  const [visible, setVisible] = useState(false)
  const slug = useSubdomain()
  const brand = BRAND[slug] ?? BRAND["la-luminosite"]

  useEffect(() => {
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined
    const type = nav?.type

    if (type === "reload" || type === "back_forward") {
      // Reset scroll position instantly
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior })
      setVisible(true)
      const t = setTimeout(() => setVisible(false), 1200)
      return () => clearTimeout(t)
    }
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="page-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center gap-6 pointer-events-none"
        >
          {/* Brand name */}
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={`${brand.fontClass} text-3xl font-semibold text-foreground tracking-wide`}
          >
            {brand.name}
          </motion.span>

          {/* Thin progress bar */}
          <motion.div className="w-32 h-[1.5px] bg-foreground/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-foreground/40 rounded-full"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 1, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
