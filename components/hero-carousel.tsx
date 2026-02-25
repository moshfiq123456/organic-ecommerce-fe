"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"

interface HeroSlide {
  id: number
  title: string
  subtitle: string
  description: string
  image: string
  cta: { text: string; href: string }
}

const heroSlides: HeroSlide[] = [
  {
    id: 1,
    title: "Natural beauty meets",
    subtitle: "organic excellence",
    description:
      "Transform your skincare routine with our carefully curated collection of organic beauty products.",
    image: "/organic-beauty-hero.jpg",
    cta: { text: "Explore Products", href: "/products" },
  },
  {
    id: 2,
    title: "Pure ingredients for",
    subtitle: "radiant skin",
    description:
      "Discover the power of nature with our premium selection of botanical skincare essentials.",
    image: "/skincare-products-organic.jpg",
    cta: { text: "Shop Skincare", href: "/products?category=Skincare" },
  },
  {
    id: 3,
    title: "Nourish your hair",
    subtitle: "naturally",
    description:
      "Experience the transformation with our organic haircare collection made from pure botanicals.",
    image: "/organic-haircare-products.jpg",
    cta: { text: "Explore Haircare", href: "/products?category=Haircare" },
  },
]

const AUTOPLAY_MS = 5000

// Slide container — horizontal enter/exit
const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir < 0 ? "100%" : "-100%", opacity: 0 }),
}

// Text block — children stagger up
const contentVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.22 },
  },
  exit: { opacity: 0, transition: { duration: 0.12 } },
}

const itemVariants = {
  hidden: { y: 44, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
}

export function HeroCarousel() {
  const [[page, dir], setPage] = useState([0, 0])
  const [autoPlay, setAutoPlay] = useState(true)

  const slide = heroSlides[page]

  // Parallax: image moves slower than scroll
  const { scrollY } = useScroll()
  const imageY = useTransform(scrollY, [0, 800], [0, 120])

  const paginate = (newDir: number) => {
    setPage(([p]) => [(p + newDir + heroSlides.length) % heroSlides.length, newDir])
  }

  const goTo = (index: number) => {
    setPage(([p]) => [index, index > p ? 1 : -1])
    setAutoPlay(false)
    setTimeout(() => setAutoPlay(true), 8000)
  }

  const next = () => { paginate(1);  setAutoPlay(false); setTimeout(() => setAutoPlay(true), 8000) }
  const prev = () => { paginate(-1); setAutoPlay(false); setTimeout(() => setAutoPlay(true), 8000) }

  useEffect(() => {
    if (!autoPlay) return
    const id = setInterval(() => paginate(1), AUTOPLAY_MS)
    return () => clearInterval(id)
  }, [autoPlay, page])

  return (
    <section className="relative w-full overflow-hidden h-screen min-h-[580px] max-h-[900px]">

      {/* ── Background slides with parallax ── */}
      <AnimatePresence initial={false} custom={dir}>
        <motion.div
          key={page}
          custom={dir}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 230, damping: 30 },
            opacity: { duration: 0.45 },
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.06}
          onDragEnd={(_, { offset, velocity }) => {
            if (offset.x < -60 || velocity.x < -400) next()
            else if (offset.x > 60 || velocity.x > 400) prev()
          }}
          className="absolute inset-0 overflow-hidden cursor-grab active:cursor-grabbing select-none"
        >
          {/* Parallax image — taller than container so it can shift */}
          <motion.div
            style={{ y: imageY }}
            className="absolute w-full h-[115%] -top-[7.5%]"
          >
            <img
              src={slide.image || "/placeholder.svg"}
              alt={slide.title}
              className="w-full h-full object-cover"
              draggable={false}
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* ── Gradient overlays ── */}
      {/* Mobile: uniform dark overlay. md+: left-to-right editorial gradient */}
      <div className="absolute inset-0 bg-black/55 md:bg-transparent z-10 pointer-events-none" />
      <div className="absolute inset-0 hidden md:block bg-linear-to-r from-black/85 via-black/50 to-black/10 z-10 pointer-events-none" />
      {/* Bottom vignette */}
      <div className="absolute inset-0 bg-linear-to-t from-black/55 via-transparent to-transparent z-10 pointer-events-none" />

      {/* ── Text content ── */}
      {/* Mobile: centered. md+: bottom-left editorial */}
      <div className="absolute inset-0 z-20 flex items-center justify-center md:items-end md:justify-start pointer-events-none">
        <div className="container mx-auto px-6 sm:px-10 lg:px-14 pb-0 md:pb-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="max-w-2xl pointer-events-auto text-center md:text-left mx-auto md:mx-0"
            >
              {/* Slide counter + brand label */}
              <motion.div
                variants={itemVariants}
                className="flex items-center justify-center md:justify-start gap-3 mb-7"
              >
                <span className="text-white/40 text-xs tracking-[0.3em] uppercase tabular-nums">
                  {String(page + 1).padStart(2, "0")} / {String(heroSlides.length).padStart(2, "0")}
                </span>
                <div className="h-px w-10 bg-white/20" />
                <span className="text-white/40 text-xs tracking-[0.3em] uppercase">
                  Pure Botanics
                </span>
              </motion.div>

              {/* Oversized headline */}
              <motion.h1
                variants={itemVariants}
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extralight leading-[0.93] tracking-tight text-white mb-5"
              >
                {slide.title}
                <span className="block italic font-light text-primary/85 mt-1">
                  {slide.subtitle}
                </span>
              </motion.h1>

              {/* Description */}
              <motion.p
                variants={itemVariants}
                className="text-white/60 text-sm md:text-base leading-relaxed max-w-sm mb-9 mx-auto md:mx-0"
              >
                {slide.description}
              </motion.p>

              {/* CTA */}
              <motion.div variants={itemVariants}>
                <Link href={slide.cta.href}>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-block"
                  >
                    <Button
                      size="lg"
                      className="gap-2 rounded-full px-8 font-light tracking-wide shadow-lg shadow-black/25"
                    >
                      {slide.cta.text}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Dot indicators — centered ── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {heroSlides.map((_, i) => (
          <motion.button
            key={i}
            onClick={() => goTo(i)}
            animate={{
              width: i === page ? 32 : 8,
              opacity: i === page ? 1 : 0.35,
              backgroundColor: "#ffffff",
            }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            className="h-1.5 rounded-full"
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* ── Nav arrows — bottom-right, subtle — desktop only ── */}
      <div className="absolute bottom-16 right-6 z-30 hidden md:flex gap-2">
        <motion.button
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.9 }}
          onClick={prev}
          className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/45 hover:text-white hover:border-white/50 transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-4 w-4" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.9 }}
          onClick={next}
          className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/45 hover:text-white hover:border-white/50 transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight className="h-4 w-4" />
        </motion.button>
      </div>

      {/* ── Auto-play progress bar ── */}
      <motion.div
        key={page + (autoPlay ? "-play" : "-pause")}
        initial={{ scaleX: 0 }}
        animate={autoPlay ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: AUTOPLAY_MS / 1000, ease: "linear" }}
        className="absolute bottom-0 left-0 h-0.75 w-full bg-primary origin-left z-30"
      />
    </section>
  )
}
