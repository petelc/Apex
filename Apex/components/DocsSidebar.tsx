'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { ChevronDown, ChevronRight, Menu, X } from 'lucide-react'
import type { NavSection } from '@/lib/docs'

interface DocsSidebarProps {
  sections: NavSection[]
}

function SidebarSection({ section, currentPath }: { section: NavSection; currentPath: string }) {
  const isActive = section.items.some((item) => currentPath === item.href)
  const [open, setOpen] = useState<boolean>(true)

  return (
    <div className="mb-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-widest hover:text-gray-700 transition-colors"
      >
        {section.section}
        {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
      </button>
      {open && (
        <ul className="space-y-0.5">
          {section.items.map((item) => {
            const active = currentPath === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`block px-3 py-2 rounded-lg text-sm transition-all ${
                    active
                      ? 'bg-primary-600 text-white font-semibold'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {item.title}
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export function DocsSidebar({ sections }: DocsSidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const nav = (
    <nav className="py-6 px-4">
      <div className="mb-6">
        <Link href="/docs" className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-primary-700 rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="font-bold text-gray-900">APEX Docs</span>
        </Link>
        <p className="text-xs text-gray-400 ml-9">Documentation</p>
      </div>

      {sections.map((section) => (
        <SidebarSection key={section.section} section={section} currentPath={pathname} />
      ))}
    </nav>
  )

  return (
    <>
      {/* Mobile toggle */}
      <div className="lg:hidden fixed top-16 left-0 right-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <span className="font-semibold text-gray-900 text-sm">Documentation</span>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/30"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="absolute top-16 left-0 bottom-0 w-72 bg-white overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {nav}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0 border-r border-gray-200 overflow-y-auto bg-gray-50 sticky top-16 h-[calc(100vh-64px)]">
        {nav}
      </aside>
    </>
  )
}
