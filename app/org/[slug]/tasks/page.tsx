import { getOrganizationMatters, getTasks } from '@/app/actions/tasks'
import TasksWorkspace from '@/components/tasks/TasksWorkspace'

export default async function TasksPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [tasks, matters] = await Promise.all([getTasks(slug), getOrganizationMatters(slug)])
  return <TasksWorkspace organizationId={slug} initialTasks={tasks} matters={matters} />
}
