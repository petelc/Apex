'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Heart, Target, Shield, Users, ArrowRight, Globe } from 'lucide-react'

const values = [
  {
    icon: Target,
    title: 'Clarity Over Complexity',
    description: 'Change management shouldn\'t require a PhD. We build every feature to be intuitive on day one.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Shield,
    title: 'Trust Through Transparency',
    description: 'Every action audited, every decision traceable. We believe accountability builds better teams.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Users,
    title: 'Built for Teams',
    description: 'IT is a team sport. APEX is designed for collaboration — not silos.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Heart,
    title: 'Customer Obsession',
    description: 'We ship features based on real customer pain, not roadmap theatre. Your feedback shapes the product.',
    color: 'from-orange-500 to-red-500',
  },
]

const team = [
  { name: 'Sarah Chen', role: 'CEO & Co-founder', initials: 'SC', color: 'from-blue-500 to-cyan-500', bio: 'Former ITSM architect at Cisco. Built and sold two enterprise software companies.' },
  { name: 'Marcus Williams', role: 'CTO & Co-founder', initials: 'MW', color: 'from-purple-500 to-pink-500', bio: '15 years building distributed systems at AWS and Stripe. Believes great software is boring in the best way.' },
  { name: 'Priya Patel', role: 'VP of Product', initials: 'PP', color: 'from-green-500 to-emerald-500', bio: 'Product leader from ServiceNow and Atlassian. Obsessed with reducing friction in complex workflows.' },
  { name: 'James O\'Brien', role: 'VP of Engineering', initials: 'JO', color: 'from-orange-500 to-amber-500', bio: 'Led engineering at three Series B startups. Passionate about clean architecture and zero-downtime deployments.' },
  { name: 'Aisha Okonkwo', role: 'Head of Customer Success', initials: 'AO', color: 'from-teal-500 to-cyan-500', bio: 'Spent a decade in enterprise IT operations before pivoting to CS. Knows exactly what keeps IT leaders up at night.' },
  { name: 'Tom Nakamura', role: 'Head of Design', initials: 'TN', color: 'from-indigo-500 to-blue-500', bio: 'Design systems lead from Figma and Linear. Believes enterprise software can be beautiful.' },
]

const milestones = [
  { year: '2022', title: 'Founded', description: 'Two frustrated IT architects decide to build the tool they always wished existed.' },
  { year: '2023', title: 'Seed Round', description: '$3.2M raised. First 50 enterprise customers onboarded across the US and UK.' },
  { year: '2024', title: 'Series A', description: '$14M raised. Expanded to 500+ customers across 22 countries.' },
  { year: '2025', title: '1,000 Customers', description: 'Milestone reached. Launched Deployment Management and real-time notifications.' },
  { year: '2026', title: 'Today', description: 'Trusted by 1,500+ IT teams worldwide, processing over 2M change requests.' },
]

export default function AboutPage() {
  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-blue-50 -z-10" />
        <div className="max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 rounded-full text-primary-700 font-medium text-sm mb-6">
              <Globe className="w-4 h-4" />
              Trusted by 1,500+ IT teams worldwide
            </span>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              We&apos;re on a Mission to Make{' '}
              <span className="bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
                Change Management Human
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              APEX was born from frustration. Two IT architects, tired of clunky tools and endless email threads,
              decided to build the change management platform they always wished existed.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Why We Built APEX
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed text-lg">
                <p>
                  Change management exists for a reason: uncontrolled changes cause outages, failed audits, and eroded trust.
                  But the tools built to prevent chaos were themselves chaotic — complex, expensive, and designed for compliance
                  theatre rather than real teamwork.
                </p>
                <p>
                  We believed there had to be a better way. A platform that makes it <em>easier</em> to do the right thing.
                  Where workflows feel like assistance, not bureaucracy. Where every team member — from the junior analyst
                  to the CISO — has exactly the visibility they need.
                </p>
                <p>
                  That&apos;s APEX. Change management built for humans first, compliance second.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-6"
            >
              {[
                { number: '1,500+', label: 'Enterprise Customers' },
                { number: '22', label: 'Countries' },
                { number: '2M+', label: 'Changes Managed' },
                { number: '99.9%', label: 'Uptime SLA' },
              ].map((stat) => (
                <div key={stat.label} className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-2xl p-8 text-center border border-primary-100">
                  <div className="text-4xl font-bold text-primary-700 mb-2">{stat.number}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 px-4 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              These aren&apos;t words on a wall. They&apos;re the principles every decision gets checked against.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${value.color} flex items-center justify-center mb-5 shadow-md`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Journey</h2>
            <p className="text-xl text-gray-600">From a side-project to a platform trusted by 1,500+ enterprises.</p>
          </motion.div>

          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-primary-200" />
            <div className="space-y-12">
              {milestones.map((m, i) => (
                <motion.div
                  key={m.year}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative pl-20"
                >
                  <div className="absolute left-4 w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold shadow-lg">
                    {i + 1}
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                    <div className="text-primary-600 font-bold text-sm mb-1">{m.year}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{m.title}</h3>
                    <p className="text-gray-600">{m.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 px-4 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">The Team</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experienced practitioners from enterprise software, cloud infrastructure, and IT operations.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${member.color} flex items-center justify-center text-white font-bold text-xl mb-5 shadow-md`}>
                  {member.initials}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                <div className="text-primary-600 font-medium text-sm mb-3">{member.role}</div>
                <p className="text-gray-600 text-sm leading-relaxed">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Join Our Journey</h2>
            <p className="text-xl opacity-90 mb-10">
              Be part of the 1,500+ teams already managing change with confidence.
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
                Get in Touch
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
