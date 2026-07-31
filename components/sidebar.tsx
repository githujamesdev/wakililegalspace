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
  Home,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

const navigationSections = [
  {
    label: 'OVERVIEW',
    items: [
      {
        name: 'Dashboard',
        href: (slug: string) => `/org/${slug}`,
        icon: Home,
      },
    ],
  },  
  {
    label: 'ADMINISTRATION',
    items: [
      {
        name: 'Team Members',
        href: (slug: string) => `/org/${slug}/admin/users`,
        icon: Users,
      },
      {
        name: 'Security',
        href: (slug: string) => `/org/${slug}/security`,
        icon: Shield,
      },
      {
        name: 'Settings',
        href: (slug: string) => `/org/${slug}/settings`,
        icon: Settings,
      },
    ],
  },
  {
    label: 'LEGAL PRACTICE',
    items: [
       {
        name: 'Clients',
        href: (slug: string) => `/org/${slug}/clients`,
        icon: Users,
      },
      {
        name: 'Matters',
        href: (slug: string) => `/org/${slug}/cases`,
        icon: Briefcase,
      },
     
      {
        name: 'Documents',
        href: (slug: string) => `/org/${slug}/documents`,
        icon: FileText,
      },
    ],
  },
  {
    label: 'WORKSPACE',
    items: [
      {
        name: 'Calendar',
        href: (slug: string) => `/org/${slug}/calendar`,
        icon: Calendar,
      },
      {
        name: 'Tasks',
        href: (slug: string) => `/org/${slug}/tasks`,
        icon: CheckSquare,
      },
      {
        name: 'Time Tracking',
        href: (slug: string) => `/org/${slug}/time-tracking`,
        icon: Clock,
      },
      {
        name: 'Communication',
        href: (slug: string) => `/org/${slug}/messaging`,
        icon: MessageSquare,
      },
    ],
  },
  {
    label: 'SEARCH',
    items: [
      {
        name: 'Global Search',
        href: (slug: string) => `/org/${slug}/search`,
        icon: Search,
      },
    ],
  },
]

export default function Sidebar({ slug }: { slug: string }) {
  const pathname = usePathname()
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['LEGAL PRACTICE', 'WORKSPACE']))

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  return (
    <aside className="w-72 border-r bg-gradient-to-b from-slate-950 to-blue-950 flex flex-col h-screen" style={{ borderRightColor: '#1e3a8a' }}>
      {/* TOP ORGANIZATION CARD */}
      <div className="p-4 border-b border-blue-800/30">
        <div className="group rounded-xl p-4 bg-gradient-to-br from-slate-900 to-blue-950 border border-blue-800/40 shadow-lg transition-all duration-300 hover:border-amber-500/50 hover:shadow-amber-900/20">
          <div className="flex items-center justify-between mb-3">
            {/* <Image 
              src="/logo.png" 
              alt="Gikima Mugwe Advocates" 
              width={300} 
              height={100}
              className="w-32 h-auto object-contain"
              priority
            /> */}
            {/* <span className="text-xs font-bold px-2 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-500/30">
              Professional
            </span> */}
          </div>
          <div className="space-y-1">
            <p className="text-lg font-semibold text-white transition-colors duration-300 group-hover:text-amber-300">
              Gukima Mugwe
            </p>
            <p className="text-sm font-semibold text-slate-200">Advocates & Associates</p>
            <p className="text-xs text-blue-300/70 transition-colors duration-300 group-hover:text-amber-200/70">
              Legal Practice Management
            </p>
          </div>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-4">
        {navigationSections.map((section) => (
          <div key={section.label}>
            <button
              onClick={() => toggleSection(section.label)}
              className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-amber-400 transition-colors group"
            >
              <span>{section.label}</span>
              {section.items.length > 1 && (
                <ChevronDown 
                  className={cn(
                    "w-3 h-3 transition-transform",
                    expandedSections.has(section.label) ? "rotate-180" : ""
                  )} 
                />
              )}
            </button>
            
            {expandedSections.has(section.label) && (
              <div className="space-y-1 mt-2">
                {section.items.map((item) => {
                  const href = item.href(slug)
                  const isActive = pathname === href

                  return (
                    <Link key={item.name} href={href}>
                      <button
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                          isActive
                            ? 'bg-gradient-to-r from-blue-600 to-blue-600 text-white shadow-lg border-l-2 border-amber-400'
                            : 'text-slate-300 hover:text-white hover:bg-blue-900/40 border-l-2 border-transparent'
                        )}
                      >
                        <item.icon className={cn('w-4 h-4 flex-shrink-0', isActive && 'text-amber-300')} />
                        <span className="flex-1 text-left">{item.name}</span>
                        {isActive && <div className="w-1.5 h-1.5 rounded-full bg-amber-300" />}
                      </button>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* BOTTOM PROFILE CARD */}
      <div className="border-t border-blue-800/30 p-4 space-y-3">
        {/* <div className="rounded-lg p-3 bg-blue-900/40 border border-blue-800/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-white font-bold text-sm">
              JD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">James Doe</p>
              <p className="text-xs text-slate-400 truncate">Managing Partner</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex-1 flex items-center justify-center gap-2 px-2 py-2 rounded text-xs font-medium text-slate-300 hover:text-white hover:bg-blue-800/50 transition-colors">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">5</span>
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 px-2 py-2 rounded text-xs font-medium text-slate-300 hover:text-white hover:bg-blue-800/50 transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div> */}

        <Button
          onClick={async () => {
            await fetch('/api/auth/sign-out', { method: 'POST' })
            window.location.href = '/sign-in'
          }}
          className="w-full flex items-center justify-center gap-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 hover:text-red-200 border border-red-500/30 rounded-lg transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </Button>
      </div>
    </aside>
  )
}