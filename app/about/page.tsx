"use client"

import { Card, CardContent } from "@/components/ui/card"
import {
  Leaf, Heart, Award, Users, Sparkles, ShieldCheck, Sprout, Globe,
  AlertCircle, Loader2,
} from "lucide-react"
import { motion } from "framer-motion"
import { useGetAboutInfoQuery } from "@/api/aboutApi"
import { getImageUrl } from "@/api/productsApi"
import { useSubdomain } from "@/context/SubdomainContext"

// Map a stored icon value → a lucide icon component.
const VALUE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  leaf: Leaf, heart: Heart, award: Award, users: Users,
  sparkles: Sparkles, shield: ShieldCheck, sprout: Sprout, globe: Globe,
}

const defaultValues = [
  { icon: "leaf", title: "Sustainability", description: "Eco-friendly practices in every aspect of our business, from sourcing to packaging" },
  { icon: "heart", title: "Compassion", description: "Cruelty-free products that are never tested on animals, always developed with care" },
  { icon: "award", title: "Quality", description: "Premium organic ingredients and rigorous testing to ensure the highest standards" },
  { icon: "users", title: "Community", description: "Supporting local farmers and communities while building lasting relationships" },
]

const defaultStory =
  "Founded on the belief that beauty should be natural, sustainable, and accessible to everyone. We craft organic beauty products that honor both your skin and the environment."
const defaultMission =
  "At Pure Botanics, we believe that true beauty comes from nature. Our mission is to create high-quality, organic beauty products that nourish your skin while respecting the environment."
const defaultSourcing =
  "Every ingredient is carefully sourced from sustainable farms, and every product is crafted with love and attention to detail. We're committed to transparency, sustainability, and delivering results that make you feel confident in your natural beauty."

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

export default function AboutPage() {
  const slug = useSubdomain()
  const { data: aboutData, isLoading, error } = useGetAboutInfoQuery(slug || "", { skip: !slug })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading about information...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
              <div className="flex gap-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900">Unable to load about information</p>
                  <p className="text-sm text-red-800 mt-1">Please try refreshing the page.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  const title = aboutData?.title || "Our Story"
  const storyText = aboutData?.whyThisPlatform || defaultStory
  const missionText = aboutData?.brandMissionVision || defaultMission
  const sourcingText = aboutData?.sourcingPhilosophy || defaultSourcing
  const media = aboutData?.media || []
  const testimonials = aboutData?.testimonials || []
  const values = (aboutData?.values && aboutData.values.length > 0) ? aboutData.values : defaultValues

  const firstPhoto = media.find((m) => m.type === "photo" && m.url?.url)

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden" animate="visible" variants={fadeUp}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-5xl font-light text-foreground mb-6">{title}</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">{storyText}</p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}
                variants={fadeUp}
              >
                <h2 className="text-3xl md:text-4xl font-light text-foreground mb-6">Our Mission</h2>
                <p className="text-muted-foreground leading-relaxed mb-6">{missionText}</p>
                <p className="text-muted-foreground leading-relaxed">{sourcingText}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="aspect-square overflow-hidden rounded-lg bg-secondary/20"
              >
                <img
                  src={firstPhoto?.url?.url ? getImageUrl(firstPhoto.url.url) : "/organic-beauty-ingredients-and-botanicals.jpg"}
                  alt={firstPhoto?.url?.filename || "About us"}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-light text-foreground mb-4">Founder's Message</h2>
              </div>
              {/* A single message reads better centred than stranded in a 2-col grid */}
              <div className={`grid gap-8 ${testimonials.length === 1 ? "max-w-2xl mx-auto" : "grid-cols-1 md:grid-cols-2"}`}>
                {testimonials.map((testimonial, index) => {
                  const author = testimonial.author
                  // `author` is a Users relationship — it only populates for staff,
                  // so public visitors get a bare id. Render the block only when
                  // we actually have a name, otherwise we'd show an empty divider.
                  const authorName =
                    author && typeof author === "object"
                      ? `${author.firstName ?? ""} ${author.lastName ?? ""}`.trim()
                      : ""
                  const isSingle = testimonials.length === 1

                  return (
                    <motion.div
                      key={index} custom={index} initial="hidden" whileInView="visible"
                      viewport={{ once: true, margin: "-60px" }} variants={fadeUp}
                    >
                      <Card className="h-full">
                        <CardContent className={`p-6 sm:p-8 ${isSingle ? "text-center" : ""}`}>
                          <p className="text-muted-foreground leading-relaxed italic">
                            &ldquo;{testimonial.message}&rdquo;
                          </p>
                          {authorName && (
                            <div className={`pt-4 mt-4 border-t border-border ${isSingle ? "inline-block px-6" : ""}`}>
                              <p className="font-semibold text-foreground">{authorName}</p>
                              {author && typeof author === "object" && author.email && (
                                <p className="text-sm text-muted-foreground">{author.email}</p>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Values Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-light text-foreground mb-4">Our Values</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                These principles guide everything we do, from ingredient sourcing to product development
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => {
                const Icon = VALUE_ICONS[value.icon || "leaf"] || Leaf
                return (
                  <motion.div
                    key={index} custom={index} initial="hidden" whileInView="visible"
                    viewport={{ once: true, margin: "-60px" }} variants={fadeUp}
                  >
                    <Card className="text-center h-full">
                      <CardContent className="p-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4 text-primary">
                          <Icon className="h-8 w-8" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-2">{value.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
