import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-4xl font-light text-foreground mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-8">Sorry, we couldn't find the product you're looking for.</p>
          <Link href="/products">
            <Button>Browse All Products</Button>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}
