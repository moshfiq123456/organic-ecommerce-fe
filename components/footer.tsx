"use client"

import Link from "next/link"
import { Mail, MapPin, Phone } from "lucide-react"
import { motion } from "framer-motion"
import { useGetSocialMenuQuery } from "@/api/socialMenuApi"
import { useGetContactInfoQuery } from "@/api/contactInfoApi"
import { useGetSubCategoriesQuery } from "@/api/categories"
import { useSubdomain } from "@/context/SubdomainContext"

const footerLinks = {
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Order", href: "/order" },
    { label: "Track Order", href: "/order/track" },
  ],
  // Support: [
  //   { label: "FAQ", href: "#" },
  //   { label: "Shipping", href: "#" },
  //   { label: "Returns", href: "#" },
  //   { label: "Privacy Policy", href: "#" },
  // ],
}

const SocialIcons: Record<string, () => JSX.Element> = {
  facebook: () => (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ),
  instagram: () => (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  ),
  twitter: () => (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
  youtube: () => (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  ),
  linkedin: () => (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  ),
}

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
  const slug = useSubdomain()

  const { data: socialMenuData } = useGetSocialMenuQuery(slug, { skip: !slug })
  const { data: contactInfoData } = useGetContactInfoQuery(slug, { skip: !slug })
  const { data: subCategoriesData } = useGetSubCategoriesQuery({ categoryCode: slug }, { skip: !slug })
  const contactInfo = contactInfoData?.docs?.[0]
  const subcategories = subCategoriesData?.docs ?? []

  const socials = (socialMenuData?.docs?.[0]?.items ?? []).reduce<{ icon: () => JSX.Element; href: string; label: string }[]>((acc, item) => {
    const key = item.socialAccount.title.toLowerCase()
    const icon = SocialIcons[key]
    if (icon) acc.push({ icon, href: item.url, label: item.socialAccount.title })
    return acc
  }, [])

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
              <motion.img
                src={slug === "just-healthy" ? "/just-healthy.png" : "/la-luminosite.png"}
                alt="logo"
                className="h-10 w-auto object-contain brightness-0 invert"
                whileHover={{ scale: 1.08 }}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
              />
              <span className={`${slug === "just-healthy" ? "font-(family-name:--font-lora)" : "font-(family-name:--font-cormorant)"} text-2xl font-light tracking-wide text-background`}>
                {slug === "just-healthy" ? "Just Healthy" : "La Luminosité"}
              </span>
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
                  target="_blank"
                  rel="noopener noreferrer"
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
              {contactInfo?.emails?.length ? (
                <motion.li variants={contactItem} className="flex items-start gap-2.5 text-background/55">
                  <Mail className="h-4 w-4 mt-0.5 shrink-0 text-primary/70" />
                  <span>
                    {contactInfo.emails.map(({ email: e }, i) => (
                      <span key={i}>{e}{i < contactInfo.emails.length - 1 ? ",\n" : ""}</span>
                    ))}
                  </span>
                </motion.li>
              ) : null}
              {contactInfo?.phones?.length ? (
                <motion.li variants={contactItem} className="flex items-start gap-2.5 text-background/55">
                  <Phone className="h-4 w-4 mt-0.5 shrink-0 text-primary/70" />
                  <span className="whitespace-pre-line">
                    {contactInfo.phones.map(({ phone }, i) => (
                      <span key={i}>{phone}{i < contactInfo.phones.length - 1 ? ",\n" : ""}</span>
                    ))}
                  </span>
                </motion.li>
              ) : null}
              {contactInfo?.address && (
                <motion.li variants={contactItem} className="flex items-start gap-2.5 text-background/55">
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary/70" />
                  <span className="whitespace-pre-line">{contactInfo.address}</span>
                </motion.li>
              )}
            </motion.ul>
          </motion.div>

          {/* Products — dynamic subcategories */}
          {subcategories.length > 0 && (
            <motion.div
              className="space-y-4"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewport}
              transition={{ delay: 0 }}
            >
              <h4 className="text-xs font-medium tracking-[0.22em] uppercase text-background/40">Products</h4>
              <motion.ul
                className="space-y-2.5 text-sm"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={viewport}
              >
                {subcategories.map(({ id, title }) => (
                  <motion.li key={id} variants={linkItem}>
                    <motion.div whileHover={{ x: 4 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                      <Link
                        href={`/products?subcategoryId=${id}`}
                        className="text-background/50 hover:text-background transition-colors"
                      >
                        {title}
                      </Link>
                    </motion.div>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>
          )}

          {/* Company */}
          <motion.div
            className="space-y-4"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            transition={{ delay: 0.07 }}
          >
            <h4 className="text-xs font-medium tracking-[0.22em] uppercase text-background/40">Company</h4>
            <motion.ul
              className="space-y-2.5 text-sm"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={viewport}
            >
              {footerLinks.Company.map(({ label, href }) => (
                <motion.li key={label} variants={linkItem}>
                  <motion.div whileHover={{ x: 4 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                    <Link href={href} className="text-background/50 hover:text-background transition-colors">
                      {label}
                    </Link>
                  </motion.div>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        </div>

        {/* ── Bottom bar ── */}
        <motion.div
          className="py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-background/30"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          <p>© 2025 La Luminosité. All rights reserved.</p>
          <div className="flex items-center gap-5">
            {["Privacy", "Terms", "Cookies"].map((item) => (
              <span key={item} className="cursor-not-allowed opacity-40">{item}</span>
            ))}
          </div>
        </motion.div>

      </div>
    </footer>
  )
}
