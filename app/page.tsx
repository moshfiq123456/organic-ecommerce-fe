"use client"

import Link from "next/link"
import { useDispatch } from "react-redux"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ArrowRight, Leaf, Heart, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { addToCart } from "@/slices/cartSlice"
import { HeroCarousel } from "@/components/hero-carousel"

export default function HomePage() {
  const dispatch = useDispatch()
  const router = useRouter()

  const featuredProducts = [
    {
      id: 1,
      name: "Radiant Glow Serum",
      price: 48,
      image: "/organic-face-serum-bottle-with-dropper.jpg",
      description: "Vitamin C brightening serum with organic botanicals",
    },
    {
      id: 2,
      name: "Nourishing Face Cream",
      price: 36,
      image: "/organic-face-cream-jar-with-natural-ingredients.jpg",
      description: "Rich moisturizer with shea butter and botanical oils",
    },
    {
      id: 3,
      name: "Gentle Cleansing Oil",
      price: 32,
      image: "/organic-cleansing-oil-bottle-with-pump.jpg",
      description: "Deep cleansing oil with organic jojoba and rosehip",
    },
  ]

  const handleAddToCart = (product: any) => {
    dispatch(addToCart(product))
    router.push("/order") // redirect after adding to cart
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <HeroCarousel />
      {/* <section className="relative py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-light text-foreground mb-6 text-balance">
              Natural beauty meets
              <span className="block font-normal">organic excellence</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed text-pretty">
              Transform your skincare routine with our carefully curated collection of organic beauty products, crafted
              with the finest botanical ingredients.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <Button size="lg" className="group">
                  Explore Our Products
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="lg">
                  Learn Our Story
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section> */}

      {/* Featured Products */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-light text-foreground mb-4">Featured Products</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover our most loved organic beauty essentials
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="group hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-0">
                  <div className="aspect-square overflow-hidden rounded-t-lg">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-semibold text-foreground mb-2">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-primary">${product.price}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddToCart(product)}
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/products">
              <Button variant="outline" size="lg">
                View All Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-light text-foreground mb-4">Our Commitment</h2>
              <p className="text-muted-foreground">Every product is crafted with intention and care</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Leaf className="h-8 w-8" />,
                  title: "100% Organic",
                  description: "Certified organic ingredients sourced from sustainable farms worldwide",
                },
                {
                  icon: <Heart className="h-8 w-8" />,
                  title: "Cruelty-Free",
                  description: "Never tested on animals, always developed with compassion and care",
                },
                {
                  icon: <Sparkles className="h-8 w-8" />,
                  title: "Clean Beauty",
                  description: "Free from harmful chemicals, parabens, and synthetic fragrances",
                },
              ].map((value, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4 text-primary">
                    {value.icon}
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-light mb-4">Ready to transform your routine?</h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of customers who have discovered the power of organic beauty
          </p>
          <Link href="/order">
            <Button size="lg" variant="secondary">
              Start Shopping
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
