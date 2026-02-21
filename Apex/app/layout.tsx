import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'APEX - Enterprise Change Management Made Simple',
  description: 'Streamline IT change management with automated workflows, CAB approvals, and complete audit trails. Start your free trial today.',
  keywords: 'change management, ITIL, CAB, change advisory board, IT operations, ITSM',
  authors: [{ name: 'APEX' }],
  openGraph: {
    title: 'APEX - Enterprise Change Management',
    description: 'Streamline IT change management with automated workflows, CAB approvals, and complete audit trails.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'APEX - Enterprise Change Management',
    description: 'Streamline IT change management with automated workflows',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        <Navigation />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
