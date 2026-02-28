'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight, CheckCircle, Play, X, Calendar, LayoutDashboard,
  GitPullRequest, FolderOpen, Rocket, Bell, Search, ChevronRight,
} from 'lucide-react'

function DemoModal({ onClose }: { onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 16 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/30">
              <Play className="w-8 h-8 text-white ml-1" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">See APEX in Action</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Get a personalised walkthrough with one of our product specialists — tailored to your team&apos;s workflow.
            </p>
          </div>

          <div className="space-y-3 mb-6">
            {[
              '30-minute live demo of the full platform',
              'Walk through your specific use cases',
              'Q&A with a change management expert',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">{item}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href="/contact?type=sales"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
              onClick={onClose}
            >
              <Calendar className="w-4 h-4" />
              Schedule a Demo
            </Link>
            <Link
              href="/signup"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm"
              onClick={onClose}
            >
              Or start your free trial instead
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function DashboardMockup() {
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', active: true },
    { icon: GitPullRequest, label: 'Change Requests' },
    { icon: FolderOpen, label: 'Projects' },
    { icon: Rocket, label: 'Deployments' },
  ]

  const stats = [
    { label: 'Open CRs', value: '24', delta: '+3 today', color: 'from-blue-500 to-cyan-500' },
    { label: 'Pending Approval', value: '8', delta: '2 urgent', color: 'from-amber-500 to-orange-500' },
    { label: 'Approved Today', value: '12', delta: '↑ 40%', color: 'from-emerald-500 to-green-500' },
  ]

  const requests = [
    { id: 'CR-042', title: 'Network infrastructure upgrade', status: 'Approved', statusColor: 'bg-emerald-100 text-emerald-700', initials: 'SC' },
    { id: 'CR-043', title: 'Database schema migration v2.4', status: 'Under Review', statusColor: 'bg-blue-100 text-blue-700', initials: 'RJ' },
    { id: 'CR-044', title: 'SSL certificate renewal — prod', status: 'Submitted', statusColor: 'bg-amber-100 text-amber-700', initials: 'AL' },
    { id: 'CR-045', title: 'Load balancer config update', status: 'Draft', statusColor: 'bg-gray-100 text-gray-600', initials: 'MK' },
  ]

  return (
    <div className="bg-white overflow-hidden" style={{ fontSize: '10px' }}>
      <div className="flex h-56">
        {/* Sidebar */}
        <div className="w-24 bg-gray-900 flex flex-col py-3 px-2 gap-1 flex-shrink-0">
          <div className="flex items-center gap-1.5 px-1 mb-3">
            <div className="w-5 h-5 bg-gradient-to-br from-primary-400 to-blue-500 rounded-md flex-shrink-0" />
            <span className="text-white font-bold text-xs">APEX</span>
          </div>
          {navItems.map(({ icon: Icon, label, active }) => (
            <div
              key={label}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg ${
                active ? 'bg-primary-600 text-white' : 'text-gray-400'
              }`}
            >
              <Icon className="w-3 h-3 flex-shrink-0" />
              <span className="leading-tight" style={{ fontSize: '8px' }}>{label}</span>
            </div>
          ))}
          <div className="mt-auto flex items-center gap-1.5 px-1">
            <div
              className="w-5 h-5 rounded-full bg-gradient-to-br from-primary-400 to-blue-500 flex items-center justify-center text-white flex-shrink-0"
              style={{ fontSize: '7px', fontWeight: 700 }}
            >P</div>
            <span className="text-gray-400" style={{ fontSize: '7px' }}>Admin</span>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0 bg-gray-50">
          {/* Topbar */}
          <div className="bg-white border-b border-gray-100 px-3 py-2 flex items-center gap-2">
            <span className="flex-1 font-semibold text-gray-800" style={{ fontSize: '11px' }}>Dashboard</span>
            <div className="flex items-center gap-1.5 bg-gray-100 rounded-lg px-2 py-1">
              <Search className="w-2.5 h-2.5 text-gray-400" />
              <span className="text-gray-400" style={{ fontSize: '8px' }}>Search…</span>
            </div>
            <div className="relative">
              <Bell className="w-3.5 h-3.5 text-gray-500" />
              <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </div>
            <div
              className="w-5 h-5 rounded-full bg-gradient-to-br from-primary-400 to-blue-500 flex items-center justify-center text-white"
              style={{ fontSize: '7px', fontWeight: 700 }}
            >P</div>
          </div>

          {/* Body */}
          <div className="flex-1 p-3 overflow-hidden">
            {/* Stat cards */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {stats.map((s) => (
                <div key={s.label} className="bg-white rounded-lg p-2 shadow-sm border border-gray-100">
                  <div className="text-gray-500 mb-0.5" style={{ fontSize: '8px' }}>{s.label}</div>
                  <div className="font-bold text-gray-900" style={{ fontSize: '14px' }}>{s.value}</div>
                  <div
                    className={`inline-block px-1 py-0.5 rounded text-white bg-gradient-to-r ${s.color}`}
                    style={{ fontSize: '7px' }}
                  >{s.delta}</div>
                </div>
              ))}
            </div>

            {/* Change requests mini-table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-3 py-1.5 border-b border-gray-100 flex items-center justify-between">
                <span className="font-semibold text-gray-700" style={{ fontSize: '9px' }}>Recent Change Requests</span>
                <span className="text-primary-600 flex items-center gap-0.5" style={{ fontSize: '8px' }}>
                  View all <ChevronRight className="w-2.5 h-2.5" />
                </span>
              </div>
              {requests.map((r) => (
                <div key={r.id} className="flex items-center gap-2 px-3 py-1.5 border-b border-gray-50 last:border-0">
                  <div
                    className="w-5 h-5 rounded-full bg-gradient-to-br from-primary-400 to-blue-500 flex items-center justify-center text-white flex-shrink-0"
                    style={{ fontSize: '6px', fontWeight: 700 }}
                  >{r.initials}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-gray-800 truncate" style={{ fontSize: '8px', fontWeight: 600 }}>{r.title}</div>
                    <div className="text-gray-400" style={{ fontSize: '7px' }}>{r.id}</div>
                  </div>
                  <div
                    className={`px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${r.statusColor}`}
                    style={{ fontSize: '7px' }}
                  >{r.status}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Hero() {
  const [showDemo, setShowDemo] = useState(false)

  return (
    <>
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-blue-50 -z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(25,118,210,0.1),transparent_50%)] -z-10" />

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 rounded-full text-primary-700 font-medium text-sm mb-6"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                </span>
                Trusted by 500+ IT teams worldwide
              </motion.div>

              {/* Headline */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                Enterprise Change
                <br />
                <span className="bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
                  Management
                </span>
                <br />
                Made Simple
              </h1>

              {/* Subheadline */}
              <p className="text-xl text-gray-600 mb-8 max-w-2xl">
                Streamline approvals, reduce downtime, and track every change with APEX.
                The modern change management platform built for enterprise IT teams.
              </p>

              {/* Benefits */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8 text-left">
                {[
                  'No credit card required',
                  '14-day free trial',
                  'Setup in minutes',
                ].map((benefit, i) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5 text-success-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </motion.div>
                ))}
              </div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link
                  href="/signup"
                  className="group px-8 py-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all font-semibold text-lg shadow-xl shadow-primary-500/30 hover:shadow-2xl hover:shadow-primary-500/40 hover:scale-105 flex items-center justify-center gap-2"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button
                  onClick={() => setShowDemo(true)}
                  className="group px-8 py-4 bg-white text-gray-900 rounded-lg hover:bg-gray-50 transition-all font-semibold text-lg border-2 border-gray-200 flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Watch Demo
                </button>
              </motion.div>

              {/* Trust Indicators */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-sm text-gray-500 mt-6"
              >
                Join thousands of IT professionals managing changes with confidence
              </motion.p>
            </motion.div>

            {/* Right Column - Dashboard Mockup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="relative"
            >
              {/* Browser chrome wrapper */}
              <div className="relative rounded-2xl shadow-2xl overflow-hidden border-8 border-white ring-1 ring-gray-200">
                {/* Browser bar */}
                <div className="bg-gray-100 px-4 py-2.5 flex items-center gap-3 border-b border-gray-200">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 bg-white rounded-md px-3 py-1 text-gray-400 text-xs flex items-center gap-2 max-w-xs mx-auto">
                    <div className="w-3 h-3 rounded-full border border-gray-300 flex-shrink-0" />
                    app.apex.io/dashboard
                  </div>
                </div>
                <DashboardMockup />
              </div>

              {/* Floating Elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-primary-500 to-blue-600 rounded-2xl shadow-xl flex items-center justify-center text-white font-bold text-2xl"
              >
                95%
              </motion.div>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 4, delay: 0.5 }}
                className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-success-500 to-green-600 rounded-2xl shadow-xl flex items-center justify-center text-white"
              >
                <div className="text-center">
                  <div className="text-3xl font-bold">50%</div>
                  <div className="text-xs">Faster</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {showDemo && <DemoModal onClose={() => setShowDemo(false)} />}
    </>
  )
}