import { getAllPosts } from '@/lib/blog'
import { BlogIndex } from './BlogIndex'

export const metadata = {
  title: 'Blog — APEX',
  description: 'Practical guides, best practices, and insights on IT change management from the APEX team.',
}

export default function BlogPage() {
  const posts = getAllPosts()
  return <BlogIndex posts={posts} />
}
