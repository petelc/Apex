import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const BLOG_DIR = path.join(process.cwd(), 'content/blog')

export interface PostMeta {
  slug: string
  title: string
  date: string
  author: string
  authorRole: string
  authorInitials: string
  authorColor: string
  tags: string[]
  excerpt: string
  readTime: number
}

export interface Post extends PostMeta {
  content: string
}

function parseMeta(slug: string, data: Record<string, unknown>): PostMeta {
  return {
    slug,
    title: data.title as string,
    date: data.date as string,
    author: data.author as string,
    authorRole: (data.authorRole as string) ?? '',
    authorInitials: (data.authorInitials as string) ?? '',
    authorColor: (data.authorColor as string) ?? 'from-blue-500 to-cyan-500',
    tags: (data.tags as string[]) ?? [],
    excerpt: data.excerpt as string,
    readTime: (data.readTime as number) ?? 5,
  }
}

export function getAllPosts(): PostMeta[] {
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.mdx'))
  return files
    .map((file) => {
      const slug = file.replace(/\.mdx$/, '')
      const raw = fs.readFileSync(path.join(BLOG_DIR, file), 'utf8')
      const { data } = matter(raw)
      return parseMeta(slug, data)
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function getPost(slug: string): Post {
  const raw = fs.readFileSync(path.join(BLOG_DIR, `${slug}.mdx`), 'utf8')
  const { data, content } = matter(raw)
  return { ...parseMeta(slug, data), content }
}

export function getAllSlugs(): string[] {
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => f.replace(/\.mdx$/, ''))
}
