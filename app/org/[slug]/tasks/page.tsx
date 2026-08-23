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
import { Plus, CheckCircle2, Circle } from 'lucide-react'

const mockTasks = [
  {
    id: '1',
    title: 'Review motion brief',
    case: 'Smith v. Johnson',
    dueDate: '2024-06-10',
    priority: 'High',
    status: 'pending',
    assignedTo: 'You',
  },
  {
    id: '2',
    title: 'Schedule discovery meeting',
    case: 'Corporate Merger',
    dueDate: '2024-06-12',
    priority: 'Medium',
    status: 'pending',
    assignedTo: 'Sarah Johnson',
  },
  {
    id: '3',
    title: 'Prepare client documents',
    case: 'Property Dispute',
    dueDate: '2024-06-08',
    priority: 'High',
    status: 'completed',
    assignedTo: 'You',
  },
  {
    id: '4',
    title: 'File court documents',
    case: 'Smith v. Johnson',
    dueDate: '2024-06-15',
    priority: 'High',
    status: 'pending',
    assignedTo: 'Legal Assistant',
  },
]

export default function TasksPage() {
  const [isOpen, setIsOpen] = useState(false)
  const [tasks, setTasks] = useState(mockTasks)

  const toggleTask = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              status: task.status === 'completed' ? 'pending' : 'completed',
            }
          : task
      )
    )
  }

  const pendingTasks = tasks.filter((t) => t.status === 'pending')
  const completedTasks = tasks.filter((t) => t.status === 'completed')

  return (
    <div className="min-h-full bg-muted/40 p-4 sm:p-6 lg:p-8">
      <div className="mb-5 flex items-center justify-between border-b bg-card px-5 py-4 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tasks</h1>
          <p className="text-muted-foreground mt-2">
            Manage your workflow and deadlines
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Task</DialogTitle>
              <DialogDescription>
                Add a new task to your workflow
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="taskTitle">Task Title</Label>
                <Input id="taskTitle" placeholder="e.g., Review motion brief" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="case">Case</Label>
                <select className="h-10 w-full rounded-md border-input bg-background px-3 text-sm text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option>Smith v. Johnson</option>
                  <option>Corporate Merger</option>
                  <option>Property Dispute</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <select className="h-10 w-full rounded-md border-input bg-background px-3 text-sm text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input id="dueDate" type="date" />
              </div>
              <Button className="w-full">Create Task</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Pending Tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingTasks.length === 0 ? (
              <p className="text-muted-foreground">No pending tasks</p>
            ) : (
              pendingTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="mt-1 flex-shrink-0"
                  >
                    <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
                  </button>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>{task.case}</span>
                      <span>•</span>
                      <span>{task.dueDate}</span>
                      <span>•</span>
                      <span>{task.assignedTo}</span>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      task.priority === 'High'
                        ? 'bg-red-100 text-red-800'
                        : task.priority === 'Medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Completed Tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {completedTasks.length === 0 ? (
              <p className="text-muted-foreground">No completed tasks</p>
            ) : (
              completedTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors opacity-60"
                >
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="mt-1 flex-shrink-0"
                  >
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </button>
                  <div className="flex-1">
                    <p className="font-medium text-foreground line-through">
                      {task.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {task.case}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
