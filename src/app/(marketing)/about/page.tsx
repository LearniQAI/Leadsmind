import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Heart, Target, Lightbulb, ShieldCheck } from 'lucide-react'

const team = [
  { name: 'Nelly Agboola', role: 'Founder & CEO', initials: 'NA' },
  { name: 'John Doe', role: 'CTO', initials: 'JD' },
  { name: 'Jane Smith', role: 'Head of Growth', initials: 'JS' },
]

const values = [
  {
    icon: <Heart className="h-6 w-6 text-primary" />,
    title: 'Customer First',
    description: 'We build with our customers in mind, always prioritizing their success.',
  },
  {
    icon: <Target className="h-6 w-6 text-primary" />,
    title: 'Focused Execution',
    description: 'We believe in doing a few things exceptionally well rather than being average at many.',
  },
  {
    icon: <Lightbulb className="h-6 w-6 text-primary" />,
    title: 'Innovation',
    description: 'Continuously improving our platform to stay ahead of the curve.',
  },
  {
    icon: <ShieldCheck className="h-6 w-6 text-primary" />,
    title: 'Integrity',
    description: 'Honesty and transparency are at the core of everything we do.',
  },
]

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-20 pb-20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 text-center md:px-6 md:pt-32">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">Our Mission</h1>
        <p className="mx-auto mt-6 max-w-3xl text-lg text-muted-foreground md:text-xl">
          At LeadsMind, we are on a mission to simplify business growth. We provide the tools 
          founders and teams need to manage their pipelines, train their staff, and scale 
          with confidence in an increasingly complex digital landscape.
        </p>
      </section>

      {/* Values Section */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="mb-12 text-center text-3xl font-bold">Our Values</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, index) => (
              <Card key={index} className="bg-background">
                <CardHeader>
                  <div className="mb-2">{v.icon}</div>
                  <CardTitle className="text-xl">{v.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{v.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="container mx-auto px-4 md:px-6 text-center">
        <h2 className="mb-12 text-3xl font-bold">The Team Behind LeadsMind</h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((member, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                {member.initials}
              </div>
              <h3 className="mt-4 text-xl font-semibold">{member.name}</h3>
              <p className="text-muted-foreground">{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 md:px-6">
        <div className="bg-primary px-8 py-12 text-center text-primary-foreground rounded-2xl md:py-20">
          <h2 className="text-3xl font-bold sm:text-4xl">Ready to get started?</h2>
          <p className="mt-4 text-primary-foreground/80">
            Join thousands of businesses scaling with LeadsMind today.
          </p>
          <div className="mt-10">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/signup">Sign Up Free</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
