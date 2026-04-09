import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | LeadsMind',
  description: 'Read the terms and conditions for using the LeadsMind platform.',
}

export default function TermsOfServicePage() {
  const lastUpdated = 'April 2026'

  return (
    <div className="container mx-auto max-w-4xl px-4 py-20 md:px-6">
      <div className="mb-12 rounded-lg bg-muted p-4 text-sm font-medium italic text-muted-foreground">
        Note: These terms are a draft and should be reviewed by a legal professional before launch.
      </div>

      <h1 className="mb-2 text-4xl font-bold tracking-tight">Terms of Service</h1>
      <p className="mb-10 text-muted-foreground">Last updated: {lastUpdated}</p>

      <div className="prose prose-slate max-w-none dark:prose-invert">
        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">1. Acceptable Use</h2>
          <p className="mb-4">
            By using LeadsMind, you agree to use the platform only for lawful purposes. You shall not:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Use the service for any illegal or unauthorized purpose</li>
            <li>Attempt to hack, destabilize, or adapt the service&apos;s infrastructure</li>
            <li>Use the service to transmit spam, viruses, or any destructive code</li>
            <li>Infringe upon the intellectual property rights of others</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">2. Account Responsibility</h2>
          <p className="mb-4">
            You are responsible for maintaining the security of your account and password. LeadsMind cannot and will not be liable for any loss or damage from your failure to comply with this security obligation.
            You are also responsible for all content posted and activity that occurs under your account.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">3. Payment Terms</h2>
          <p className="mb-4">
            Access to certain features may require payment. For paid plans:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>A valid credit card or payment method is required for paying accounts</li>
            <li>The service is billed in advance on a monthly or annual basis</li>
            <li>All fees are exclusive of all taxes, levies, or duties imposed by taxing authorities</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">4. Cancellation and Termination</h2>
          <p className="mb-4">
            You are solely responsible for properly canceling your account. You can cancel your account at any time through the workspace settings.
            All of your content will be immediately inaccessible from the service upon cancellation. After 30 days, this content will be permanently deleted from our backups.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">5. Limitation of Liability</h2>
          <p className="mb-4">
            LeadsMind shall not be liable for any direct, indirect, incidental, special, consequential or exemplary damages, including but not limited to, damages for loss of profits, goodwill, use, data or other intangible losses resulting from the use or the inability to use the service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">6. Governing Law</h2>
          <p className="mb-4">
            These terms shall be governed by and defined at the sole discretion of LeadsMind, without regard to its conflict of law provisions.
          </p>
        </section>
      </div>
    </div>
  )
}
