'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Workflow,
  Shield,
  BarChart3,
  Users,
  Clock,
  CheckCircle2,
  Bell,
  FileText,
  GitBranch,
  Lock,
  Zap,
  Globe,
  ArrowRight,
  Check,
} from 'lucide-react'

const categories = [
  {
    label: 'Workflows',
    icon: Workflow,
    color: 'from-blue-500 to-cyan-500',
    title: 'Smart Approval Workflows',
    description:
      'Automate your entire change lifecycle — from submission through CAB review to deployment. Configure multi-step approval chains, emergency fast-track paths, and automatic escalations.',
    features: [
      'Configurable multi-stage approval chains',
      'Emergency change fast-track with automatic CAB notification',
      'Automatic escalation on SLA breach',
      'Drag-and-drop workflow builder',
      'Conditional routing based on risk score',
    ],
  },
  {
    label: 'Risk Management',
    icon: Shield,
    color: 'from-purple-500 to-pink-500',
    title: 'Built-In Risk Assessment',
    description:
      'Quantify impact before you deploy. APEX scores every change request automatically based on system criticality, change window, and historical failure rates.',
    features: [
      'Automated risk scoring on every change',
      'Impact analysis across dependent systems',
      'Rollback plan tracking and documentation',
      'Conflict detection across scheduled changes',
      'Blackout window enforcement',
    ],
  },
  {
    label: 'Analytics',
    icon: BarChart3,
    color: 'from-orange-500 to-red-500',
    title: 'Real-Time Analytics & Reporting',
    description:
      'Understand your change success rate, mean time to approval, and failure trends at a glance. Export to CSV or integrate with your BI tooling.',
    features: [
      'Live KPI dashboards (success rate, MTTR, backlog)',
      'Change failure rate trend analysis',
      'Team velocity and throughput reports',
      'Compliance reports (ITIL, SOC2, ISO 20000)',
      'CSV and JSON export',
    ],
  },
  {
    label: 'Collaboration',
    icon: Users,
    color: 'from-green-500 to-emerald-500',
    title: 'Team Collaboration',
    description:
      'Keep every stakeholder aligned with inline comments, @mentions, real-time notifications, and a shared activity timeline on every change request.',
    features: [
      'Inline comments with @mentions',
      'Real-time notifications via email and in-app bell',
      'Shared activity timeline for every change',
      'Role-based permissions (Admin, Manager, User, ReadOnly)',
      'Department-level visibility scoping',
    ],
  },
  {
    label: 'Scheduling',
    icon: Clock,
    color: 'from-indigo-500 to-blue-500',
    title: 'Change Scheduling',
    description:
      'Schedule changes in approved maintenance windows, get alerted to conflicts, and let APEX send automated reminders to assignees and approvers.',
    features: [
      'Maintenance window management',
      'Conflict detection across concurrent changes',
      'Automated pre-change reminder emails',
      'Overdue change detection and escalation',
      'Calendar integration (Google, Outlook)',
    ],
  },
  {
    label: 'Audit Trail',
    icon: CheckCircle2,
    color: 'from-teal-500 to-cyan-500',
    title: 'Complete Audit Trail',
    description:
      'Every action on every change is recorded — who approved it, when, and why. Export full audit logs for compliance audits in seconds.',
    features: [
      'Immutable event log on every entity',
      'Who/when/why record for every state transition',
      'Export audit logs as PDF or CSV',
      'Tamper-proof storage',
      'ITIL, SOC2, and ISO 20000 ready',
    ],
  },
  {
    label: 'Notifications',
    icon: Bell,
    color: 'from-yellow-500 to-orange-500',
    title: 'Real-Time Notifications',
    description:
      'Never miss a critical change. APEX delivers instant in-app and email notifications via SignalR — so approvers are always in the loop the moment action is needed.',
    features: [
      'Real-time in-app notifications (SignalR)',
      'Email notifications for all state changes',
      'Configurable notification preferences',
      'Unread badge with one-click mark-all-read',
      'Deep-links directly to the relevant change',
    ],
  },
  {
    label: 'Deployments',
    icon: GitBranch,
    color: 'from-pink-500 to-rose-500',
    title: 'Deployment Management',
    description:
      'Link deployments directly to approved change requests. Track environment, scheduling, execution, and rollback through a purpose-built 10-state lifecycle.',
    features: [
      '10-state deployment lifecycle (Draft → Deployed)',
      'Link deployments to change requests and projects',
      'Per-environment tracking (Dev, Staging, Production)',
      'Rollback capture and documentation',
      'Deployment history and audit log',
    ],
  },
  {
    label: 'Security',
    icon: Lock,
    color: 'from-gray-600 to-gray-800',
    title: 'Enterprise Security',
    description:
      'Multi-tenant architecture with schema-level data isolation. JWT + refresh tokens, role-based access, and full audit trail — security is built in, not bolted on.',
    features: [
      'Schema-per-tenant data isolation',
      'JWT authentication with short-lived tokens',
      'Role-based access control (RBAC)',
      'All actions audited and tamper-proof',
      'SOC2 and GDPR ready',
    ],
  },
]

const integrations = [
  { name: 'Jira', color: 'bg-blue-100 text-blue-800' },
  { name: 'ServiceNow', color: 'bg-green-100 text-green-800' },
  { name: 'Slack', color: 'bg-purple-100 text-purple-800' },
  { name: 'Microsoft Teams', color: 'bg-blue-100 text-blue-700' },
  { name: 'PagerDuty', color: 'bg-green-100 text-green-700' },
  { name: 'GitHub', color: 'bg-gray-100 text-gray-800' },
  { name: 'Azure DevOps', color: 'bg-blue-100 text-blue-900' },
  { name: 'Webhooks', color: 'bg-orange-100 text-orange-800' },
]

export default function FeaturesPage() {
  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-blue-50 -z-10" />
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 rounded-full text-primary-700 font-medium text-sm mb-6">
              <Zap className="w-4 h-4" />
              Everything you need, nothing you don&apos;t
            </span>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              All the Features to{' '}
              <span className="bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
                Master Change
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
              APEX gives IT teams everything required to plan, approve, deploy, and audit changes —
              in one modern platform purpose-built for enterprise IT.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="px-8 py-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all font-semibold text-lg shadow-xl shadow-primary-500/30 hover:scale-105 inline-flex items-center gap-2 justify-center"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/pricing"
                className="px-8 py-4 bg-white text-gray-900 rounded-lg hover:bg-gray-50 transition-all font-semibold text-lg border-2 border-gray-200 inline-flex items-center justify-center"
              >
                View Pricing
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Deep Dives */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto space-y-32">
          {categories.map((cat, index) => {
            const Icon = cat.icon
            const isEven = index % 2 === 0
            return (
              <motion.div
                key={cat.label}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className={`grid lg:grid-cols-2 gap-16 items-center ${isEven ? '' : 'lg:grid-flow-dense'}`}
              >
                {/* Text */}
                <div className={isEven ? '' : 'lg:col-start-2'}>
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center mb-6 shadow-lg`}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    {cat.title}
                  </h2>
                  <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                    {cat.description}
                  </p>
                  <ul className="space-y-3">
                    {cat.features.map((f) => (
                      <li key={f} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Visual card */}
                <div className={isEven ? '' : 'lg:col-start-1 lg:row-start-1'}>
                  <div
                    className={`rounded-2xl bg-gradient-to-br ${cat.color} p-1 shadow-2xl`}
                  >
                    <div className="bg-white rounded-xl p-8 space-y-4">
                      <div className="flex items-center gap-3 mb-6">
                        <div
                          className={`w-10 h-10 rounded-lg bg-gradient-to-br ${cat.color} flex items-center justify-center`}
                        >
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="h-3 w-32 bg-gray-200 rounded" />
                          <div className="h-2 w-20 bg-gray-100 rounded mt-1" />
                        </div>
                      </div>
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-100 flex-shrink-0" />
                          <div className="flex-1 space-y-1">
                            <div
                              className="h-3 bg-gray-200 rounded"
                              style={{ width: `${70 + i * 5}%` }}
                            />
                            <div className="h-2 bg-gray-100 rounded w-1/2" />
                          </div>
                          <div
                            className={`h-6 w-16 rounded-full bg-gradient-to-r ${cat.color} opacity-20`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Integrations */}
      <section className="py-24 px-4 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Globe className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Connects With Your Stack
            </h2>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              APEX integrates with the tools your team already uses — via native connectors or webhooks.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              {integrations.map((int) => (
                <span
                  key={int.name}
                  className={`px-5 py-2.5 rounded-full font-semibold text-sm ${int.color}`}
                >
                  {int.name}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <FileText className="w-12 h-12 mx-auto mb-6 opacity-80" />
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to See It in Action?
            </h2>
            <p className="text-xl opacity-90 mb-10">
              Start a free 14-day trial — no credit card required. Get your team up and running in minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="px-8 py-4 bg-white text-primary-700 rounded-lg hover:bg-gray-50 transition-all font-semibold text-lg shadow-xl hover:scale-105 inline-flex items-center gap-2 justify-center"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/contact"
                className="px-8 py-4 bg-transparent text-white rounded-lg hover:bg-white/10 transition-all font-semibold text-lg border-2 border-white/40 inline-flex items-center justify-center"
              >
                Talk to Sales
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
