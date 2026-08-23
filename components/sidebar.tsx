'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Briefcase,
  Users,
  FileText,
  Calendar,
  CheckSquare,
  Clock,
  Settings,
  LogOut,
  Search,
  Shield,
  MessageSquare,
  Bell,
  ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

const navigationSections = [
  { label: 'OVERVIEW', items: [{ name: 'Dashboard', href: (slug: string) => `/org/${slug}`, icon: LayoutDashboard }] },
  {
    label: 'LEGAL PRACTICE',
    items: [
      { name: 'Matters', href: (slug: string) => `/org/${slug}/cases`, icon: Briefcase },
      { name: 'Clients', href: (slug: string) => `/org/${slug}/clients`, icon: Users },
      { name: 'Documents', href: (slug: string) => `/org/${slug}/documents`, icon: FileText },
    ],
  },
  {
    label: 'WORKSPACE',
    items: [
      { name: 'Calendar', href: (slug: string) => `/org/${slug}/calendar`, icon: Calendar },
      { name: 'Tasks', href: (slug: string) => `/org/${slug}/tasks`, icon: CheckSquare },
      { name: 'Time Tracking', href: (slug: string) => `/org/${slug}/time-tracking`, icon: Clock },
      { name: 'Communication', href: (slug: string) => `/org/${slug}/messaging`, icon: MessageSquare },
    ],
  },
  { label: 'SEARCH', items: [{ name: 'Global Search', href: (slug: string) => `/org/${slug}/search`, icon: Search }] },
  {
    label: 'ADMINISTRATION',
    items: [
      { name: 'Team Members', href: (slug: string) => `/org/${slug}/admin/users`, icon: Users },
      { name: 'Security', href: (slug: string) => `/org/${slug}/security`, icon: Shield },
      { name: 'Settings', href: (slug: string) => `/org/${slug}/settings`, icon: Settings },
    ],
  },
]

export default function Sidebar({ slug }: { slug: string }) {
  const pathname = usePathname()
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(navigationSections.map((section) => section.label)))

  const toggleSection = (section: string) => {
    const next = new Set(expandedSections)
    next.has(section) ? next.delete(section) : next.add(section)
    setExpandedSections(next)
  }

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground shadow-xl">
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
        <div className="flex size-9 items-center justify-center rounded bg-sidebar-primary text-sm font-bold text-sidebar-primary-foreground">GM</div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">Gukima Mugwe</p>
          <p className="truncate text-[11px] text-sidebar-foreground/60">Legal Practice Management</p>
        </div>
      </div>

      <div className="border-b border-sidebar-border px-4 py-4">
        <div className="flex items-center gap-3 rounded bg-sidebar-accent/20 px-3 py-3">
          <Image src="/logo.png" alt="Gikima Mugwe Advocates" width={92} height={28} className="h-auto w-20 object-contain" priority />
          <span className="text-[10px] font-semibold uppercase tracking-wide text-sidebar-foreground/60">Admin</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navigationSections.map((section) => (
          <div key={section.label} className="mb-4">
            <button onClick={() => toggleSection(section.label)} className="flex w-full items-center justify-between px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-sidebar-foreground/45 hover:text-sidebar-foreground/80">
              <span>{section.label}</span>
              {section.items.length > 1 && <ChevronDown className={cn('size-3 transition-transform', expandedSections.has(section.label) && 'rotate-180')} />}
            </button>
            {expandedSections.has(section.label) && (
              <div className="flex flex-col gap-1">
                {section.items.map((item) => {
                  const href = item.href(slug)
                  const isActive = pathname === href || (href !== `/org/${slug}` && pathname.startsWith(`${href}/`))
                  return (
                    <Link key={item.name} href={href} className={cn('group flex items-center gap-3 rounded px-3 py-2.5 text-sm transition-colors', isActive ? 'bg-sidebar-primary font-semibold text-sidebar-primary-foreground shadow-sm' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/20 hover:text-sidebar-foreground')}>
                      <item.icon className={cn('size-4 shrink-0', isActive ? 'text-sidebar-primary-foreground' : 'text-sidebar-foreground/55 group-hover:text-sidebar-foreground')} />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="mb-3 flex items-center gap-3 rounded bg-sidebar-accent/20 p-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-sidebar-primary text-xs font-bold text-sidebar-primary-foreground">JD</div>
          <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">James Doe</p><p className="truncate text-xs text-sidebar-foreground/55">Managing Partner</p></div>
          <Bell className="size-4 text-sidebar-foreground/55" />
        </div>
        <Button onClick={async () => { await fetch('/api/auth/sign-out', { method: 'POST' }); window.location.href = '/sign-in' }} variant="outline" className="w-full justify-center gap-2 border-sidebar-border bg-transparent text-sidebar-foreground/75 hover:bg-destructive/15 hover:text-destructive">
          <LogOut data-icon="inline-start" /> Sign Out
        </Button>
      </div>
    </aside>
  )
}
