import { redirect } from 'next/navigation'

export default async function CalendarPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  redirect(`/org/${slug}/cases`)
}
