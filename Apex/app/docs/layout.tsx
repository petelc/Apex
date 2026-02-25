import { getNavSections } from '@/lib/docs'
import { DocsSidebar } from '@/components/DocsSidebar'

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const sections = getNavSections()

  return (
    // Extra top padding to clear the fixed navigation bar
    <div className="pt-16 flex min-h-screen">
      <DocsSidebar sections={sections} />
      <main className="flex-1 min-w-0 lg:pl-0">
        {/* Mobile: push content below the mobile docs nav bar */}
        <div className="lg:hidden h-14" />
        {children}
      </main>
    </div>
  )
}
