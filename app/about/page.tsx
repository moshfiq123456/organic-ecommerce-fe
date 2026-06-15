"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Leaf, Heart, Award, Users, AlertCircle, Loader2 } from "lucide-react"
import { useGetAboutInfoQuery } from "@/api/aboutApi"
import { useSubdomain } from "@/context/SubdomainContext"

const defaultValues = [
  {
    icon: <Leaf className="h-8 w-8" />,
    title: "Sustainability",
    description: "Eco-friendly practices in every aspect of our business, from sourcing to packaging",
  },
  {
    icon: <Heart className="h-8 w-8" />,
    title: "Compassion",
    description: "Cruelty-free products that are never tested on animals, always developed with care",
  },
  {
    icon: <Award className="h-8 w-8" />,
    title: "Quality",
    description: "Premium organic ingredients and rigorous testing to ensure the highest standards",
  },
  {
    icon: <Users className="h-8 w-8" />,
    title: "Community",
    description: "Supporting local farmers and communities while building lasting relationships",
  },
]

const defaultStory =
  "Founded on the belief that beauty should be natural, sustainable, and accessible to everyone. We craft organic beauty products that honor both your skin and the environment."

const defaultMission =
  "At Pure Botanics, we believe that true beauty comes from nature. Our mission is to create high-quality, organic beauty products that nourish your skin while respecting the environment."

const defaultSourcing =
  "Every ingredient is carefully sourced from sustainable farms, and every product is crafted with love and attention to detail. We're committed to transparency, sustainability, and delivering results that make you feel confident in your natural beauty."

export default function AboutPage() {
  const slug = useSubdomain()
  const { data: aboutData, isLoading, error } = useGetAboutInfoQuery(slug || "", {
    skip: !slug,
  })

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

  const firstPhoto = media.find((m) => m.type === "photo" && m.url?.url)

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-light text-foreground mb-6">{title}</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">{storyText}</p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-light text-foreground mb-6">Our Mission</h2>
                <p className="text-muted-foreground leading-relaxed mb-6">{missionText}</p>
                <p className="text-muted-foreground leading-relaxed">{sourcingText}</p>
              </div>
              <div className="aspect-square overflow-hidden rounded-lg bg-secondary/20">
                {firstPhoto?.url?.url ? (
                  <img
                    src={firstPhoto.url.url}
                    alt={firstPhoto.url.filename || "About us"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <img
                      src="/organic-beauty-ingredients-and-botanicals.jpg"
                      alt="Organic ingredients"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {testimonials && testimonials.length > 0 && (
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-light text-foreground mb-4">
                  Founder's Message
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {testimonials.map((testimonial, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <p className="text-muted-foreground leading-relaxed mb-4 italic">
                        "{testimonial.message}"
                      </p>
                      <div className="pt-4 border-t border-border">
                        <p className="font-semibold text-foreground">
                          {testimonial.author?.firstName} {testimonial.author?.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">{testimonial.author?.email}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Values Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-light text-foreground mb-4">Our Values</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                These principles guide everything we do, from ingredient sourcing to product development
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {defaultValues.map((value, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4 text-primary">
                      {value.icon}
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{value.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
