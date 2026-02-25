'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Check, X, HelpCircle, ArrowRight, Zap } from 'lucide-react'

const plans = [
  {
    name: 'Starter',
    monthly: 49,
    annual: 39,
    description: 'Perfect for small IT teams getting started with structured change management.',
    features: [
      'Up to 50 change requests/month',
      '5 team members',
      'Basic approval workflows',
      'Email notifications',
      'Basic analytics',
      'Audit trail (90-day retention)',
      'Email support (48hr SLA)',
    ],
    notIncluded: [
      'Custom workflows',
      'API access',
      'SignalR real-time notifications',
      'Priority support',
      'SSO / SAML',
      'Dedicated success manager',
    ],
    cta: 'Start Free Trial',
    href: '/signup?plan=starter',
    popular: false,
    highlight: false,
  },
  {
    name: 'Professional',
    monthly: 149,
    annual: 119,
    description: 'The full APEX platform for growing teams that need unlimited scale and advanced features.',
    features: [
      'Unlimited change requests',
      'Unlimited team members',
      'Custom approval workflows',
      'Email + real-time in-app notifications',
      'Advanced analytics & CSV export',
      'Deployment management',
      'Full audit trail (unlimited retention)',
      'API access',
      'Priority support (8hr SLA)',
      'Webhook integrations',
    ],
    notIncluded: [
      'SSO / SAML',
      'Dedicated success manager',
      'On-premise deployment',
      'Custom SLA',
    ],
    cta: 'Start Free Trial',
    href: '/signup?plan=professional',
    popular: true,
    highlight: true,
  },
  {
    name: 'Enterprise',
    monthly: null,
    annual: null,
    description: 'Tailored for large organisations with advanced security, compliance, and support requirements.',
    features: [
      'Everything in Professional',
      'SSO / SAML integration',
      'Dedicated success manager',
      'Custom SLA guarantee',
      'On-premise or private cloud option',
      'Advanced security & RBAC',
      'Unlimited audit retention',
      'Custom integrations',
      'Phone support (2hr SLA)',
      'Quarterly business reviews',
    ],
    notIncluded: [],
    cta: 'Contact Sales',
    href: '/contact?type=enterprise',
    popular: false,
    highlight: false,
  },
]

const comparison = [
  {
    category: 'Core',
    rows: [
      { feature: 'Change requests per month', starter: '50', professional: 'Unlimited', enterprise: 'Unlimited' },
      { feature: 'Team members', starter: '5', professional: 'Unlimited', enterprise: 'Unlimited' },
      { feature: 'Projects', starter: '10', professional: 'Unlimited', enterprise: 'Unlimited' },
      { feature: 'Deployments', starter: false, professional: true, enterprise: true },
    ],
  },
  {
    category: 'Workflows',
    rows: [
      { feature: 'Basic approval chains', starter: true, professional: true, enterprise: true },
      { feature: 'Custom workflow builder', starter: false, professional: true, enterprise: true },
      { feature: 'Emergency fast-track', starter: true, professional: true, enterprise: true },
      { feature: 'Automatic escalation', starter: false, professional: true, enterprise: true },
    ],
  },
  {
    category: 'Analytics',
    rows: [
      { feature: 'Basic dashboards', starter: true, professional: true, enterprise: true },
      { feature: 'Advanced analytics', starter: false, professional: true, enterprise: true },
      { feature: 'CSV export', starter: false, professional: true, enterprise: true },
      { feature: 'Custom reports', starter: false, professional: false, enterprise: true },
    ],
  },
  {
    category: 'Security & Compliance',
    rows: [
      { feature: 'Audit trail', starter: '90-day', professional: 'Unlimited', enterprise: 'Unlimited' },
      { feature: 'Role-based access (RBAC)', starter: true, professional: true, enterprise: true },
      { feature: 'SSO / SAML', starter: false, professional: false, enterprise: true },
      { feature: 'On-premise option', starter: false, professional: false, enterprise: true },
    ],
  },
  {
    category: 'Support',
    rows: [
      { feature: 'Email support', starter: '48hr SLA', professional: '8hr SLA', enterprise: '2hr SLA' },
      { feature: 'Priority support', starter: false, professional: true, enterprise: true },
      { feature: 'Dedicated success manager', starter: false, professional: false, enterprise: true },
      { feature: 'Custom onboarding', starter: false, professional: false, enterprise: true },
    ],
  },
]

const faqs = [
  {
    q: 'Is there really no credit card required for the free trial?',
    a: "Correct — your 14-day trial is completely free, no payment details needed. At the end of the trial you choose a plan or your workspace is paused (all data retained for 30 days).",
  },
  {
    q: 'Can I change plans at any time?',
    a: "Yes. Upgrade instantly and the new plan takes effect immediately. Downgrade at your next billing cycle.",
  },
  {
    q: 'What counts as a change request?',
    a: "A change request is any workflow item created in the Change Requests section. Project requests and deployment requests are tracked separately and don't count toward this limit.",
  },
  {
    q: 'Do you offer discounts for non-profits or education?',
    a: "Yes — contact us at sales@apex.io with proof of status and we'll apply a 40% discount on any plan.",
  },
  {
    q: 'Is my data safe if I cancel?',
    a: "Absolutely. On cancellation your workspace enters a 30-day grace period where you can export all data as CSV. After 30 days data is permanently deleted.",
  },
  {
    q: 'What payment methods do you accept?',
    a: "We accept all major credit cards (Visa, Mastercard, Amex) and ACH bank transfer for annual plans. Enterprise customers can pay by invoice.",
  },
]

function Cell({ value }: { value: boolean | string }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="w-5 h-5 text-success-500 mx-auto" />
    ) : (
      <X className="w-5 h-5 text-gray-300 mx-auto" />
    )
  }
  return <span className="text-gray-700 text-sm font-medium">{value}</span>
}

export default function PricingPage() {
  const [annual, setAnnual] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-blue-50 -z-10" />
        <div className="max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 rounded-full text-primary-700 font-medium text-sm mb-6">
              <Zap className="w-4 h-4" />
              14-day free trial — no credit card required
            </span>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 leading-tight">
              Simple,{' '}
              <span className="bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
                Transparent Pricing
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
              Start free, scale as you grow. No hidden fees, no per-seat surprises on the Professional plan.
            </p>

            {/* Toggle */}
            <div className="flex items-center justify-center gap-4">
              <span className={`font-medium ${annual ? 'text-gray-400' : 'text-gray-900'}`}>Monthly</span>
              <button
                onClick={() => setAnnual(!annual)}
                className={`relative w-14 h-7 rounded-full transition-colors ${annual ? 'bg-primary-600' : 'bg-gray-300'}`}
              >
                <span
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${annual ? 'translate-x-8' : 'translate-x-1'}`}
                />
              </button>
              <span className={`font-medium ${annual ? 'text-gray-900' : 'text-gray-400'}`}>
                Annual{' '}
                <span className="text-success-600 text-sm font-semibold">Save 20%</span>
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Plan Cards */}
      <section className="pb-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary-600 text-white text-sm font-semibold rounded-full z-10">
                    Most Popular
                  </div>
                )}
                <div
                  className={`h-full bg-white rounded-2xl p-8 flex flex-col ${
                    plan.highlight
                      ? 'border-2 border-primary-600 shadow-2xl shadow-primary-500/20'
                      : 'border border-gray-200 shadow-lg'
                  }`}
                >
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6 text-sm leading-relaxed">{plan.description}</p>

                  <div className="mb-8">
                    {plan.monthly ? (
                      <>
                        <span className="text-5xl font-bold text-gray-900">
                          ${annual ? plan.annual : plan.monthly}
                        </span>
                        <span className="text-gray-500 ml-2">/month</span>
                        {annual && (
                          <div className="text-sm text-success-600 font-medium mt-1">
                            Billed annually — save ${((plan.monthly! - plan.annual!) * 12)}
                          </div>
                        )}
                      </>
                    ) : (
                      <span className="text-4xl font-bold text-gray-900">Custom</span>
                    )}
                  </div>

                  <Link
                    href={plan.href}
                    className={`block text-center px-6 py-3 rounded-lg font-semibold transition-all mb-8 ${
                      plan.highlight
                        ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-500/30'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {plan.cta}
                  </Link>

                  <ul className="space-y-3 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-3">
                        <Check className="w-4 h-4 text-success-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">{f}</span>
                      </li>
                    ))}
                    {plan.notIncluded.map((f) => (
                      <li key={f} className="flex items-start gap-3 opacity-40">
                        <X className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-500 text-sm line-through">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-24 px-4 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Full Feature Comparison</h2>
            <p className="text-xl text-gray-600">Every detail, side by side.</p>
          </motion.div>

          <div className="overflow-x-auto rounded-2xl shadow-lg border border-gray-200 bg-white">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left px-6 py-4 text-gray-500 font-medium w-1/2">Feature</th>
                  <th className="text-center px-6 py-4 text-gray-900 font-bold">Starter</th>
                  <th className="text-center px-6 py-4 text-primary-700 font-bold bg-primary-50">Professional</th>
                  <th className="text-center px-6 py-4 text-gray-900 font-bold">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((section) => (
                  <React.Fragment key={section.category}>
                    <tr className="bg-gray-50">
                      <td colSpan={4} className="px-6 py-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                        {section.category}
                      </td>
                    </tr>
                    {section.rows.map((row) => (
                      <tr key={row.feature} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-gray-700">{row.feature}</td>
                        <td className="px-6 py-4 text-center">
                          <Cell value={row.starter} />
                        </td>
                        <td className="px-6 py-4 text-center bg-primary-50">
                          <Cell value={row.professional} />
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Cell value={row.enterprise} />
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <HelpCircle className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Still have questions? <Link href="/contact" className="text-primary-600 hover:underline">Contact us</Link>.</p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="border border-gray-200 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 pr-4">{faq.q}</span>
                  <span className={`text-primary-600 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-45' : ''}`}>
                    +
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                    {faq.a}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Start Your Free Trial Today</h2>
            <p className="text-xl opacity-90 mb-10">
              14 days free. All Professional features. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="px-8 py-4 bg-white text-primary-700 rounded-lg hover:bg-gray-50 transition-all font-semibold text-lg shadow-xl hover:scale-105 inline-flex items-center gap-2 justify-center"
              >
                Get Started Free
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
