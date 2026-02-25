'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Clock, ArrowRight, Tag } from 'lucide-react'
import type { PostMeta } from '@/lib/blog'

const ALL_TAG = 'All'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export function BlogIndex({ posts }: { posts: PostMeta[] }) {
  const allTags = [ALL_TAG, ...Array.from(new Set(posts.flatMap((p) => p.tags))).sort()]
  const [activeTag, setActiveTag] = useState(ALL_TAG)

  const filtered = activeTag === ALL_TAG ? posts : posts.filter((p) => p.tags.includes(activeTag))
  const [featured, ...rest] = filtered

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-blue-50 -z-10" />
        <div className="max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              The APEX{' '}
              <span className="bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
                Blog
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Practical guides, best practices, and insights on IT change management — written by practitioners, for practitioners.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Tag filter */}
          <div className="flex flex-wrap gap-3 mb-12 justify-center">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeTag === tag
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300 hover:text-primary-600'
                }`}
              >
                {tag !== ALL_TAG && <Tag className="w-3 h-3" />}
                {tag}
              </button>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-24 text-gray-400">No posts in this category yet.</div>
          )}

          {/* Featured post */}
          {featured && (
            <motion.div
              key={featured.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <Link href={`/blog/${featured.slug}`} className="group block">
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 grid lg:grid-cols-2">
                  {/* Visual */}
                  <div className="bg-gradient-to-br from-primary-600 to-primary-800 p-12 flex items-center justify-center min-h-48">
                    <div className="text-center text-white">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${featured.authorColor} flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-lg`}>
                        {featured.authorInitials}
                      </div>
                      <div className="font-semibold">{featured.author}</div>
                      <div className="text-primary-200 text-sm">{featured.authorRole}</div>
                    </div>
                  </div>
                  {/* Content */}
                  <div className="p-10 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {featured.tags.map((t) => (
                          <span key={t} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-semibold">
                            {t}
                          </span>
                        ))}
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 group-hover:text-primary-700 transition-colors leading-tight">
                        {featured.title}
                      </h2>
                      <p className="text-gray-600 leading-relaxed mb-6">{featured.excerpt}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>{formatDate(featured.date)}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {featured.readTime} min read
                        </span>
                      </div>
                      <span className="flex items-center gap-1 text-primary-600 font-semibold text-sm group-hover:gap-2 transition-all">
                        Read more <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}

          {/* Post grid */}
          {rest.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {rest.map((post, index) => (
                <motion.div
                  key={post.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={`/blog/${post.slug}`} className="group block h-full">
                    <div className="h-full bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                      {/* Author band */}
                      <div className={`bg-gradient-to-br ${post.authorColor} px-6 py-4 flex items-center gap-3`}>
                        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {post.authorInitials}
                        </div>
                        <div className="text-white min-w-0">
                          <div className="font-semibold text-sm truncate">{post.author}</div>
                          <div className="text-white/75 text-xs truncate">{post.authorRole}</div>
                        </div>
                      </div>

                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {post.tags.map((t) => (
                            <span key={t} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                              {t}
                            </span>
                          ))}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-primary-700 transition-colors leading-snug flex-1">
                          {post.title}
                        </h3>
                        <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-4">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-gray-100">
                          <span>{formatDate(post.date)}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {post.readTime} min
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-24 px-4 bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Get New Posts in Your Inbox</h2>
          <p className="text-primary-200 mb-8">
            No spam. One email per week when we publish. Unsubscribe any time.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="you@company.com"
              className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/50"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-white text-primary-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}
