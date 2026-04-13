'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Check, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const plans = [
  {
    name: 'Starter',
    description: 'Perfect for getting started.',
    monthlyPrice: 0,
    annualPrice: 0,
    features: [
      { name: 'Up to 500 contacts', included: true },
      { name: '1 Pipeline', included: true },
      { name: '5 Tags & custom fields', included: true },
      { name: '2 Team members', included: true },
      { name: 'Automation workflows', included: false },
      { name: 'SaaS Reseller mode', included: false },
    ],
    cta: 'Start for Free',
    href: '/signup',
  },
  {
    name: 'Growth',
    description: 'Best for growing teams.',
    monthlyPrice: 97,
    annualPrice: 77,
    popular: true,
    features: [
      { name: 'Unlimited contacts', included: true },
      { name: 'Unlimited pipelines', included: true },
      { name: 'WhatsApp & Social Inbox', included: true },
      { name: 'Email Campaigns', included: true },
      { name: '5 Team members', included: true },
      { name: 'SaaS Reseller mode', included: false },
    ],
    cta: 'Get Started',
    href: '/signup',
  },
  {
    name: 'Agency',
    description: 'For agencies & resellers.',
    monthlyPrice: 297,
    annualPrice: 237,
    features: [
      { name: 'Everything in Growth', included: true },
      { name: 'Custom domains', included: true },
      { name: 'White-labeling', included: true },
      { name: 'SaaS reseller mode', included: true },
      { name: 'Unlimited sub-accounts', included: true },
      { name: 'Unlimited team members', included: true },
    ],
    cta: 'Contact Sales',
    href: '/contact',
  },
]

const faqs = [
  {
    question: 'Can I change plans later?',
    answer: 'Yes, you can upgrade or downgrade your plan at any time from your dashboard settings.',
  },
  {
    question: 'Do you offer a free trial for the Pro plan?',
    answer: 'We offer a 14-day free trial for the Pro plan so you can experience all the advanced features.',
  },
  {
    question: 'How does the billing work?',
    answer: 'We accept all major credit cards. Subscriptions are billed monthly or annually in advance.',
  },
  {
    question: 'Can I cancel my subscription?',
    answer: "You can cancel your subscription at any time. You&apos;ll continue to have access until the end of your billing period.",
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. We use industry-standard encryption and security protocols to keep your data safe.',
  },
]

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false)

  return (
    <div className="container mx-auto px-4 py-20 md:px-6">
      {/* Header */}
      <div className="mb-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Simple Pricing for Every Team</h1>
        <p className="mt-4 text-lg text-muted-foreground">Choose the plan that fits your needs.</p>

        {/* Toggle */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <span className={`text-sm ${!isAnnual ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
            Monthly
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className="relative h-6 w-11 rounded-full bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <div
              className={`absolute top-1 h-4 w-4 rounded-full bg-primary transition-transform ${
                isAnnual ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <div className="flex items-center gap-2">
            <span className={`text-sm ${isAnnual ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
              Annual
            </span>
            <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
              Save 20%
            </Badge>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid gap-8 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.name} className={`flex flex-col ${plan.popular ? 'border-primary ring-1 ring-primary' : ''}`}>
            <CardHeader>
              {plan.popular && (
                <div className="mb-2">
                  <Badge className="bg-primary text-primary-foreground uppercase tracking-wider">Most Popular</Badge>
                </div>
              )}
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="mb-6">
                <span className="text-4xl font-bold">${isAnnual ? plan.annualPrice : plan.monthlyPrice}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature.name} className="flex items-center gap-3 text-sm">
                    {feature.included ? (
                      <Check className="h-4 w-4 text-primary" />
                    ) : (
                      <X className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className={feature.included ? 'text-foreground' : 'text-muted-foreground'}>
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="pt-6">
              <Button variant={plan.popular ? 'default' : 'outline'} className="w-full" asChild>
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="mt-32 max-w-3xl mx-auto">
        <h2 className="mb-12 text-center text-3xl font-bold tracking-tight">Frequently Asked Questions</h2>
        <Accordion className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left font-medium">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  )
}
