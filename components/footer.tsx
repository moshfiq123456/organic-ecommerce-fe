"use client"

import { useState } from "react"
import Link from "next/link"
import { Leaf, Instagram, Youtube, ArrowRight, Mail, MapPin, Phone, Twitter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"

const footerLinks = {
  Products: [
    { label: "Skincare", href: "/products?category=Skincare" },
    { label: "Haircare", href: "/products?category=Haircare" },
    { label: "Body Care", href: "/products" },
    { label: "Gift Sets", href: "/products" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Sustainability", href: "#" },
    { label: "Ingredients", href: "#" },
  ],
  Support: [
    { label: "FAQ", href: "#" },
    { label: "Shipping", href: "#" },
    { label: "Returns", href: "#" },
    { label: "Privacy Policy", href: "#" },
  ],
}

const socials = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Twitter,   href: "#", label: "Twitter"   },
  { icon: Youtube,   href: "#", label: "YouTube"   },
]

// ── Variants ──────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const linkItem = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

const contactItem = {
  hidden: { opacity: 0, x: -14 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
}

const socialItem = {
  hidden: { opacity: 0, scale: 0.7 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 400, damping: 22 } },
}

const viewport = { once: true, margin: "-60px" }

export function Footer() {
  const [email, setEmail] = useState("")

  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-6 sm:px-10 lg:px-14">

        {/* ── Top: brand + social ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-16 pb-10 border-b border-background/10">

          {/* Brand */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
          >
            <div className="flex items-center gap-2.5 mb-3">
              <motion.div
                className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0"
                whileHover={{ rotate: 20, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
              >
                <Leaf className="h-4 w-4 text-primary-foreground" />
              </motion.div>
              <span className="text-2xl font-light tracking-wide text-background">Pure Botanics</span>
            </div>
            <p className="text-background/40 text-xs font-light tracking-[0.28em] uppercase">
              Pure · Natural · Radiant
            </p>
          </motion.div>

          {/* Social icons */}
          <motion.div
            className="flex items-center gap-2.5"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
          >
            {socials.map(({ icon: Icon, href, label }) => (
              <motion.div key={label} variants={socialItem}>
                <motion.a
                  href={href}
                  aria-label={label}
                  whileHover={{ scale: 1.15, borderColor: "rgba(255,255,255,0.5)" }}
                  whileTap={{ scale: 0.92 }}
                  className="w-9 h-9 rounded-full border border-background/15 flex items-center justify-center text-background/45 hover:text-background transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </motion.a>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* ── Newsletter ── */}
        <motion.div
          className="py-10 border-b border-background/10"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          <div className="max-w-md">
            <p className="text-background/40 text-xs uppercase tracking-[0.25em] mb-2">Stay in the loop</p>
            <h3 className="text-xl font-light text-background mb-5">
              Exclusive offers &amp; skincare tips
            </h3>
            <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background/8 border-background/15 text-background placeholder:text-background/30 focus-visible:ring-primary/40 flex-1"
              />
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}>
                <Button type="submit" size="sm" className="gap-1.5 px-5 shrink-0">
                  Subscribe <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </motion.div>
            </form>
          </div>
        </motion.div>

        {/* ── Link columns ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10 border-b border-background/10">

          {/* Contact */}
          <motion.div
            className="col-span-2 md:col-span-1 space-y-4"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
          >
            <h4 className="text-xs font-medium tracking-[0.22em] uppercase text-background/40">
              Get in Touch
            </h4>
            <motion.ul
              className="space-y-3 text-sm"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={viewport}
            >
              {[
                { icon: Mail,    text: "hello@purebotanics.com" },
                { icon: Phone,   text: "+1 (800) 123-4567"      },
                { icon: MapPin,  text: "San Francisco, CA"       },
              ].map(({ icon: Icon, text }) => (
                <motion.li
                  key={text}
                  variants={contactItem}
                  className="flex items-start gap-2.5 text-background/55"
                >
                  <Icon className="h-4 w-4 mt-0.5 shrink-0 text-primary/70" />
                  <span>{text}</span>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          {/* Dynamic link sections */}
          {Object.entries(footerLinks).map(([section, links], colIdx) => (
            <motion.div
              key={section}
              className="space-y-4"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewport}
              transition={{ delay: colIdx * 0.07 }}
            >
              <h4 className="text-xs font-medium tracking-[0.22em] uppercase text-background/40">
                {section}
              </h4>
              <motion.ul
                className="space-y-2.5 text-sm"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={viewport}
              >
                {links.map(({ label, href }) => (
                  <motion.li key={label} variants={linkItem}>
                    <motion.div whileHover={{ x: 4 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                      <Link
                        href={href}
                        className="text-background/50 hover:text-background transition-colors"
                      >
                        {label}
                      </Link>
                    </motion.div>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>
          ))}
        </div>

        {/* ── Bottom bar ── */}
        <motion.div
          className="py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-background/30"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          <p>© 2025 Pure Botanics. All rights reserved.</p>
          <div className="flex items-center gap-5">
            {["Privacy", "Terms", "Cookies"].map((item) => (
              <motion.div key={item} whileHover={{ y: -1 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
                <Link href="#" className="hover:text-background/55 transition-colors">{item}</Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>
    </footer>
  )
}
