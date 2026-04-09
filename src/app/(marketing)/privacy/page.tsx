import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | LeadsMind',
  description: 'Learn how LeadsMind collects, uses, and protects your data.',
}

export default function PrivacyPolicyPage() {
  const lastUpdated = 'April 2026'

  return (
    <div className="container mx-auto max-w-4xl px-4 py-20 md:px-6">
      <div className="mb-12 rounded-lg bg-muted p-4 text-sm font-medium italic text-muted-foreground">
        Note: This policy is a draft and should be reviewed by a legal professional before launch.
      </div>

      <h1 className="mb-2 text-4xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mb-10 text-muted-foreground">Last updated: {lastUpdated}</p>

      <div className="prose prose-slate max-w-none dark:prose-invert">
        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">1. Data Collected</h2>
          <p className="mb-4">
            We collect information you provide directly to us when you create an account, update your profile, or use our services.
            This may include:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Name and contact information (email address)</li>
            <li>Login credentials (secured via Supabase Auth)</li>
            <li>Profile information and workspace data</li>
            <li>Communications with our support team</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">2. How It Is Used</h2>
          <p className="mb-4">
            We use the collected data to provide, maintain, and improve our services, including:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Creating and managing your account and workspaces</li>
            <li>Sending administrative messages and technical notices</li>
            <li>Responding to your comments and questions</li>
            <li>Facilitating team collaboration and role-based access</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">3. Third-Party Services</h2>
          <p className="mb-4">
            We use reliable third-party providers to help us deliver our services:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Supabase:</strong> For database hosting, authentication, and file storage.</li>
            <li><strong>Resend:</strong> For transactional email delivery (invitations, password resets).</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">4. Cookies</h2>
          <p className="mb-4">
            We use cookies and similar technologies to track activity on our service and hold certain information. 
            These are essential for maintaining your session and security.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">5. User Rights</h2>
          <p className="mb-4">
            As a user, you have certain rights regarding your data:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>The right to access the data we hold about you</li>
            <li>The right to rectify inaccurate information</li>
            <li>The right to request deletion of your account and associated data</li>
            <li>The right to object to or restrict processing of your data</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">6. Contact for Data Requests</h2>
          <p className="mb-4">
            If you have questions about this Privacy Policy or wish to make a data request, please contact us at:
          </p>
          <p className="font-medium">privacy@leadsmind.com</p>
        </section>
      </div>
    </div>
  )
}
