import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const DOCS_DIR = path.join(process.cwd(), 'content/docs')

export interface DocMeta {
  slug: string[]        // e.g. ['getting-started', 'quick-start']
  href: string          // e.g. /docs/getting-started/quick-start
  title: string
  description: string
  order: number
  section: string
  sectionOrder: number
}

export interface Doc extends DocMeta {
  content: string
}

export interface NavSection {
  section: string
  sectionOrder: number
  items: DocMeta[]
}

function slugToHref(slug: string[]): string {
  return `/docs/${slug.join('/')}`
}

function readDocMeta(filePath: string, slug: string[]): DocMeta {
  const raw = fs.readFileSync(filePath, 'utf8')
  const { data } = matter(raw)
  return {
    slug,
    href: slugToHref(slug),
    title: data.title as string,
    description: (data.description as string) ?? '',
    order: (data.order as number) ?? 99,
    section: data.section as string,
    sectionOrder: (data.sectionOrder as number) ?? 99,
  }
}

export function getAllDocs(): DocMeta[] {
  const result: DocMeta[] = []

  function walk(dir: string, prefix: string[]) {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.isDirectory()) {
        walk(path.join(dir, entry.name), [...prefix, entry.name])
      } else if (entry.name.endsWith('.mdx')) {
        const name = entry.name.replace(/\.mdx$/, '')
        const slug = [...prefix, name]
        result.push(readDocMeta(path.join(dir, entry.name), slug))
      }
    }
  }

  walk(DOCS_DIR, [])
  return result.sort((a, b) => {
    if (a.sectionOrder !== b.sectionOrder) return a.sectionOrder - b.sectionOrder
    return a.order - b.order
  })
}

export function getNavSections(): NavSection[] {
  const docs = getAllDocs()
  const map = new Map<string, NavSection>()

  for (const doc of docs) {
    if (!map.has(doc.section)) {
      map.set(doc.section, { section: doc.section, sectionOrder: doc.sectionOrder, items: [] })
    }
    map.get(doc.section)!.items.push(doc)
  }

  return Array.from(map.values()).sort((a, b) => a.sectionOrder - b.sectionOrder)
}

export function getDoc(slug: string[]): Doc {
  const filePath = path.join(DOCS_DIR, ...slug) + '.mdx'
  const raw = fs.readFileSync(filePath, 'utf8')
  const { data, content } = matter(raw)
  return {
    slug,
    href: slugToHref(slug),
    title: data.title as string,
    description: (data.description as string) ?? '',
    order: (data.order as number) ?? 99,
    section: data.section as string,
    sectionOrder: (data.sectionOrder as number) ?? 99,
    content,
  }
}

export function getAllDocSlugs(): string[][] {
  const result: string[][] = []

  function walk(dir: string, prefix: string[]) {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.isDirectory()) {
        walk(path.join(dir, entry.name), [...prefix, entry.name])
      } else if (entry.name.endsWith('.mdx')) {
        result.push([...prefix, entry.name.replace(/\.mdx$/, '')])
      }
    }
  }

  walk(DOCS_DIR, [])
  return result
}
