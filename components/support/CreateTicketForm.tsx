"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCreateGuestTicketMutation } from "@/api/supportApi"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface CreateTicketFormProps {
  isGuest?: boolean
  userEmail?: string
  onSuccess?: (ticketNumber: string) => void
}

const categories = [
  { value: "general", label: "General Inquiry" },
  { value: "order", label: "Order Issue" },
  { value: "product", label: "Product Issue" },
  { value: "shipping", label: "Shipping Issue" },
  { value: "payment", label: "Payment Issue" },
  { value: "account", label: "Account Issue" },
  { value: "technical", label: "Technical Issue" },
  { value: "return", label: "Return/Refund" },
  { value: "other", label: "Other" },
]

const priorities = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
]

export default function CreateTicketForm({
  isGuest = true,
  userEmail,
  onSuccess,
}: CreateTicketFormProps) {
  const [createTicket, { isLoading }] = useCreateGuestTicketMutation()
  const [formData, setFormData] = useState({
    guestName: "",
    guestEmail: userEmail || "",
    subject: "",
    description: "",
    category: "general",
    priority: "medium",
  })

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.guestName.trim()) {
      toast.error("Please enter your name")
      return
    }

    if (!formData.guestEmail.trim()) {
      toast.error("Please enter a valid email")
      return
    }

    if (!formData.subject.trim()) {
      toast.error("Please enter a subject")
      return
    }

    if (!formData.description.trim()) {
      toast.error("Please enter a description")
      return
    }

    try {
      const result = await createTicket({
        guestName: formData.guestName.trim(),
        guestEmail: formData.guestEmail.trim().toLowerCase(),
        subject: formData.subject.trim(),
        description: formData.description.trim(),
        category: formData.category,
        priority: formData.priority,
      }).unwrap()

      toast.success("Ticket created successfully!")
      const ticketNumber = result.ticket.ticketNumber

      // Reset form
      setFormData({
        guestName: "",
        guestEmail: userEmail || "",
        subject: "",
        description: "",
        category: "general",
        priority: "medium",
      })

      if (onSuccess) {
        onSuccess(ticketNumber)
      }
    } catch (error: any) {
      toast.error(error?.data?.errors?.[0]?.message || "Failed to create ticket")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a Support Ticket</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="name">Your Name *</Label>
            <Input
              id="name"
              name="guestName"
              value={formData.guestName}
              onChange={handleInputChange}
              placeholder="John Doe"
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              name="guestEmail"
              type="email"
              value={formData.guestEmail}
              onChange={handleInputChange}
              placeholder="john@example.com"
              disabled={isLoading || !isGuest}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleSelectChange("category", value)}
                disabled={isLoading}
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Priority *</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleSelectChange("priority", value)}
                disabled={isLoading}
              >
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((pri) => (
                    <SelectItem key={pri.value} value={pri.value}>
                      {pri.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              placeholder="Brief description of your issue"
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Please provide detailed information about your issue..."
              rows={6}
              disabled={isLoading}
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Ticket...
              </>
            ) : (
              "Create Ticket"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
