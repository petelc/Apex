import { getAllDocSlugs, getDoc, getNavSections } from '@/lib/docs'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'

export async function generateStaticParams() {
  return getAllDocSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params
  try {
    const doc = getDoc(slug)
    return { title: `${doc.title} — APEX Docs`, description: doc.description }
  } catch {
    return {}
  }
}

export default async function DocPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params
  let doc
  try {
    doc = getDoc(slug)
  } catch {
    notFound()
  }

  // Build flat list of all docs for prev/next
  const sections = getNavSections()
  const allDocs = sections.flatMap((s) => s.items)
  const currentIndex = allDocs.findIndex((d) => d.href === doc.href)
  const prev = currentIndex > 0 ? allDocs[currentIndex - 1] : null
  const next = currentIndex < allDocs.length - 1 ? allDocs[currentIndex + 1] : null

  return (
    <article className="max-w-3xl mx-auto px-6 py-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <Link href="/docs" className="hover:text-primary-600 transition-colors">Docs</Link>
        <span>/</span>
        <span className="text-gray-600">{doc.section}</span>
        <span>/</span>
        <span className="text-gray-900 font-medium">{doc.title}</span>
      </div>

      {/* Header */}
      <header className="mb-10 pb-8 border-b border-gray-200">
        <div className="text-sm font-semibold text-primary-600 uppercase tracking-wide mb-3">{doc.section}</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">{doc.title}</h1>
        {doc.description && (
          <p className="text-xl text-gray-500 leading-relaxed">{doc.description}</p>
        )}
      </header>

      {/* Content */}
      <div className="prose prose-lg prose-gray max-w-none
        prose-headings:font-bold prose-headings:text-gray-900
        prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-gray-100
        prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
        prose-p:text-gray-600 prose-p:leading-relaxed prose-p:mb-4
        prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline prose-a:font-medium
        prose-strong:text-gray-900 prose-strong:font-semibold
        prose-ul:text-gray-600 prose-ol:text-gray-600
        prose-li:mb-1.5
        prose-blockquote:border-primary-500 prose-blockquote:bg-primary-50 prose-blockquote:text-gray-600 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
        prose-table:text-sm
        prose-th:bg-gray-50 prose-th:text-gray-700 prose-th:font-semibold prose-th:py-3
        prose-td:text-gray-600 prose-td:py-2.5
        prose-hr:border-gray-200
        prose-code:text-primary-700 prose-code:bg-primary-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
        prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-xl prose-pre:shadow-lg
      ">
        <MDXRemote source={doc.content} />
      </div>

      {/* Prev / Next */}
      <nav className="mt-16 pt-8 border-t border-gray-200 grid grid-cols-2 gap-4">
        <div>
          {prev && (
            <Link
              href={prev.href}
              className="group block p-4 rounded-xl border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all"
            >
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-1 group-hover:text-primary-500">
                <ArrowLeft className="w-3.5 h-3.5" />
                Previous
              </div>
              <div className="font-semibold text-gray-900 text-sm group-hover:text-primary-700 transition-colors">
                {prev.title}
              </div>
            </Link>
          )}
        </div>
        <div className="text-right">
          {next && (
            <Link
              href={next.href}
              className="group block p-4 rounded-xl border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all"
            >
              <div className="flex items-center justify-end gap-2 text-sm text-gray-400 mb-1 group-hover:text-primary-500">
                Next
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
              <div className="font-semibold text-gray-900 text-sm group-hover:text-primary-700 transition-colors">
                {next.title}
              </div>
            </Link>
          )}
        </div>
      </nav>
    </article>
  )
}
