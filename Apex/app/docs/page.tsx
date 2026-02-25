import { getAllDocs } from '@/lib/docs'
import Link from 'next/link'
import { ArrowRight, BookOpen, Workflow, Rocket, Code2 } from 'lucide-react'

export const metadata = {
  title: 'Documentation — APEX',
  description: 'Everything you need to get the most out of APEX change management.',
}

const sectionIcons: Record<string, React.ElementType> = {
  'Getting Started': BookOpen,
  'Workflows': Workflow,
  'Deployments': Rocket,
  'API Reference': Code2,
}

const sectionColors: Record<string, string> = {
  'Getting Started': 'from-blue-500 to-cyan-500',
  'Workflows': 'from-purple-500 to-pink-500',
  'Deployments': 'from-green-500 to-emerald-500',
  'API Reference': 'from-orange-500 to-red-500',
}

export default function DocsIndexPage() {
  const docs = getAllDocs()

  // Group by section
  const sections = docs.reduce<Record<string, typeof docs>>((acc, doc) => {
    if (!acc[doc.section]) acc[doc.section] = []
    acc[doc.section].push(doc)
    return acc
  }, {})

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">APEX Documentation</h1>
        <p className="text-xl text-gray-600">
          Everything you need to get your team up and running with APEX change management.
        </p>
      </div>

      {/* Quick start banner */}
      <Link
        href="/docs/getting-started/quick-start"
        className="group block mb-12 bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-8 text-white hover:shadow-xl transition-all"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-primary-200 text-sm font-semibold mb-2 uppercase tracking-wide">Start Here</div>
            <h2 className="text-2xl font-bold mb-2">Quick Start Guide</h2>
            <p className="text-primary-200">
              Be up and running with your first approved change request in under 5 minutes.
            </p>
          </div>
          <ArrowRight className="w-8 h-8 text-white/60 group-hover:translate-x-1 transition-transform flex-shrink-0" />
        </div>
      </Link>

      {/* Section cards */}
      <div className="space-y-10">
        {Object.entries(sections).map(([sectionName, sectionDocs]) => {
          const Icon = sectionIcons[sectionName] ?? BookOpen
          const color = sectionColors[sectionName] ?? 'from-gray-500 to-gray-700'

          return (
            <div key={sectionName}>
              <div className="flex items-center gap-3 mb-5">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center shadow`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{sectionName}</h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {sectionDocs.map((doc) => (
                  <Link
                    key={doc.href}
                    href={doc.href}
                    className="group block p-5 bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-primary-700 transition-colors mb-1">
                          {doc.title}
                        </h3>
                        {doc.description && (
                          <p className="text-sm text-gray-500 leading-relaxed">{doc.description}</p>
                        )}
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary-500 transition-colors flex-shrink-0 mt-0.5" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Help CTA */}
      <div className="mt-16 p-8 bg-gray-50 rounded-2xl border border-gray-200 text-center">
        <h3 className="font-bold text-gray-900 text-lg mb-2">Can&apos;t find what you&apos;re looking for?</h3>
        <p className="text-gray-600 mb-6">
          Our support team is happy to help. Reach us via the in-app chat or email.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/contact"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold text-sm"
          >
            Contact Support
          </Link>
          <a
            href="mailto:support@apex.io"
            className="px-6 py-3 bg-white text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors font-semibold text-sm"
          >
            support@apex.io
          </a>
        </div>
      </div>
    </div>
  )
}
