"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface HeroSlide {
  id: number
  title: string
  subtitle: string
  description: string
  image: string
  cta: {
    text: string
    href: string
  }
}

const heroSlides: HeroSlide[] = [
  {
    id: 1,
    title: "Natural beauty meets",
    subtitle: "organic excellence",
    description: "Transform your skincare routine with our carefully curated collection of organic beauty products.",
    image: "/organic-beauty-hero.jpg",
    cta: {
      text: "Explore Products",
      href: "/products",
    },
  },
  {
    id: 2,
    title: "Pure ingredients for",
    subtitle: "radiant skin",
    description: "Discover the power of nature with our premium selection of botanical skincare essentials.",
    image: "/skincare-products-organic.jpg",
    cta: {
      text: "Shop Skincare",
      href: "/products?category=Skincare",
    },
  },
  {
    id: 3,
    title: "Nourish your hair",
    subtitle: "naturally",
    description: "Experience the transformation with our organic haircare collection made from pure botanicals.",
    image: "/organic-haircare-products.jpg",
    cta: {
      text: "Explore Haircare",
      href: "/products?category=Haircare",
    },
  },
]

export function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [autoPlay, setAutoPlay] = useState(true)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)
  const autoPlayTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!autoPlay) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [autoPlay])

  const resumeAutoPlay = () => {
    if (autoPlayTimeoutRef.current) {
      clearTimeout(autoPlayTimeoutRef.current)
    }
    autoPlayTimeoutRef.current = setTimeout(() => {
      setAutoPlay(true)
    }, 8000) // Resume after 8 seconds of no interaction
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX
    handleSwipe()
  }

  const handleSwipe = () => {
    const swipeThreshold = 50
    const diff = touchStartX.current - touchEndX.current

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swiped left, go to next slide
        nextSlide()
      } else {
        // Swiped right, go to previous slide
        prevSlide()
      }
    }
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    setAutoPlay(false)
    resumeAutoPlay()
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    setAutoPlay(false)
    resumeAutoPlay()
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
    setAutoPlay(false)
    resumeAutoPlay()
  }

  const slide = heroSlides[currentSlide]

  return (
    <section className="relative w-full overflow-hidden">
      {/* Carousel Container */}
      <div
        className="relative h-96 md:h-[500px] lg:h-[600px] w-full cursor-grab active:cursor-grabbing"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Slides */}
        {heroSlides.map((s, index) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <img src={s.image || "/placeholder.svg"} alt={s.title} className="w-full h-full object-cover" />
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40" />
          </div>
        ))}

        {/* Content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center text-white">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-light mb-4 text-balance">
                {slide.title}
                <span className="block font-normal">{slide.subtitle}</span>
              </h1>
              <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed text-pretty opacity-90">
                {slide.description}
              </p>
              <Link href={slide.cta.href}>
                <Button size="lg" className="group">
                  {slide.cta.text}
                  <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Dot Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide ? "bg-white w-8" : "bg-white/50 w-2 hover:bg-white/75"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
