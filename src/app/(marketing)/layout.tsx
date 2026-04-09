import { Metadata } from 'next'
import { Navbar } from '@/components/marketing/Navbar'
import { Footer } from '@/components/marketing/Footer'

export const metadata: Metadata = {
  title: 'LeadsMind | All-in-One CRM + LMS Platform',
  description: 'The ultimate platform for managing leads, closing deals, and training your team. Scale your business with LeadsMind.',
  openGraph: {
    title: 'LeadsMind | All-in-One CRM + LMS',
    description: 'Manage leads, close deals, and train your team in one place.',
    type: 'website',
    url: 'https://leadsmind.com',
    siteName: 'LeadsMind',
  },
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
