import { getAllSlugs, getPost, getAllPosts } from '@/lib/blog'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import Link from 'next/link'
import { Clock, ArrowLeft, Tag } from 'lucide-react'

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  try {
    const post = getPost(slug)
    return { title: `${post.title} — APEX Blog`, description: post.excerpt }
  } catch {
    return {}
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  let post
  try {
    post = getPost(slug)
  } catch {
    notFound()
  }

  const allPosts = getAllPosts()
  const related = allPosts
    .filter((p) => p.slug !== slug && p.tags.some((t) => post.tags.includes(t)))
    .slice(0, 3)

  return (
    <div className="pt-16">
      {/* Header */}
      <section className="relative py-16 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-blue-50 -z-10" />
        <div className="max-w-3xl mx-auto">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium mb-8 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map((t) => (
              <span key={t} className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                <Tag className="w-3 h-3" />
                {t}
              </span>
            ))}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${post.authorColor} flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0`}>
              {post.authorInitials}
            </div>
            <div>
              <div className="font-semibold text-gray-900">{post.author}</div>
              <div className="text-gray-500 text-sm flex items-center gap-3">
                <span>{post.authorRole}</span>
                <span>·</span>
                <span>{formatDate(post.date)}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {post.readTime} min read
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="prose prose-lg prose-gray max-w-none
            prose-headings:font-bold prose-headings:text-gray-900
            prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-4
            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
            prose-p:text-gray-600 prose-p:leading-relaxed prose-p:mb-4
            prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-gray-900
            prose-ul:text-gray-600 prose-ol:text-gray-600
            prose-li:mb-1
            prose-blockquote:border-primary-500 prose-blockquote:text-gray-600 prose-blockquote:bg-primary-50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
            prose-table:text-sm
            prose-th:bg-primary-50 prose-th:text-primary-800 prose-th:font-semibold
            prose-td:text-gray-600
            prose-hr:border-gray-200
            prose-code:text-primary-700 prose-code:bg-primary-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
          ">
            <MDXRemote source={post.content} />
          </div>

          {/* Author card */}
          <div className="mt-16 p-8 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border border-gray-100 flex items-start gap-5">
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${post.authorColor} flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0`}>
              {post.authorInitials}
            </div>
            <div>
              <div className="font-bold text-gray-900 text-lg">{post.author}</div>
              <div className="text-primary-600 text-sm font-medium mb-3">{post.authorRole}, APEX</div>
              <p className="text-gray-600 text-sm leading-relaxed">
                The APEX team writes practical guides on IT change management, ITIL best practices, and building
                high-performing IT operations teams.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Related posts */}
      {related.length > 0 && (
        <section className="py-16 px-4 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {related.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`} className="group block">
                  <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all">
                    <div className={`bg-gradient-to-br ${p.authorColor} px-5 py-3 flex items-center gap-2`}>
                      <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xs">
                        {p.authorInitials}
                      </div>
                      <div className="text-white text-sm font-medium truncate">{p.author}</div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-gray-900 leading-snug group-hover:text-primary-700 transition-colors text-sm mb-2">
                        {p.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        {p.readTime} min read
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 px-4 bg-white border-t border-gray-100">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to put this into practice?
          </h2>
          <p className="text-gray-600 mb-8">
            APEX gives your team the workflows, analytics, and audit trails to make change management work.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all font-semibold shadow-lg shadow-primary-500/30 hover:scale-105"
          >
            Start Free Trial
          </Link>
        </div>
      </section>
    </div>
  )
}
