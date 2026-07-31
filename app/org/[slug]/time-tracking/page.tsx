'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { Plus, Clock } from 'lucide-react'

const mockTimeEntries = [
  {
    id: '1',
    date: '2024-06-05',
    description: 'Review motion brief - Smith v. Johnson',
    case: 'Smith v. Johnson',
    hours: 2.5,
    minutes: 30,
    billableRate: 350,
    isBillable: true,
    total: 875,
  },
  {
    id: '2',
    date: '2024-06-05',
    description: 'Client consultation',
    case: 'Corporate Merger',
    hours: 1,
    minutes: 0,
    billableRate: 350,
    isBillable: true,
    total: 350,
  },
  {
    id: '3',
    date: '2024-06-04',
    description: 'Document preparation',
    case: 'Property Dispute',
    hours: 3,
    minutes: 15,
    billableRate: 300,
    isBillable: true,
    total: 975,
  },
]

export default function TimeTrackingPage() {
  const [isOpen, setIsOpen] = useState(false)

  const totalHours = mockTimeEntries.reduce(
    (sum, entry) => sum + entry.hours + entry.minutes / 60,
    0
  )
  const totalBillable = mockTimeEntries.reduce(
    (sum, entry) => sum + (entry.isBillable ? entry.total : 0),
    0
  )

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Time Tracking</h1>
          <p className="text-muted-foreground mt-2">
            Track billable hours and generate invoices
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Log Time
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Time Entry</DialogTitle>
              <DialogDescription>
                Record billable hours for a case
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="case">Case</Label>
                <select className="w-full px-3 py-2 border border-border rounded-md">
                  <option>Smith v. Johnson</option>
                  <option>Corporate Merger</option>
                  <option>Property Dispute</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="e.g., Review motion brief"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hours">Hours</Label>
                  <Input id="hours" type="number" min="0" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minutes">Minutes</Label>
                  <Input
                    id="minutes"
                    type="number"
                    min="0"
                    max="59"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rate">Billable Rate ($)</Label>
                <Input id="rate" type="number" placeholder="350" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="billable" defaultChecked />
                <Label htmlFor="billable" className="font-normal">
                  Mark as billable
                </Label>
              </div>
              <Button className="w-full">Log Time</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Hours This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <Clock className="h-6 w-6 text-primary" />
              {totalHours.toFixed(1)}h
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Billable Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalBillable.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Entries This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockTimeEntries.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Time Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Case</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Billable</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTimeEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.date}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {entry.description}
                    </TableCell>
                    <TableCell>{entry.case}</TableCell>
                    <TableCell>
                      {entry.hours}h {entry.minutes}m
                    </TableCell>
                    <TableCell>${entry.billableRate}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          entry.isBillable
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {entry.isBillable ? 'Yes' : 'No'}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">
                      ${entry.total.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
