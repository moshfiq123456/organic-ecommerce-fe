"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { AlertCircle, CheckCircle2, Clock, Loader2, MessageCircle } from "lucide-react"
import { format } from "date-fns"
import { useState } from "react"
import { toast } from "sonner"
import { useAddReplyMutation } from "@/api/supportApi"

interface TicketDetailProps {
  ticket: {
    id: number
    ticketNumber: string
    subject: string
    description: string
    category: string
    priority: string
    status: string
    guestEmail?: string
    guestName?: string
    user?: { id: string; firstName: string; lastName: string; email: string }
    replies: Array<{
      authorName: string
      isStaff: boolean
      message: string
      createdAt?: string
    }>
    createdAt: string
    updatedAt: string
  }
  isGuest?: boolean
  guestEmail?: string
}

const statusConfig: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  open: {
    label: "Open",
    color: "bg-blue-100 text-blue-800",
    icon: <AlertCircle className="h-4 w-4" />,
  },
  "in-progress": {
    label: "In Progress",
    color: "bg-yellow-100 text-yellow-800",
    icon: <Clock className="h-4 w-4" />,
  },
  "waiting-user": {
    label: "Waiting for You",
    color: "bg-orange-100 text-orange-800",
    icon: <Clock className="h-4 w-4" />,
  },
  resolved: {
    label: "Resolved",
    color: "bg-green-100 text-green-800",
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  closed: {
    label: "Closed",
    color: "bg-gray-100 text-gray-800",
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
}

const priorityConfig: Record<string, string> = {
  low: "bg-blue-50 text-blue-700",
  medium: "bg-amber-50 text-amber-700",
  high: "bg-orange-50 text-orange-700",
  urgent: "bg-red-50 text-red-700",
}

export default function TicketDetail({
  ticket,
  isGuest = true,
  guestEmail = "",
}: TicketDetailProps) {
  const [addReply, { isLoading: isReplying }] = useAddReplyMutation()
  const [replyData, setReplyData] = useState({
    authorName: isGuest ? "" : (ticket.user?.firstName + " " + ticket.user?.lastName || ""),
    message: "",
  })

  const status = statusConfig[ticket.status] || statusConfig.open
  const priorityStyle = priorityConfig[ticket.priority] || priorityConfig.medium

  const handleReplyChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setReplyData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!replyData.authorName.trim()) {
      toast.error("Please enter your name")
      return
    }

    if (!replyData.message.trim()) {
      toast.error("Please enter a message")
      return
    }

    try {
      await addReply({
        ticketId: ticket.id,
        authorName: replyData.authorName.trim(),
        message: replyData.message.trim(),
        sendEmail: false,
      }).unwrap()

      toast.success("Reply added successfully!")
      setReplyData({
        authorName: replyData.authorName,
        message: "",
      })
    } catch (error: any) {
      toast.error(error?.data?.errors?.[0]?.message || "Failed to add reply")
    }
  }

  return (
    <div className="space-y-6">
      {/* Ticket Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-foreground">{ticket.subject}</h1>
                <Badge variant="outline">{ticket.ticketNumber}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Created {format(new Date(ticket.createdAt), "PPP p")}
              </p>
            </div>
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${status.color}`}
            >
              {status.icon}
              {status.label}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Category</p>
              <Badge variant="secondary" className="mt-1">
                {ticket.category}
              </Badge>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Priority</p>
              <Badge className={`mt-1 ${priorityStyle}`}>{ticket.priority}</Badge>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Updated</p>
              <p className="text-sm mt-1">{format(new Date(ticket.updatedAt), "MMM d")}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground mb-2">Description</p>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {ticket.description}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Replies Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Conversation ({ticket.replies?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {ticket.replies && ticket.replies.length > 0 ? (
            <div className="space-y-4">
              {ticket.replies.map((reply, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${
                    reply.isStaff ? "bg-blue-50 border border-blue-200" : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-foreground">{reply.authorName}</p>
                    {reply.isStaff && (
                      <Badge className="bg-blue-600 text-white text-xs">Staff</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {reply.message}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2 opacity-50" />
              <p className="text-sm text-muted-foreground">No replies yet.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reply Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add a Reply</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitReply} className="space-y-4">
            <div>
              <Label htmlFor="author">Your Name *</Label>
              <Input
                id="author"
                name="authorName"
                value={replyData.authorName}
                onChange={handleReplyChange}
                placeholder="Your name"
                disabled={isReplying || !isGuest}
              />
            </div>

            <div>
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                name="message"
                value={replyData.message}
                onChange={handleReplyChange}
                placeholder="Type your reply here..."
                rows={4}
                disabled={isReplying}
              />
            </div>

            <Button type="submit" disabled={isReplying} className="w-full">
              {isReplying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting Reply...
                </>
              ) : (
                "Post Reply"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
