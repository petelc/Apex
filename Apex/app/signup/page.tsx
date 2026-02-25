'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Check, Eye, EyeOff, ArrowRight, Shield, Zap, Users } from 'lucide-react'

const benefits = [
  { icon: Zap, text: 'Up and running in under 5 minutes' },
  { icon: Shield, text: 'No credit card required' },
  { icon: Users, text: 'Invite your team instantly' },
  { icon: Check, text: '14-day free trial of all Pro features' },
]

export default function SignupPage() {
  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    company: '',
    teamSize: '',
    role: '',
    plan: 'professional',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault()
    setStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleStep2 = (e: React.FormEvent) => {
    e.preventDefault()
    setStep(3)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const passwordStrength = (() => {
    const p = form.password
    if (!p) return 0
    let score = 0
    if (p.length >= 8) score++
    if (/[A-Z]/.test(p)) score++
    if (/[0-9]/.test(p)) score++
    if (/[^A-Za-z0-9]/.test(p)) score++
    return score
  })()

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][passwordStrength]
  const strengthColor = ['', 'bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-success-500'][passwordStrength]

  return (
    <div className="pt-16 min-h-screen">
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Left: Benefits */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:sticky lg:top-24 hidden lg:block"
            >
              <div className="mb-8">
                <Link href="/" className="inline-flex items-center gap-2 mb-8">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">A</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">APEX</span>
                </Link>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Start managing change{' '}
                  <span className="bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
                    the right way
                  </span>
                </h1>
                <p className="text-lg text-gray-600">
                  Join 1,500+ IT teams that use APEX to reduce change failures and pass audits with ease.
                </p>
              </div>

              <div className="space-y-4 mb-10">
                {benefits.map((b, i) => {
                  const Icon = b.icon
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      className="flex items-center gap-4"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-primary-600" />
                      </div>
                      <span className="text-gray-700 font-medium">{b.text}</span>
                    </motion.div>
                  )
                })}
              </div>

              {/* Testimonial */}
              <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-2xl p-6 border border-primary-100">
                <p className="text-gray-700 italic mb-4 leading-relaxed">
                  &ldquo;We cut our mean time to approval by 60% in the first month. APEX made us look
                  very competent to our board during our SOC2 audit.&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                    DK
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">David Kim</div>
                    <div className="text-gray-500 text-xs">IT Director, Meridian Health</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right: Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {/* Progress Steps */}
              <div className="flex items-center gap-4 mb-8">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center gap-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                        s < step
                          ? 'bg-success-500 text-white'
                          : s === step
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {s < step ? <Check className="w-4 h-4" /> : s}
                    </div>
                    <span className={`text-sm font-medium hidden sm:block ${s === step ? 'text-gray-900' : 'text-gray-400'}`}>
                      {s === 1 ? 'Account' : s === 2 ? 'Workspace' : 'Choose Plan'}
                    </span>
                    {s < 3 && <div className={`flex-1 h-0.5 w-8 ${s < step ? 'bg-success-500' : 'bg-gray-200'}`} />}
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
                {/* Step 1: Account */}
                {step === 1 && (
                  <form onSubmit={handleStep1} className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h2>
                      <p className="text-gray-500 text-sm">Start your 14-day free trial</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">First name *</label>
                        <input
                          name="firstName"
                          value={form.firstName}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="sarah@company.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                      <div className="relative">
                        <input
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          value={form.password}
                          onChange={handleChange}
                          required
                          minLength={8}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-12"
                          placeholder="At least 8 characters"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {form.password && (
                        <div className="mt-2">
                          <div className="flex gap-1 mb-1">
                            {[1, 2, 3, 4].map((i) => (
                              <div
                                key={i}
                                className={`h-1.5 flex-1 rounded-full transition-colors ${
                                  i <= passwordStrength ? strengthColor : 'bg-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-gray-500">
                            Strength: <span className="font-medium">{strengthLabel}</span>
                          </p>
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full px-8 py-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all font-semibold text-lg shadow-lg shadow-primary-500/30 flex items-center justify-center gap-2"
                    >
                      Continue
                      <ArrowRight className="w-5 h-5" />
                    </button>

                    <p className="text-center text-sm text-gray-500">
                      Already have an account?{' '}
                      <a href="https://app.apex.io/login" className="text-primary-600 hover:underline font-medium">
                        Sign in
                      </a>
                    </p>
                  </form>
                )}

                {/* Step 2: Workspace */}
                {step === 2 && (
                  <form onSubmit={handleStep2} className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">Set up your workspace</h2>
                      <p className="text-gray-500 text-sm">Tell us about your team</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company name *</label>
                      <input
                        name="company"
                        value={form.company}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Acme Corp"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Your role *</label>
                      <select
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                      >
                        <option value="">Select your role...</option>
                        <option value="it_director">IT Director / CIO</option>
                        <option value="it_manager">IT Manager</option>
                        <option value="change_manager">Change Manager</option>
                        <option value="engineer">Engineer / Developer</option>
                        <option value="analyst">IT Analyst</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">IT team size *</label>
                      <select
                        name="teamSize"
                        value={form.teamSize}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                      >
                        <option value="">Select team size...</option>
                        <option value="1-5">1–5</option>
                        <option value="6-20">6–20</option>
                        <option value="21-100">21–100</option>
                        <option value="101-500">101–500</option>
                        <option value="500+">500+</option>
                      </select>
                    </div>

                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all font-semibold shadow-lg shadow-primary-500/30 flex items-center justify-center gap-2"
                      >
                        Continue
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </form>
                )}

                {/* Step 3: Plan */}
                {step === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">Choose your plan</h2>
                      <p className="text-gray-500 text-sm">All plans include a 14-day free trial of Pro features</p>
                    </div>

                    <div className="space-y-4">
                      {[
                        { id: 'starter', name: 'Starter', price: '$49/mo', desc: 'Up to 5 members, 50 changes/month' },
                        { id: 'professional', name: 'Professional', price: '$149/mo', desc: 'Unlimited members & changes', badge: 'Most Popular' },
                        { id: 'enterprise', name: 'Enterprise', price: 'Custom', desc: 'SSO, dedicated support, custom SLA' },
                      ].map((p) => (
                        <label
                          key={p.id}
                          className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            form.plan === p.id
                              ? 'border-primary-600 bg-primary-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="plan"
                            value={p.id}
                            checked={form.plan === p.id}
                            onChange={handleChange}
                            className="w-4 h-4 text-primary-600"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-900">{p.name}</span>
                              {p.badge && (
                                <span className="px-2 py-0.5 bg-primary-600 text-white text-xs font-semibold rounded-full">
                                  {p.badge}
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">{p.desc}</div>
                          </div>
                          <div className="font-bold text-gray-900">{p.price}</div>
                        </label>
                      ))}
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={() => setStep(2)}
                        className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                      >
                        Back
                      </button>
                      <a
                        href="https://app.apex.io/onboarding"
                        className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all font-semibold shadow-lg shadow-primary-500/30 flex items-center justify-center gap-2"
                      >
                        Start Free Trial
                        <ArrowRight className="w-5 h-5" />
                      </a>
                    </div>

                    <p className="text-xs text-gray-400 text-center">
                      By signing up you agree to our{' '}
                      <Link href="/terms" className="text-primary-600 hover:underline">Terms of Service</Link>
                      {' '}and{' '}
                      <Link href="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link>.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
