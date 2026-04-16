import { getSaaSTiers } from '@/app/actions/finance';
import { BillingPlansToggle } from '@/components/billing/BillingPlansToggle';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqs = [
  {
    question: 'Can I change plans later?',
    answer: 'Yes, you can upgrade or downgrade your plan at any time from your dashboard settings.',
  },
  {
    question: 'How do I upgrade to the Pro or Enterprise plan?',
    answer: 'Simply sign up for a free Starter account, and navigate to the Billing section in your dashboard to instantly upgrade and unlock advanced features.',
  },
  {
    question: 'How does the billing work?',
    answer: 'We accept all major credit cards. Subscriptions are billed monthly or annually in advance via Stripe.',
  },
  {
    question: 'Can I cancel my subscription?',
    answer: "You can cancel your subscription at any time. You'll continue to have access until the end of your billing period.",
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. We use industry-standard encryption and security protocols to keep your data safe.',
  },
];

export default async function PricingPage() {
  const tiers = await getSaaSTiers();

  return (
    <div className="container mx-auto px-4 py-20 md:px-6">
      {/* Header */}
      <div className="mb-16 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-white">
          Simple Pricing for <span className="text-[#6c47ff]">Every Team</span>
        </h1>
        <p className="mt-6 text-lg text-white/50 max-w-2xl mx-auto">
          Choose the plan that fits your stage. From solo entrepreneurs to global agencies, 
          LeadsMind scales with your growth.
        </p>
      </div>

      {/* Shared Billing UI Component - Marketing Mode */}
      <div className="max-w-7xl mx-auto">
        <BillingPlansToggle mode="marketing" tiers={tiers} />
      </div>

      {/* FAQ Section */}
      <div className="mt-40 max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-white mb-4">Frequently Asked Questions</h2>
          <p className="text-white/40">Everything you need to know about the platform and billing.</p>
        </div>
        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-white/5 bg-white/3 rounded-2xl px-6">
              <AccordionTrigger className="text-left font-bold text-white hover:text-[#6c47ff] hover:no-underline py-6">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-white/50 pb-6">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
