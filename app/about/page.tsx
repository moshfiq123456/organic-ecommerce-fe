import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Leaf, Heart, Award, Users } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-light text-foreground mb-6">Our Story</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Founded on the belief that beauty should be natural, sustainable, and accessible to everyone. We craft
              organic beauty products that honor both your skin and the environment.
            </p>
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
                <p className="text-muted-foreground leading-relaxed mb-6">
                  At Pure Botanics, we believe that true beauty comes from nature. Our mission is to create
                  high-quality, organic beauty products that nourish your skin while respecting the environment.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Every ingredient is carefully sourced from sustainable farms, and every product is crafted with love
                  and attention to detail. We're committed to transparency, sustainability, and delivering results that
                  make you feel confident in your natural beauty.
                </p>
              </div>
              <div className="aspect-square overflow-hidden rounded-lg">
                <img
                  src="/organic-beauty-ingredients-and-botanicals.jpg"
                  alt="Organic ingredients"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

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
              {[
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
              ].map((value, index) => (
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

      {/* Team Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-light text-foreground mb-6">Meet Our Team</h2>
            <p className="text-muted-foreground leading-relaxed mb-12">
              Our passionate team of beauty experts, chemists, and sustainability advocates work together to bring you
              the finest organic beauty products.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: "Sarah Johnson",
                  role: "Founder & CEO",
                  image: "/professional-woman-founder.png",
                },
                {
                  name: "Dr. Emily Chen",
                  role: "Head of Product Development",
                  image: "/professional-woman-scientist.png",
                },
                {
                  name: "Michael Rodriguez",
                  role: "Sustainability Director",
                  image: "/professional-man-sustainability-expert-portrait.jpg",
                },
              ].map((member, index) => (
                <div key={index} className="text-center">
                  <div className="aspect-square overflow-hidden rounded-full mb-4 mx-auto w-48">
                    <img
                      src={member.image || "/placeholder.svg"}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
