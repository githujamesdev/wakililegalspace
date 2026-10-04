'use client'

import { useState, useTransition } from 'react'
import { CheckCircle2, Circle, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createTask, updateTaskStatus, type MatterList, type TaskList } from '@/app/actions/tasks'

export default function TasksWorkspace({ organizationId, initialTasks, matters }: { organizationId: string; initialTasks: TaskList; matters: MatterList }) {
  const [tasks, setTasks] = useState(initialTasks)
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')

  function toggle(taskId: string, status: string) {
    const next = status === 'done' ? 'todo' : 'done'
    startTransition(async () => {
      try {
        await updateTaskStatus(organizationId, taskId, next)
        setTasks((current) => current.map((item) => item.id === taskId ? { ...item, status: next } : item))
      } catch (err) { setError(err instanceof Error ? err.message : 'Unable to update task') }
    })
  }

  function submit(formData: FormData) {
    startTransition(async () => {
      try {
        const id = await createTask({ organizationId, title: String(formData.get('title') || ''), description: String(formData.get('description') || ''), caseId: String(formData.get('caseId') || '') || undefined, dueDate: String(formData.get('dueDate') || '') || undefined, priority: (String(formData.get('priority') || 'medium') as 'low' | 'medium' | 'high') })
        const created = await import('@/app/actions/tasks').then((module) => module.getTasks(organizationId))
        setTasks(created)
        setOpen(false)
        setError('')
        void id
      } catch (err) { setError(err instanceof Error ? err.message : 'Unable to create task') }
    })
  }

  const pendingTasks = tasks.filter((task) => task.status !== 'done')
  const completedTasks = tasks.filter((task) => task.status === 'done')

  return <div className="min-h-full bg-[#f6f8fb] p-4 sm:p-6 lg:p-8">
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Workflow control</p><h1 className="text-3xl font-semibold tracking-tight text-slate-950">Tasks</h1><p className="mt-2 text-sm leading-6 text-slate-600">Manage matter actions, filing deadlines, and team ownership.</p></div>
      <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button className="bg-emerald-700 hover:bg-emerald-800"><Plus className="mr-2 h-4 w-4" />New task</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Create task</DialogTitle><DialogDescription>Add a database-backed task to your firm workflow.</DialogDescription></DialogHeader><form action={submit} className="space-y-4"><div className="space-y-2"><Label htmlFor="title">Task title</Label><Input id="title" name="title" required /></div><div className="space-y-2"><Label htmlFor="description">Description</Label><Input id="description" name="description" /></div><div className="space-y-2"><Label htmlFor="caseId">Matter</Label><select id="caseId" name="caseId" className="h-10 w-full rounded-md border bg-background px-3 text-sm"><option value="">No matter</option>{matters.map((matter) => <option key={matter.id} value={matter.id}>{matter.title}</option>)}</select></div><div className="grid grid-cols-2 gap-3"><div className="space-y-2"><Label htmlFor="priority">Priority</Label><select id="priority" name="priority" className="h-10 w-full rounded-md border bg-background px-3 text-sm"><option value="medium">Medium</option><option value="high">High</option><option value="low">Low</option></select></div><div className="space-y-2"><Label htmlFor="dueDate">Due date</Label><Input id="dueDate" name="dueDate" type="date" /></div></div>{error && <p className="text-sm text-red-600">{error}</p>}<Button disabled={pending} type="submit" className="w-full">{pending ? 'Saving…' : 'Create task'}</Button></form></DialogContent></Dialog>
    </div>
    <div className="grid gap-6 lg:grid-cols-3"><Card className="rounded-xl border-slate-200 bg-white shadow-sm lg:col-span-2"><CardHeader><CardTitle>Open tasks <span className="ml-2 text-sm font-normal text-slate-500">{pendingTasks.length}</span></CardTitle></CardHeader><CardContent className="space-y-3">{pendingTasks.length === 0 ? <p className="rounded-lg bg-slate-50 p-5 text-sm text-slate-600">No open tasks. Create the next matter action to keep work moving.</p> : pendingTasks.map((task) => <TaskRow key={task.id} task={task} pending={pending} onToggle={() => toggle(task.id, task.status)} />)}</CardContent></Card><Card className="rounded-xl border-slate-200 bg-white shadow-sm"><CardHeader><CardTitle>Completed <span className="ml-2 text-sm font-normal text-slate-500">{completedTasks.length}</span></CardTitle></CardHeader><CardContent className="space-y-3">{completedTasks.length === 0 ? <p className="text-sm text-slate-600">Completed tasks will appear here.</p> : completedTasks.map((task) => <TaskRow key={task.id} task={task} pending={pending} onToggle={() => toggle(task.id, task.status)} />)}</CardContent></Card></div>
  </div>
}

function TaskRow({ task, pending, onToggle }: { task: TaskList[number]; pending: boolean; onToggle: () => void }) { return <div className="flex items-start gap-3 rounded-lg border border-slate-200 p-3"><button type="button" disabled={pending} onClick={onToggle} aria-label={task.status === 'done' ? 'Reopen task' : 'Complete task'} className="mt-0.5"><>{task.status === 'done' ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <Circle className="h-5 w-5 text-slate-400" />}</></button><div className="min-w-0 flex-1"><p className={task.status === 'done' ? 'font-medium text-slate-500 line-through' : 'font-medium text-slate-900'}>{task.title}</p><p className="mt-1 text-xs text-slate-500">{task.caseTitle || 'No matter linked'}{task.dueDate ? ` · Due ${new Intl.DateTimeFormat('en-KE').format(new Date(task.dueDate))}` : ''}</p></div><span className="rounded-full bg-slate-100 px-2 py-1 text-xs capitalize text-slate-600">{task.priority}</span></div> }
