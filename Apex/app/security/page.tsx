'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Shield, Lock, Server, Eye, Key, Globe, CheckCircle, ArrowRight } from 'lucide-react'

const pillars = [
  {
    icon: Lock,
    color: 'from-blue-500 to-cyan-500',
    title: 'Data Encryption',
    points: [
      'TLS 1.3 for all data in transit',
      'AES-256 encryption for data at rest',
      'Database-level transparent data encryption (TDE)',
      'Encrypted backups stored cross-region',
    ],
  },
  {
    icon: Server,
    color: 'from-purple-500 to-pink-500',
    title: 'Infrastructure',
    points: [
      'Hosted on Microsoft Azure (EU and US regions)',
      'Schema-per-tenant multi-tenant isolation',
      'Automated daily backups with 30-day retention',
      'Zero-downtime deployments via blue-green strategy',
    ],
  },
  {
    icon: Key,
    color: 'from-green-500 to-emerald-500',
    title: 'Authentication & Access',
    points: [
      'JWT access tokens with short expiry (15 minutes)',
      'Refresh token rotation on every use',
      'Role-based access control (RBAC) — 4 system roles',
      'Multi-tenant isolation via JWT claim extraction',
    ],
  },
  {
    icon: Eye,
    color: 'from-orange-500 to-red-500',
    title: 'Audit & Monitoring',
    points: [
      'Immutable audit log on every entity',
      'Application Insights for observability',
      'Anomaly detection and alerting',
      'Security event logging retained for 12 months',
    ],
  },
  {
    icon: Globe,
    color: 'from-teal-500 to-cyan-500',
    title: 'Compliance',
    points: [
      'ITIL 4 aligned change management process',
      'SOC 2 Type II (in progress)',
      'GDPR data processing agreements available',
      'ISO 27001 controls implemented',
    ],
  },
  {
    icon: Shield,
    color: 'from-indigo-500 to-blue-500',
    title: 'Vulnerability Management',
    points: [
      'Quarterly third-party penetration testing',
      'Automated dependency scanning (Dependabot)',
      'Responsible disclosure programme',
      'SLA: critical patches within 24 hours',
    ],
  },
]

const certifications = [
  { name: 'SOC 2 Type II', status: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
  { name: 'ISO 27001', status: 'Controls Implemented', color: 'bg-blue-100 text-blue-800' },
  { name: 'GDPR', status: 'Compliant', color: 'bg-green-100 text-green-800' },
  { name: 'ITIL 4', status: 'Aligned', color: 'bg-purple-100 text-purple-800' },
]

export default function SecurityPage() {
  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-blue-50 -z-10" />
        <div className="max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Shield className="w-16 h-16 text-primary-600 mx-auto mb-6" />
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Security at{' '}
              <span className="bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
                Every Layer
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
              APEX is built for enterprise IT teams who take security seriously. Your data is isolated,
              encrypted, and audited — always.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              {certifications.map((c) => (
                <span key={c.name} className={`px-4 py-2 rounded-full font-semibold text-sm ${c.color}`}>
                  {c.name} — {c.status}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Security Pillars */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Security Programme</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Security isn&apos;t a feature — it&apos;s the foundation. Here&apos;s how we protect your data.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pillars.map((pillar, index) => {
              const Icon = pillar.icon
              return (
                <motion.div
                  key={pillar.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-50 rounded-2xl p-8 border border-gray-100"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${pillar.color} flex items-center justify-center mb-5 shadow-md`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{pillar.title}</h3>
                  <ul className="space-y-3">
                    {pillar.points.map((point) => (
                      <li key={point} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600 text-sm">{point}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Responsible Disclosure */}
      <section className="py-24 px-4 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-10 shadow-lg border border-gray-100"
          >
            <Shield className="w-10 h-10 text-primary-600 mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Responsible Disclosure</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              We take vulnerability reports seriously. If you&apos;ve found a security issue in APEX,
              please email <a href="mailto:security@apex.io" className="text-primary-600 hover:underline font-medium">security@apex.io</a>{' '}
              with details. We acknowledge all reports within 24 hours and commit to:
            </p>
            <ul className="space-y-3 mb-8">
              {[
                'Acknowledge receipt within 24 hours',
                'Provide a timeline for investigation within 72 hours',
                'Patch critical vulnerabilities within 24 hours of confirmation',
                'Credit reporters publicly (with permission)',
                'Not pursue legal action for good-faith disclosures',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
            <a
              href="mailto:security@apex.io"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
            >
              Report a Vulnerability
              <ArrowRight className="w-5 h-5" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Have Security Questions?</h2>
            <p className="text-gray-600 mb-8 text-lg">
              Our security team is happy to walk you through our controls, provide documentation,
              or complete a vendor security assessment.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact?type=enterprise"
                className="px-8 py-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all font-semibold shadow-lg shadow-primary-500/30 flex items-center gap-2 justify-center"
              >
                Talk to Our Security Team
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="mailto:security@apex.io"
                className="px-8 py-4 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-all font-semibold flex items-center justify-center"
              >
                security@apex.io
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
