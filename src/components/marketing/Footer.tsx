import Link from 'next/link'

const footerLinks = [
  {
    title: 'Product',
    links: [
      { name: 'Features', href: '/#features' },
      { name: 'Pricing', href: '/pricing' },
    ],
  },
  {
    title: 'Company',
    links: [
      { name: 'About', href: '/about' },
      { name: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
    ],
  },
]

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-card text-card-foreground">
      <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Logo & Tagline */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="text-xl font-bold tracking-tight text-primary">
              LeadsMind
            </Link>
            <p className="max-w-xs text-sm text-muted-foreground">
              Empowering businesses with intelligent CRM and LMS solutions to scale effectively.
            </p>
          </div>

          {/* Links Sections */}
          {footerLinks.map((section) => (
            <div key={section.title} className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider">{section.title}</h3>
              <ul className="flex flex-col gap-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-border pt-8 text-center md:mt-16">
          <p className="text-xs text-muted-foreground">
            © {currentYear} LeadsMind. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
