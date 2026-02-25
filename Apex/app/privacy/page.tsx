import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy — APEX',
  description: 'APEX Privacy Policy — how we collect, use, and protect your personal data.',
}

const sections = [
  {
    title: '1. Who We Are',
    content: `APEX Software Ltd ("APEX", "we", "us", "our") operates the APEX change management platform
    accessible at apex.io and associated subdomains. This Privacy Policy explains how we collect, use,
    share, and protect personal data relating to users of our platform and visitors to our website.

    Our registered address is 550 Howard St, Suite 200, San Francisco, CA 94105, USA.
    For privacy enquiries: privacy@apex.io.`,
  },
  {
    title: '2. Data We Collect',
    content: `We collect the following categories of personal data:

    Account data: Name, work email address, company name, job role, and password hash when you register.

    Usage data: Log data including IP address, browser type, pages visited, feature usage, and timestamps.

    Communication data: Content of support tickets, contact form submissions, and emails you send us.

    Payment data: Billing name, address, and the last 4 digits of the payment card. Full card details
    are processed by Stripe and never stored on APEX systems.

    Tenant data: Any data your organisation uploads or creates within the APEX platform (change requests,
    projects, tasks, deployments). This data is processed on your behalf as a data processor.`,
  },
  {
    title: '3. How We Use Your Data',
    content: `We use your personal data to:

    • Provide, maintain, and improve the APEX platform
    • Process payments and manage your subscription
    • Send transactional emails (account confirmations, password resets, notifications)
    • Provide customer support
    • Send product updates and marketing communications (with your consent, unsubscribable at any time)
    • Monitor security, detect fraud, and ensure platform integrity
    • Comply with legal obligations

    Legal bases (GDPR): Contract performance (platform operation), legitimate interests (security,
    product improvement), consent (marketing), and legal obligation (compliance).`,
  },
  {
    title: '4. Data Sharing',
    content: `We do not sell your personal data. We share data only with:

    Sub-processors: Microsoft Azure (hosting and infrastructure), Stripe (payments), SendGrid (email
    delivery), Sentry (error monitoring), and Intercom (customer support). All sub-processors are
    contractually bound to GDPR-compliant data processing terms.

    Legal requirements: We may disclose data if required by law, court order, or to protect the rights,
    property, or safety of APEX, our users, or the public.

    Business transfers: In the event of a merger, acquisition, or asset sale, your data may be
    transferred. We will notify you before this occurs.`,
  },
  {
    title: '5. Data Retention',
    content: `Account data is retained for the duration of your subscription plus 30 days after cancellation,
    during which you may export all your data. After 30 days, account data is permanently deleted.

    Audit logs and usage data are retained for 12 months for security and compliance purposes.

    Anonymised, aggregated analytics data may be retained indefinitely.

    You may request deletion of your personal data at any time by emailing privacy@apex.io. We will
    process requests within 30 days.`,
  },
  {
    title: '6. Multi-Tenant Isolation',
    content: `APEX uses a schema-per-tenant architecture in Microsoft Azure SQL. Your organisation's data
    is stored in a dedicated schema that is cryptographically isolated from all other tenants.
    No tenant can access another tenant's data through any APEX interface or API.`,
  },
  {
    title: '7. International Transfers',
    content: `APEX stores data in Microsoft Azure data centres in the United States (East US) and Europe
    (West Europe). If you are located in the European Economic Area, transfers to the US are governed
    by Standard Contractual Clauses (SCCs) under GDPR Article 46.

    You may request a copy of the applicable transfer mechanism by emailing privacy@apex.io.`,
  },
  {
    title: '8. Your Rights',
    content: `Depending on your jurisdiction, you have the right to:

    • Access the personal data we hold about you
    • Correct inaccurate data
    • Request deletion of your data ("right to be forgotten")
    • Restrict or object to processing
    • Data portability (receive your data in machine-readable format)
    • Withdraw consent at any time (where processing is consent-based)
    • Lodge a complaint with a supervisory authority (e.g., the ICO in the UK, or your local DPA in the EU)

    To exercise any of these rights, contact privacy@apex.io. We will respond within 30 days.`,
  },
  {
    title: '9. Cookies',
    content: `We use strictly necessary cookies (session management and security) and optional analytics
    cookies (if you consent). You can manage cookie preferences via the banner on first visit or by
    clearing your browser's cookies at any time.

    We do not use third-party advertising cookies.`,
  },
  {
    title: '10. Children',
    content: `APEX is an enterprise platform not directed at children under the age of 16. We do not
    knowingly collect personal data from children. If you believe a child has provided us with personal
    data, please contact privacy@apex.io.`,
  },
  {
    title: '11. Changes to This Policy',
    content: `We will notify you of material changes to this Privacy Policy by email and via an in-app
    banner at least 14 days before changes take effect. The "last updated" date at the top of this
    page will always reflect the current version.`,
  },
  {
    title: '12. Contact Us',
    content: `Privacy Officer: privacy@apex.io
    APEX Software Ltd, 550 Howard St, Suite 200, San Francisco, CA 94105, USA

    For EU/UK GDPR enquiries, our EU Representative is:
    APEX EU Representative, Schönhauser Allee 36, 10435 Berlin, Germany`,
  },
]

export default function PrivacyPage() {
  return (
    <div className="pt-16">
      <section className="py-16 px-4 bg-gradient-to-br from-primary-50 via-white to-blue-50">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4">
            <Link href="/" className="text-primary-600 hover:underline text-sm">← Back to home</Link>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-500 text-sm">Last updated: 1 February 2026</p>
        </div>
      </section>

      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <p className="text-lg text-gray-600 leading-relaxed mb-12">
            At APEX we take privacy seriously. This policy explains what personal data we collect, why we
            collect it, and what rights you have. If you have questions after reading this, please email{' '}
            <a href="mailto:privacy@apex.io" className="text-primary-600 hover:underline">privacy@apex.io</a>.
          </p>

          <div className="space-y-10">
            {sections.map((section) => (
              <div key={section.title} className="border-b border-gray-100 pb-10 last:border-0">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{section.title}</h2>
                <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {section.content}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-primary-50 rounded-2xl border border-primary-100">
            <p className="text-gray-700">
              Questions about this policy?{' '}
              <a href="mailto:privacy@apex.io" className="text-primary-600 hover:underline font-medium">
                privacy@apex.io
              </a>{' '}
              or{' '}
              <Link href="/contact" className="text-primary-600 hover:underline font-medium">
                contact us online
              </Link>.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
