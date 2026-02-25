import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service — APEX',
  description: 'APEX Terms of Service — the agreement governing your use of the APEX platform.',
}

const sections = [
  {
    title: '1. Acceptance of Terms',
    content: `By accessing or using the APEX platform ("Service"), you agree to be bound by these Terms of
    Service ("Terms"). If you are using the Service on behalf of an organisation, you represent that you
    have authority to bind that organisation to these Terms, and "you" refers to that organisation.

    If you do not agree to these Terms, do not use the Service.`,
  },
  {
    title: '2. Service Description',
    content: `APEX provides a cloud-based change management platform including change request workflows,
    project management, deployment tracking, audit trails, and related features ("the Service").

    We reserve the right to modify, suspend, or discontinue the Service (or any part thereof) at any
    time with reasonable notice. We will endeavour to provide at least 14 days' notice of material
    changes via email.`,
  },
  {
    title: '3. Accounts',
    content: `You must provide accurate and complete information when creating an account. You are
    responsible for maintaining the security of your account credentials. Notify us immediately at
    security@apex.io if you suspect unauthorised access.

    You may not share account credentials across multiple individuals. Each user must have their own
    account. You are responsible for all activity that occurs under your account.`,
  },
  {
    title: '4. Subscriptions and Payment',
    content: `Subscriptions are billed monthly or annually in advance. Prices are displayed in USD exclusive
    of any applicable taxes. You are responsible for all taxes applicable to your subscription.

    Your subscription renews automatically at the end of each billing period unless you cancel before
    the renewal date. You may cancel at any time from your account settings.

    Refunds: We offer a full refund within 14 days of your initial purchase. After 14 days, refunds are
    issued at our discretion for exceptional circumstances. No refunds are issued for partial billing
    periods.

    We may change pricing with 30 days' notice. If you do not agree to a price change, you may cancel
    before the new price takes effect.`,
  },
  {
    title: '5. Free Trial',
    content: `We may offer a free trial of the Service for a specified period. At the end of the trial period,
    unless you subscribe to a paid plan, your access will be paused. Your data is retained for 30 days
    following the end of the trial, after which it is permanently deleted.

    We reserve the right to modify or discontinue free trials at any time without notice.`,
  },
  {
    title: '6. Acceptable Use',
    content: `You agree not to:

    • Use the Service for any unlawful purpose or in violation of any regulations
    • Attempt to gain unauthorised access to any part of the Service or other accounts
    • Reverse engineer, decompile, or disassemble the Service
    • Introduce malware, viruses, or malicious code
    • Use the Service to transmit unsolicited commercial communications (spam)
    • Resell, sublicense, or otherwise commercialise the Service without our written consent
    • Use the Service in a way that could damage, disable, or impair the Service or its servers
    • Violate the intellectual property rights of APEX or third parties

    We reserve the right to suspend or terminate accounts that violate these terms.`,
  },
  {
    title: '7. Data and Privacy',
    content: `Your use of the Service is governed by our Privacy Policy, which is incorporated by reference.

    You retain all rights to your data ("Customer Data"). By using the Service you grant APEX a
    limited, non-exclusive licence to process Customer Data solely to provide the Service.

    APEX will not access Customer Data except: (a) as you direct; (b) as required to provide support
    you have requested; or (c) as required by law.

    On cancellation or termination, you may export Customer Data for 30 days. After 30 days, Customer
    Data is permanently deleted.`,
  },
  {
    title: '8. Intellectual Property',
    content: `The Service, including all software, design, trademarks, and documentation, is owned by
    APEX Software Ltd and protected by intellectual property laws. These Terms do not grant you any
    rights to APEX's intellectual property other than the limited right to use the Service as described.

    You retain ownership of any content you submit to the Service. By submitting content you grant APEX
    the right to display and process that content to provide the Service.`,
  },
  {
    title: '9. Availability and SLA',
    content: `APEX targets 99.9% monthly uptime for the Service. Scheduled maintenance windows are
    communicated via status.apex.io at least 24 hours in advance.

    Enterprise customers with a signed SLA addendum are entitled to credit per the terms of that
    addendum. Standard plan customers are not entitled to credits for downtime.`,
  },
  {
    title: '10. Limitation of Liability',
    content: `TO THE MAXIMUM EXTENT PERMITTED BY LAW, APEX IS NOT LIABLE FOR ANY INDIRECT, INCIDENTAL,
    SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR LOSS OF DATA, PROFITS, GOODWILL, OR OTHER
    INTANGIBLE LOSSES, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE SERVICE.

    APEX's total liability arising out of or related to these Terms shall not exceed the amounts paid
    by you to APEX in the 12 months preceding the event giving rise to liability.`,
  },
  {
    title: '11. Indemnification',
    content: `You agree to indemnify, defend, and hold harmless APEX and its officers, directors, employees,
    and agents from any claims, liabilities, damages, and expenses (including reasonable legal fees)
    arising out of your use of the Service, your violation of these Terms, or your violation of the
    rights of any third party.`,
  },
  {
    title: '12. Termination',
    content: `Either party may terminate these Terms at any time. You may terminate by cancelling your
    subscription. We may terminate immediately for material breach of these Terms, including non-payment
    or violation of the Acceptable Use policy.

    On termination, your right to access the Service ceases immediately. Provisions that by their
    nature should survive termination (including intellectual property, liability limitations, and
    indemnification) will survive.`,
  },
  {
    title: '13. Governing Law',
    content: `These Terms are governed by the laws of the State of California, USA, without regard to
    conflict of law provisions. Any disputes arising from these Terms shall be resolved exclusively in
    the state or federal courts located in San Francisco County, California.

    If you are located in the European Union or United Kingdom, you may also rely on mandatory consumer
    protection laws in your country of residence.`,
  },
  {
    title: '14. Changes to Terms',
    content: `We may update these Terms from time to time. We will notify you of material changes via email
    and via an in-app notice at least 14 days before the changes take effect. Continued use of the
    Service after the effective date of updated Terms constitutes acceptance.`,
  },
  {
    title: '15. Contact',
    content: `For questions about these Terms:
    Legal: legal@apex.io
    APEX Software Ltd, 550 Howard St, Suite 200, San Francisco, CA 94105, USA`,
  },
]

export default function TermsPage() {
  return (
    <div className="pt-16">
      <section className="py-16 px-4 bg-gradient-to-br from-primary-50 via-white to-blue-50">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4">
            <Link href="/" className="text-primary-600 hover:underline text-sm">← Back to home</Link>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-gray-500 text-sm">Last updated: 1 February 2026 &nbsp;|&nbsp; Effective: 1 February 2026</p>
        </div>
      </section>

      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <p className="text-lg text-gray-600 leading-relaxed mb-12">
            Please read these Terms of Service carefully before using APEX. They form a binding agreement
            between you and APEX Software Ltd. If you have questions, contact{' '}
            <a href="mailto:legal@apex.io" className="text-primary-600 hover:underline">legal@apex.io</a>.
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
              Questions about these Terms?{' '}
              <a href="mailto:legal@apex.io" className="text-primary-600 hover:underline font-medium">
                legal@apex.io
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
