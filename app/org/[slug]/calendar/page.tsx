'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Calendar as CalendarIcon, Clock } from 'lucide-react'

const mockEvents = [
  {
    id: '1',
    title: 'Court Hearing - Smith v. Johnson',
    type: 'Court Date',
    date: '2024-06-15',
    time: '10:00 AM',
    location: 'District Court - Room 205',
    case: 'Smith v. Johnson',
  },
  {
    id: '2',
    title: 'Motion Filing Deadline',
    type: 'Deadline',
    date: '2024-06-10',
    time: '5:00 PM',
    location: 'Online',
    case: 'Smith v. Johnson',
  },
  {
    id: '3',
    title: 'Client Meeting - Tech Solutions Inc.',
    type: 'Meeting',
    date: '2024-06-12',
    time: '2:00 PM',
    location: 'Conference Room B',
    case: 'Corporate Merger',
  },
]

export default function CalendarPage() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date(2024, 5, 1))

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate()
  const firstDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay()

  const days = []
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  return (
    <div className="min-h-full bg-muted/40 p-4 sm:p-6 lg:p-8">
      <div className="mb-5 flex items-center justify-between border-b bg-card px-5 py-4 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Calendar</h1>
          <p className="text-muted-foreground mt-2">
            Manage your legal deadlines and events
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Event</DialogTitle>
              <DialogDescription>
                Add a new event to your calendar
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="eventTitle">Event Title</Label>
                <Input id="eventTitle" placeholder="e.g., Court Hearing" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventType">Event Type</Label>
                <select className="h-10 w-full rounded-md border-input bg-background px-3 text-sm text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option>Court Date</option>
                  <option>Deadline</option>
                  <option>Meeting</option>
                  <option>Discovery</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="eventDate">Date</Label>
                  <Input id="eventDate" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eventTime">Time</Label>
                  <Input id="eventTime" type="time" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="e.g., District Court" />
              </div>
              <Button className="w-full">Create Event</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>
                {currentDate.toLocaleString('default', {
                  month: 'long',
                  year: 'numeric',
                })}
              </CardTitle>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentDate(
                      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
                    )
                  }
                >
                  ←
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentDate(
                      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
                    )
                  }
                >
                  →
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div
                  key={day}
                  className="text-center font-semibold text-sm text-muted-foreground py-2"
                >
                  {day}
                </div>
              ))}
              {days.map((day, idx) => (
                <div
                  key={idx}
                  className={`aspect-square flex items-center justify-center rounded-md text-sm ${
                    day
                      ? 'bg-muted hover:bg-muted/80 cursor-pointer'
                      : 'bg-transparent'
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockEvents.map((event) => (
                <div
                  key={event.id}
                  className="border-l-4 border-blue-600 pl-3 py-2"
                >
                  <h3 className="font-medium text-sm text-foreground">
                    {event.title}
                  </h3>
                  <div className="space-y-1 mt-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-3 w-3" />
                      {event.date}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      {event.time}
                    </div>
                    <div>{event.location}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
