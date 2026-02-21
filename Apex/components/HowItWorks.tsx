'use client'

import { motion } from 'framer-motion'

export function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Create Change Request',
      description: 'Submit a change with all required details - impact, risk, and rollback plan.',
    },
    {
      number: '02',
      title: 'Automated Approval',
      description: 'Request automatically routed to CAB. Track progress in real-time.',
    },
    {
      number: '03',
      title: 'Schedule & Execute',
      description: 'Schedule the change, execute with confidence, and track completion.',
    },
    {
      number: '04',
      title: 'Analytics & Insights',
      description: 'Review success metrics, identify trends, and continuously improve.',
    },
  ]

  return (
    <section className="py-24 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600">
            From request to completion in four simple steps
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <div className="text-8xl font-bold text-primary-100 absolute -top-8 -left-4 -z-10">
                {step.number}
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary-300 to-transparent" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
