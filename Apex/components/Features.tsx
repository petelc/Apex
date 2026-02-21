'use client'

import { motion } from 'framer-motion'
import { 
  Workflow, 
  Shield, 
  BarChart3, 
  Users, 
  Clock, 
  CheckCircle2 
} from 'lucide-react'

export function Features() {
  const features = [
    {
      icon: Workflow,
      title: 'Smart Approval Workflows',
      description: 'Automated routing to CAB, approval chains, and emergency change fast-tracking. Never miss a step.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Shield,
      title: 'Risk Management',
      description: 'Built-in risk assessment, impact analysis, and rollback plans. Stay prepared for any scenario.',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: BarChart3,
      title: 'Analytics & Reporting',
      description: 'Real-time dashboards, success metrics, and compliance reports. Make data-driven decisions.',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Comments, notifications, and real-time updates. Keep everyone aligned and informed.',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Clock,
      title: 'Change Scheduling',
      description: 'Smart scheduling with conflict detection, change windows, and automated reminders.',
      color: 'from-indigo-500 to-blue-500',
    },
    {
      icon: CheckCircle2,
      title: 'Complete Audit Trail',
      description: 'Every action tracked and logged. Full compliance with ITIL, SOC2, and ISO standards.',
      color: 'from-teal-500 to-cyan-500',
    },
  ]

  return (
    <section className="py-24 px-4 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Everything You Need to Manage
            <br />
            <span className="bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
              Change with Confidence
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            APEX provides all the tools you need to streamline change management,
            reduce risks, and deliver successful changes every time.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative"
            >
              <div className="h-full bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-transparent">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity`} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <a
            href="/features"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all font-semibold text-lg shadow-lg shadow-primary-500/30"
          >
            Explore All Features
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  )
}
