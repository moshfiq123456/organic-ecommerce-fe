"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle2, Clock, MessageSquare } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

interface Ticket {
  id: number
  ticketNumber: string
  subject: string
  category: string
  priority: string
  status: string
  createdAt: string
  updatedAt: string
  repliesCount: number
}

interface TicketListProps {
  tickets: Ticket[]
  isLoading?: boolean
  isGuest?: boolean
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

export default function TicketList({
  tickets,
  isLoading = false,
  isGuest = true,
}: TicketListProps) {
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading tickets...</p>
      </div>
    )
  }

  if (!tickets || tickets.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground">No support tickets yet.</p>
            {isGuest && (
              <Link href="/support/create">
                <Button variant="outline" className="mt-4">
                  Create Your First Ticket
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {tickets.map((ticket) => {
        const status = statusConfig[ticket.status] || statusConfig.open
        const priorityStyle = priorityConfig[ticket.priority] || priorityConfig.medium

        return (
          <Link
            key={ticket.id}
            href={`/support/ticket/${ticket.id}?email=${isGuest ? "guest" : ""}`}
          >
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        {ticket.subject}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {ticket.ticketNumber}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">
                      Created {format(new Date(ticket.createdAt), "MMM d, yyyy")}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {ticket.category}
                      </Badge>
                      <Badge className={`text-xs ${priorityStyle}`}>
                        {ticket.priority}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${status.color}`}
                    >
                      {status.icon}
                      {status.label}
                    </div>

                    {ticket.repliesCount > 0 && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MessageSquare className="h-4 w-4" />
                        {ticket.repliesCount} {ticket.repliesCount === 1 ? "reply" : "replies"}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
