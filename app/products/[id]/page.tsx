import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ArrowLeft, ShoppingCart, Heart, Share2 } from "lucide-react"
import { getProductById } from "@/lib/products"

interface ProductPageProps {
  params: {
    id: string
  }
}

export default function ProductPage({ params }: ProductPageProps) {
  const productId = Number.parseInt(params.id)
  const product = getProductById(productId)

  if (!product) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg bg-secondary/30">
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className="mb-3">
                {product.category}
              </Badge>
              <h1 className="text-3xl md:text-4xl font-light text-foreground mb-4">{product.name}</h1>
              <p className="text-2xl font-semibold text-primary mb-4">{product.price}</p>
              <p className="text-lg text-muted-foreground leading-relaxed">{product.longDescription}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Link href="/order" className="flex-1">
                <Button size="lg" className="w-full">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </Link>
              <Button variant="outline" size="lg">
                <Heart className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Product Information */}
            <div className="space-y-6 pt-6 border-t">
              {/* Ingredients */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-3">Key Ingredients</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.ingredients.map((ingredient, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {ingredient}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Benefits */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-3">Benefits</h3>
                  <ul className="space-y-2">
                    {product.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* How to Use */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-3">How to Use</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{product.howToUse}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
