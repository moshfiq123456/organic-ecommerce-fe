"use client"

import { Suspense, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { useGetTicketDetailQuery } from "@/api/supportApi"
import TicketDetail from "@/components/support/TicketDetail"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function TicketDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const ticketId = params.id as string
  const isGuest = searchParams.get("email") === "guest"

  const { data: ticket, isLoading, error } = useGetTicketDetailQuery(ticketId)

  if (error) {
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
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-900">Ticket Not Found</p>
                      <p className="text-sm text-red-800 mt-1">
                        The ticket you're looking for doesn't exist or has been deleted.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading ticket details...</p>
            </div>
          </div>
        </section>
      </div>
    )
  }

  if (!ticket) {
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
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="pt-6">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-yellow-900">No Ticket Data</p>
                      <p className="text-sm text-yellow-800 mt-1">
                        Unable to load the ticket details. Please try again.
                      </p>
                    </div>
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
            <TicketDetail ticket={ticket} isGuest={isGuest} />
          </div>
        </div>
      </section>
    </div>
  )
}
