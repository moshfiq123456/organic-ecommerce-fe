"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MessageSquare, Plus, Search, Loader2 } from "lucide-react"
import Link from "next/link"
import { useGetGuestTicketsQuery } from "@/api/supportApi"
import { useGetFaqsQuery } from "@/api/faqApi"
import { useSubdomain } from "@/context/SubdomainContext"
import TicketList from "@/components/support/TicketList"
import { toast } from "sonner"

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState<"create" | "check">("create")
  const [guestEmail, setGuestEmail] = useState("")
  const [searchEmail, setSearchEmail] = useState("")
  const { data: ticketsData, isLoading, refetch } = useGetGuestTicketsQuery(searchEmail, {
    skip: !searchEmail,
  })

  const slug = useSubdomain()
  const { data: faqData, isLoading: faqLoading } = useGetFaqsQuery(slug, { skip: !slug })
  const faqs = faqData?.docs ?? []

  const handleSearchTickets = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchEmail.trim()) {
      toast.error("Please enter an email address")
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(searchEmail.trim())) {
      toast.error("Please enter a valid email address")
      return
    }
    refetch()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h1 className="text-4xl md:text-5xl font-light text-foreground mb-6">
              Support Center
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We're here to help! Create a support ticket or check the status of your existing
              tickets.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Tabs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button
                variant={activeTab === "create" ? "default" : "outline"}
                onClick={() => setActiveTab("create")}
                className="flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Ticket
              </Button>
              <Button
                variant={activeTab === "check" ? "default" : "outline"}
                onClick={() => setActiveTab("check")}
                className="flex items-center justify-center gap-2"
              >
                <Search className="h-4 w-4" />
                Check Tickets
              </Button>
            </div>

            {/* Create Ticket Tab */}
            {activeTab === "create" && (
              <Card>
                <CardHeader>
                  <CardTitle>Create a New Support Ticket</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-6">
                    Don't have an account? No problem! You can create a support ticket with just
                    your email address.
                  </p>
                  <Link href="/support/create">
                    <Button size="lg" className="w-full">
                      Start Creating Ticket
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Check Tickets Tab */}
            {activeTab === "check" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Find Your Tickets</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSearchTickets} className="space-y-4">
                      <div>
                        <Label htmlFor="search-email">Email Address</Label>
                        <Input
                          id="search-email"
                          type="email"
                          placeholder="Enter your email to find your tickets"
                          value={searchEmail}
                          onChange={(e) => setSearchEmail(e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full sm:w-auto"
                      >
                        {isLoading ? "Searching..." : "Search Tickets"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {searchEmail && ticketsData && (
                  <div>
                    <h2 className="text-lg font-semibold text-foreground mb-4">
                      Your Tickets ({ticketsData.total})
                    </h2>
                    <TicketList
                      tickets={ticketsData.tickets}
                      isLoading={isLoading}
                      isGuest={true}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FAQ Section — hidden entirely when there are no FAQs to show */}
      {(faqLoading || faqs.length > 0) && (
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-light text-foreground mb-12 text-center">
                Frequently Asked Questions
              </h2>

              {faqLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {faqs.map((faq) => (
                    <Card key={faq.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{faq.question}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                          {faq.answer}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
