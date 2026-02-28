'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from 'lucide-react'

const contactInfo = [
  {
    icon: Mail,
    label: 'Email',
    value: 'hello@apex.io',
    detail: 'We respond within 24 hours',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Phone,
    label: 'Sales',
    value: '+1 (800) 555-APEX',
    detail: 'Mon–Fri, 9am–6pm ET',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: MapPin,
    label: 'Headquarters',
    value: 'San Francisco, CA',
    detail: '550 Howard St, Suite 200',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Clock,
    label: 'Support Hours',
    value: '24/7 Critical',
    detail: 'Business hours for general enquiries',
    color: 'from-orange-500 to-red-500',
  },
]

const enquiryTypes = [
  { value: 'sales', label: 'Sales enquiry' },
  { value: 'enterprise', label: 'Enterprise / custom pricing' },
  { value: 'support', label: 'Technical support' },
  { value: 'partnership', label: 'Partnership opportunity' },
  { value: 'press', label: 'Press / media' },
  { value: 'other', label: 'Other' },
]

export default function ContactPage() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    teamSize: '',
    type: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('server_error')
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again or email us directly at hello@apex.io')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-blue-50 -z-10" />
        <div className="max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Let&apos;s{' '}
              <span className="bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
                Talk
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Whether you&apos;re evaluating APEX, need help with your account, or want to explore a partnership —
              we&apos;d love to hear from you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => {
              const Icon = info.icon
              return (
                <motion.div
                  key={info.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${info.color} flex items-center justify-center mb-4 shadow-md`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-sm text-gray-500 font-medium mb-1">{info.label}</div>
                  <div className="font-bold text-gray-900 mb-1">{info.value}</div>
                  <div className="text-sm text-gray-500">{info.detail}</div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Form + Sidebar */}
      <section className="py-16 px-4 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Can Help</h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    <strong className="text-gray-900">Sales & Demos</strong><br />
                    See APEX in action with a personalised demo tailored to your team&apos;s workflow.
                  </p>
                  <p>
                    <strong className="text-gray-900">Enterprise Pricing</strong><br />
                    Custom contracts, volume discounts, and dedicated support for large organisations.
                  </p>
                  <p>
                    <strong className="text-gray-900">Technical Support</strong><br />
                    Already a customer? Reach support directly at <a href="mailto:support@apex.io" className="text-primary-600 hover:underline">support@apex.io</a> or via the in-app chat.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-primary-100 shadow-md">
                <div className="text-primary-700 font-semibold mb-2">Typical response times</div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex justify-between"><span>Sales enquiries</span><span className="font-medium">Same business day</span></li>
                  <li className="flex justify-between"><span>Technical support</span><span className="font-medium">8hr SLA (Pro)</span></li>
                  <li className="flex justify-between"><span>General enquiries</span><span className="font-medium">24 hours</span></li>
                  <li className="flex justify-between"><span>Press / media</span><span className="font-medium">48 hours</span></li>
                </ul>
              </div>
            </motion.div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2"
            >
              {submitted ? (
                <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-100 text-center">
                  <CheckCircle className="w-16 h-16 text-success-500 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Message Sent!</h3>
                  <p className="text-gray-600 text-lg mb-8">
                    Thanks for reaching out. We&apos;ll get back to you within one business day.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ firstName: '', lastName: '', email: '', company: '', teamSize: '', type: '', message: '' }) }}
                    className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Send Us a Message</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">First name *</label>
                        <input
                          name="firstName"
                          value={form.firstName}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                          placeholder="Sarah"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last name *</label>
                        <input
                          name="lastName"
                          value={form.lastName}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                          placeholder="Chen"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Work email *</label>
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        placeholder="sarah@company.com"
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                        <input
                          name="company"
                          value={form.company}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                          placeholder="Acme Corp"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Team size</label>
                        <select
                          name="teamSize"
                          value={form.teamSize}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white"
                        >
                          <option value="">Select...</option>
                          <option value="1-10">1–10</option>
                          <option value="11-50">11–50</option>
                          <option value="51-200">51–200</option>
                          <option value="201-500">201–500</option>
                          <option value="500+">500+</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Enquiry type *</label>
                      <select
                        name="type"
                        value={form.type}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white"
                      >
                        <option value="">Select a topic...</option>
                        {enquiryTypes.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                      <textarea
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                        placeholder="Tell us about your team, your current challenges, or what you'd like to discuss..."
                      />
                    </div>

                    {error && (
                      <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full px-8 py-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all font-semibold text-lg shadow-lg shadow-primary-500/30 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                      {loading ? (
                        <>
                          <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Send Message
                        </>
                      )}
                    </button>

                    <p className="text-sm text-gray-500 text-center">
                      By submitting this form you agree to our{' '}
                      <a href="/privacy" className="text-primary-600 hover:underline">Privacy Policy</a>.
                    </p>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
