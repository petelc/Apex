'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

export function Testimonials() {
  const testimonials = [
    {
      quote: "APEX transformed how we handle changes. Approval times dropped by 60% and we haven't had an unplanned outage since implementation.",
      author: "Sarah Chen",
      role: "IT Director",
      company: "TechCorp Global",
      rating: 5,
    },
    {
      quote: "The audit trail and compliance features saved us during our SOC2 audit. Everything we needed was right there, perfectly documented.",
      author: "Michael Rodriguez",
      role: "CTO",
      company: "FinServe Inc",
      rating: 5,
    },
    {
      quote: "Our CAB meetings are now 50% shorter because everything is organized and tracked in APEX. Game changer for our team.",
      author: "Emily Thompson",
      role: "Change Manager",
      company: "Enterprise Systems",
      rating: 5,
    },
  ]

  return (
    <section className="py-24 px-4 bg-gradient-to-br from-primary-50 to-blue-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Loved by IT Teams Worldwide
          </h2>
          <p className="text-xl text-gray-600">
            See what our customers have to say about APEX
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div>
                <div className="font-bold text-gray-900">{testimonial.author}</div>
                <div className="text-sm text-gray-600">{testimonial.role}</div>
                <div className="text-sm text-primary-600 font-medium">{testimonial.company}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
