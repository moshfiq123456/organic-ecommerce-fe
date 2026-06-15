"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import CreateTicketForm from "@/components/support/CreateTicketForm"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function CreateSupportTicketPage() {
  const router = useRouter()
  const [successTicket, setSuccessTicket] = useState<string | null>(null)

  const handleSuccess = (ticketNumber: string) => {
    setSuccessTicket(ticketNumber)
  }

  if (successTicket) {
    return (
      <div className="min-h-screen bg-background">
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/support">
              <Button variant="ghost" className="mb-6 gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Support
              </Button>
            </Link>

            <div className="max-w-2xl mx-auto">
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-green-900">Ticket Created Successfully!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-white p-6 rounded-lg border border-green-200">
                    <p className="text-sm text-muted-foreground mb-2">Your Ticket Number</p>
                    <p className="text-2xl font-bold text-foreground font-mono">
                      {successTicket}
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex gap-3">
                      <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-blue-900 text-sm mb-1">
                          What happens next?
                        </p>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>
                            • We've received your ticket and will review it shortly
                          </li>
                          <li>
                            • You'll receive email updates as your ticket progresses
                          </li>
                          <li>
                            • You can check your ticket status anytime using your ticket number
                          </li>
                          <li>
                            • Our team aims to respond within 24 hours
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 space-y-3">
                    <Link href="/support" className="block">
                      <Button className="w-full">View All Tickets</Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setSuccessTicket(null)}
                    >
                      Create Another Ticket
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/support">
            <Button variant="ghost" className="mb-6 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Support
            </Button>
          </Link>

          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-light text-foreground mb-4">
                Create Support Ticket
              </h1>
              <p className="text-lg text-muted-foreground">
                Tell us about your issue. We'll get back to you as soon as possible.
              </p>
            </div>

            <CreateTicketForm isGuest={true} onSuccess={handleSuccess} />
          </div>
        </div>
      </section>
    </div>
  )
}
