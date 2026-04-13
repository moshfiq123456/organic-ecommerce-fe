"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin, Clock } from "lucide-react"
import { useSubmitContactMutation } from "@/api/contactApi"
import { useGetContactInfoQuery } from "@/api/contactInfoApi"
import { useSubdomain } from "@/context/SubdomainContext"
import { toast } from "sonner"

export default function ContactPage() {
  const slug = useSubdomain()
  const [submitContact, { isLoading }] = useSubmitContactMutation()
  const { data: contactInfoData } = useGetContactInfoQuery(slug, { skip: !slug })
  const info = contactInfoData?.docs?.[0]

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await submitContact({
        title: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        subDomain: slug,
      }).unwrap()
      toast.success("Message sent! We'll get back to you soon.")
      setFormData({ name: "", email: "", phone: "", message: "" })
    } catch {
      toast.error("Something went wrong. Please try again.")
    }
  }

  // Submit disabled if both email AND phone are missing, or message is empty
  const isDisabled = (!formData.email.trim() && !formData.phone.trim()) || !formData.message.trim() || isLoading

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-light text-foreground mb-6">Get in Touch</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Send us a Message</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">
                        Email <span className="text-muted-foreground text-xs">(required if no phone)</span>
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">
                        Phone <span className="text-muted-foreground text-xs">(required if no email)</span>
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>

                    <div>
                      <Label htmlFor="message">
                        Message <span className="text-destructive text-xs">*</span>
                      </Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Tell us how we can help you..."
                        rows={5}
                        required
                      />
                    </div>

                    <Button type="submit" size="lg" className="w-full" disabled={isDisabled}>
                      {isLoading ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <div className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Emails */}
                    {info?.emails?.length ? (
                      <div className="flex items-start space-x-4">
                        <div className="shrink-0"><Mail className="h-6 w-6 text-primary" /></div>
                        <div>
                          <h3 className="font-semibold text-foreground">Email</h3>
                          <p className="text-muted-foreground whitespace-pre-line">
                            {info.emails.map(({ email }, i) => email + (i < info.emails.length - 1 ? ",\n" : "")).join("")}
                          </p>
                        </div>
                      </div>
                    ) : null}

                    {/* Phones */}
                    {info?.phones?.length ? (
                      <div className="flex items-start space-x-4">
                        <div className="shrink-0"><Phone className="h-6 w-6 text-primary" /></div>
                        <div>
                          <h3 className="font-semibold text-foreground">Phone</h3>
                          <p className="text-muted-foreground whitespace-pre-line">
                            {info.phones.map(({ phone }, i) => phone + (i < info.phones.length - 1 ? ",\n" : "")).join("")}
                          </p>
                          {info.phones[0]?.label && (
                            <p className="text-sm text-muted-foreground">{info.phones[0].label}</p>
                          )}
                        </div>
                      </div>
                    ) : null}

                    {/* Address */}
                    {info?.address ? (
                      <div className="flex items-start space-x-4">
                        <div className="shrink-0"><MapPin className="h-6 w-6 text-primary" /></div>
                        <div>
                          <h3 className="font-semibold text-foreground">Address</h3>
                          <p className="text-muted-foreground whitespace-pre-line">{info.address}</p>
                        </div>
                      </div>
                    ) : null}

                    {/* Business Hours */}
                    {info?.businessHours?.length ? (
                      <div className="flex items-start space-x-4">
                        <div className="shrink-0"><Clock className="h-6 w-6 text-primary" /></div>
                        <div>
                          <h3 className="font-semibold text-foreground">Business Hours</h3>
                          {info.businessHours.map(({ day, hours, id }) => (
                            <p key={id} className="text-muted-foreground">
                              {day}: {hours}
                            </p>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-foreground mb-1">How long does shipping take?</h4>
                      <p className="text-sm text-muted-foreground">
                        We typically ship within 1-2 business days, and delivery takes 3-5 business days.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-1">Are your products really organic?</h4>
                      <p className="text-sm text-muted-foreground">
                        Yes! All our products are certified organic and made with natural, sustainable ingredients.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-1">Do you offer returns?</h4>
                      <p className="text-sm text-muted-foreground">
                        We offer a 30-day satisfaction guarantee on all products. Contact us if you're not completely
                        happy.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
