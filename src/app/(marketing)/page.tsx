'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Play, Check, Star } from 'lucide-react'
import { BackgroundEffects } from '@/components/marketing/BackgroundEffects'

const brands = [
  'Acme Corp', 'TechGrow', 'Innovate', 'Nexus HQ', 'Vantage', 
  'Pivotal', 'Launchpad', 'Orbit SaaS', 'Synapse', 'Meridian'
]

const features = [
  {
    icon: '⚡',
    title: 'Lightning Fast Pipeline',
    description: 'Experience unmatched speed across your entire sales workflow. Our optimized CRM engine handles thousands of records without breaking a sweat.',
    tag: 'Core Feature',
    highlight: true,
  },
  {
    icon: '🛡️',
    title: 'Secure by Design',
    description: 'Enterprise-grade security protocols protect your data at every layer, so you never have to think twice.',
  },
  {
    icon: '📊',
    title: 'Advanced Analytics',
    description: 'Deep insights and beautiful dashboards that turn your pipeline data into actionable intelligence.',
  },
  {
    icon: '🤝',
    title: 'Team Collaboration',
    description: 'Shared pipelines, real-time updates, and goal tracking that keep your whole team aligned.',
  },
  {
    icon: '🎓',
    title: 'Integrated LMS',
    description: 'Train your team or onboard customers with a built-in learning management system — no third-party tool needed.',
  },
  {
    icon: '⚙️',
    title: 'Task Automation',
    description: 'Let repetitive workflows run themselves. Focus on relationships, not busywork.',
  },
]

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'CEO at TechGrow',
    avatar: 'SJ',
    color: 'from-[#6c47ff] to-[#8b5cf6]',
    quote: '"LeadsMind transformed our entire sales process. We closed 40% more deals in our first quarter using it. Highly recommended for any growth-focused team."',
  },
  {
    name: 'Michael Chen',
    role: 'Sales Director at Innovate',
    avatar: 'MC',
    color: 'from-[#fdab3d] to-[#f97316]',
    quote: '"The LMS integration is a game-changer for our onboarding. New reps are productive in half the time compared to our old system."',
  },
  {
    name: 'Emma Williams',
    role: 'Freelancer',
    avatar: 'EW',
    color: 'from-[#4ade80] to-[#16a34a]',
    quote: '"Simple, powerful, and genuinely beautiful. Everything I needed as a freelancer who wanted CRM power without enterprise complexity."',
  },
]

export default function LandingPage() {

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.1 })

    const fadeElements = document.querySelectorAll('.fade-up')
    fadeElements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <div className="relative overflow-hidden bg-background font-sans selection:bg-[#6c47ff]/30">
      <BackgroundEffects />

      {/* HERO SECTION */}
      <section className="relative z-10 pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto mb-8 flex w-fit items-center gap-2 rounded-full border border-[#6c47ff]/30 bg-[#6c47ff]/10 px-4 py-1 text-[0.7rem] font-bold uppercase tracking-wider text-[#a78bfa] animate-fade-up">
            <span className="h-1.5 w-1.5 rounded-full bg-[#a78bfa] animate-pulse" />
            Now in Public Beta · No credit card needed
          </div>
          
          <h1 className="mx-auto mb-6 max-w-4xl animate-fade-up text-5xl font-extrabold leading-[1.05] tracking-tight md:text-7xl lg:text-8xl [animation-delay:100ms]">
            Close More Deals.<br />
            <span className="bg-linear-to-r from-[#6c47ff] to-[#fdab3d] bg-clip-text text-transparent italic">Grow Faster.</span>
          </h1>
          
          <p className="mx-auto mb-10 max-w-2xl animate-fade-up text-lg font-light leading-relaxed text-foreground/50 md:text-xl [animation-delay:200ms]">
            The all-in-one CRM platform built for founders and high-performance teams. 
            Manage leads, automate tasks, and train your team — all in one place.
          </p>
          
          <div className="flex animate-fade-up flex-wrap justify-center gap-4 [animation-delay:300ms]">
            <Button size="lg" className="h-14 rounded-full bg-linear-to-r from-[#6c47ff] to-[#8b5cf6] px-8 text-base font-semibold text-white shadow-[0_4px_30px_rgba(108,71,255,0.5)] transition-all hover:-translate-y-1 hover:shadow-[0_8px_40px_rgba(108,71,255,0.65)]" asChild>
              <Link href="/signup">Start for Free →</Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 rounded-full border-foreground/15 bg-transparent px-8 text-base font-semibold text-foreground/80 transition-all hover:border-foreground/30 hover:bg-foreground/5 hover:text-foreground">
              <Play className="mr-2 h-4 w-4 fill-current" /> Watch Demo
            </Button>
          </div>

          {/* Dashboard Mockup */}
          <div className="relative mt-20 animate-fade-up [animation-delay:400ms]">
            <div className="absolute -bottom-14 left-1/2 h-[200px] w-[80%] -translate-x-1/2 bg-[radial-gradient(ellipse,rgba(108,71,255,0.3)_0%,transparent_70%)] blur-2xl" />
            <div className="mx-auto max-w-[860px] overflow-hidden rounded-[20px] border border-white/10 bg-white/3.5 p-6 shadow-[0_40px_120px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.05)] backdrop-blur-2xl">
              <div className="mb-5 flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <div className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                <div className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
              </div>
              
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { label: 'Total Leads', value: '4,821', sub: '↑ 18% this month', color: 'text-[#6c47ff]' },
                  { label: 'Revenue', value: '$128K', sub: '↑ 32% vs last qtr', color: 'text-[#fdab3d]' },
                  { label: 'Deals Won', value: '247', sub: '↑ 9% this week', color: 'text-foreground' },
                ].map((stat, i) => (
                  <div key={i} className="rounded-xl border border-white/5 bg-white/5 p-4 text-left">
                    <div className="mb-2 text-[0.65rem] font-bold uppercase tracking-widest text-foreground/30">{stat.label}</div>
                    <div className={`text-3xl font-extrabold ${stat.color}`}>{stat.value}</div>
                    <div className="mt-1 text-[0.7rem] font-medium text-[#4ade80]">{stat.sub}</div>
                  </div>
                ))}
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
                <div className="rounded-xl border border-white/5 bg-white/5 p-4 text-left lg:col-span-2">
                  <div className="mb-4 text-[0.65rem] font-bold uppercase tracking-widest text-foreground/30">Pipeline Activity</div>
                  <div className="flex h-[70px] items-end gap-1.5">
                    {[45, 70, 55, 85, 60, 90, 75].map((h, i) => (
                      <div 
                        key={i} 
                        className={`flex-1 animate-grow-bar rounded-t-[4px] ${i === 3 ? 'bg-[#6c47ff]' : i === 5 ? 'bg-[#fdab3d]/70' : 'bg-[#6c47ff]/40'}`} 
                        style={{ height: `${h}%`, animationDelay: `${500 + i * 100}ms` }} 
                      />
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/5 p-4 text-left">
                  <div className="mb-4 text-[0.65rem] font-bold uppercase tracking-widest text-foreground/30">Hot Leads</div>
                  <div className="flex flex-col gap-3">
                    {[
                      { name: 'Sarah Johnson', co: 'TechGrow Inc', initials: 'SJ', badge: 'Hot', bColor: 'bg-[#fdab3d]/15 text-[#fdab3d]', aColor: 'bg-gradient-to-br from-[#6c47ff] to-[#8b5cf6]' },
                      { name: 'Michael Chen', co: 'Innovate Co', initials: 'MC', badge: 'New', bColor: 'bg-[#6c47ff]/15 text-[#a78bfa]', aColor: 'bg-gradient-to-br from-[#fdab3d] to-[#f97316]' },
                      { name: 'Emma Williams', co: 'Freelancer', initials: 'EW', badge: 'Warm', bColor: 'bg-green-500/10 text-[#4ade80]', aColor: 'bg-gradient-to-br from-[#4ade80] to-[#16a34a]' },
                    ].map((lead, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[0.6rem] font-bold text-white ${lead.aColor}`}>{lead.initials}</div>
                        <div className="flex-1 overflow-hidden">
                          <div className="truncate text-[0.7rem] font-semibold text-foreground">{lead.name}</div>
                          <div className="truncate text-[0.6rem] text-foreground/35">{lead.co}</div>
                        </div>
                        <div className={`rounded-full px-2 py-0.5 text-[0.55rem] font-bold uppercase ${lead.bColor}`}>{lead.badge}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="relative z-10 border-y border-white/5 py-12">
        <p className="mb-8 text-center text-[0.7rem] font-bold uppercase tracking-[0.2em] text-foreground/25">Trusted by 2,000+ teams worldwide</p>
        <div className="overflow-hidden">
          <div className="flex w-max animate-marquee gap-16 pr-16">
            <div className="flex gap-16">
              {brands.map((brand, i) => (
                <span key={i} className="whitespace-nowrap text-base font-bold tracking-tight text-foreground/20 transition-colors hover:text-foreground/40">{brand}</span>
              ))}
            </div>
            <div className="flex gap-16" aria-hidden="true">
              {brands.map((brand, i) => (
                <span key={i} className="whitespace-nowrap text-base font-bold tracking-tight text-foreground/20 transition-colors hover:text-foreground/40">{brand}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FEATURES SECTION */}
      <section id="features" className="relative z-10 py-24 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <span className="mb-4 inline-block text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[#fdab3d] fade-up opacity-0 in-[.visible]:opacity-100 transition-opacity">Features</span>
            <h2 className="mb-4 text-4xl font-extrabold tracking-tight text-foreground md:text-5xl fade-up opacity-0 in-[.visible]:opacity-100 transition-all duration-700 translate-y-4 in-[.visible]:translate-y-0">
              Everything you need<br className="hidden md:block" /> to win more deals
            </h2>
            <p className="mx-auto max-w-[480px] text-base font-light leading-relaxed text-foreground/40 fade-up opacity-0 in-[.visible]:opacity-100 transition-all duration-700 delay-100 translate-y-4 in-[.visible]:translate-y-0">
              Powerful, intuitive tools designed to eliminate friction and help your team move fast.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <div 
                key={i} 
                className={`group relative overflow-hidden rounded-[20px] border border-white/5 bg-white/3 p-8 transition-all duration-300 hover:-translate-y-1 hover:border-[#6c47ff]/30 hover:bg-white/5 fade-up opacity-0 in-[.visible]:opacity-100 translate-y-8 in-[.visible]:translate-y-0 ${f.highlight ? 'md:col-span-2 bg-linear-to-br from-[#6c47ff]/15 to-[#8b5cf6]/5 border-[#6c47ff]/30' : ''}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(108,71,255,0.08)_0%,transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className={`mb-6 flex h-11 w-11 items-center justify-center rounded-xl text-xl ${f.highlight ? 'bg-[#fdab3d]/15' : 'bg-[#6c47ff]/15'}`}>
                  {f.icon}
                </div>
                <h3 className="mb-3 text-xl font-bold tracking-tight text-foreground">{f.title}</h3>
                <p className="text-sm font-light leading-relaxed text-foreground/45">{f.description}</p>
                {f.tag && (
                  <div className="mt-5 w-fit rounded-full bg-[#fdab3d]/10 px-3 py-1 text-[0.6rem] font-bold uppercase tracking-widest text-[#fdab3d]">
                    {f.tag}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative z-10 py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-16">
            <span className="mb-4 inline-block text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[#fdab3d] fade-up">How it works</span>
            <h2 className="mb-4 text-4xl font-extrabold tracking-tight text-foreground md:text-5xl fade-up">
              Up and running<br className="hidden md:block" /> in minutes
            </h2>
            <p className="mx-auto max-w-[480px] text-base font-light text-white/40 fade-up">
              No lengthy onboarding. No bloated setup. Just results.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            {[
              { id: '01', title: 'Import Your Leads', desc: 'Bring in your existing contacts from any source — CSV, integrations, or our smart scraper — in seconds.' },
              { id: '02', title: 'Build Your Pipeline', desc: 'Customise your stages, assign tasks, and set automation rules that work the way your team does.', connect: true },
              { id: '03', title: 'Close & Scale', desc: 'Track performance in real time, iterate fast, and watch your revenue compound as your team scales.' },
            ].map((s, i) => (
              <div key={i} className="group relative px-4 fade-up" style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="mb-6 text-7xl font-extrabold tracking-tighter text-[#6c47ff]/10 group-hover:text-[#6c47ff]/20 transition-colors">{s.id}</div>
                <h3 className="mb-3 text-xl font-bold tracking-tight text-foreground">{s.title}</h3>
                <p className="text-sm font-light leading-relaxed text-foreground/40">{s.desc}</p>
                {s.connect && <div className="absolute top-10 -right-6 hidden h-px w-24 bg-linear-to-r from-[#6c47ff]/50 to-transparent lg:block" />}
                {i === 0 && <div className="absolute top-10 -right-6 hidden h-px w-24 bg-linear-to-r from-[#6c47ff]/50 to-transparent lg:block" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="relative z-10 py-24 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <span className="mb-4 inline-block text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[#fdab3d] fade-up">Reviews</span>
            <h2 className="text-4xl font-extrabold tracking-tight text-foreground md:text-5xl fade-up">Loved by founders<br /> and teams</h2>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {testimonials.map((t, i) => (
              <div key={i} className="group rounded-[20px] border border-white/5 bg-white/3 p-8 transition-all duration-300 hover:border-[#fdab3d]/25 hover:-translate-y-1 fade-up" style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="mb-6 flex gap-1">
                  {[...Array(5)].map((_, j) => <Star key={j} className="h-3.5 w-3.5 fill-[#fdab3d] text-[#fdab3d]" />)}
                </div>
                <p className="mb-8 text-[0.95rem] font-light italic leading-relaxed text-foreground/70">{t.quote}</p>
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br ${t.color} text-sm font-bold text-white shadow-lg`}>
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-bold tracking-tight text-foreground">{t.name}</div>
                    <div className="text-[0.7rem] font-medium text-foreground/35">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="relative z-10 py-24 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <span className="mb-4 inline-block text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[#fdab3d] fade-up">Pricing</span>
            <h2 className="mb-4 text-4xl font-extrabold tracking-tight text-foreground md:text-5xl fade-up">Simple, honest pricing</h2>
            <p className="mx-auto max-w-[480px] text-base font-light text-foreground/40 fade-up">Start free. Scale when you&apos;re ready. No surprise bills.</p>
          </div>

          <div className="mx-auto grid max-w-[900px] grid-cols-1 gap-5 lg:grid-cols-3">
            {[
              { tier: 'Starter', price: '$0', desc: 'Perfect for solo founders and early-stage teams testing the waters.', features: ['Up to 250 contacts', '1 pipeline', 'Basic analytics', 'Email support'] },
              { tier: 'Growth', price: '$49', desc: 'For teams that are serious about building a scalable sales machine.', features: ['Unlimited contacts', 'Unlimited pipelines', 'Advanced analytics', 'Task automation', 'Integrated LMS', 'Priority support'], featured: true },
              { tier: 'Enterprise', price: 'Custom', desc: 'Bespoke solutions for large teams with complex needs and SLAs.', features: ['Everything in Growth', 'SSO & SAML', 'Custom integrations', 'Dedicated CSM', 'SLA guarantee'] },
            ].map((p, i) => (
              <div 
                key={i} 
                className={`relative rounded-[24px] border p-8 transition-all duration-300 fade-up ${p.featured ? 'border-[#6c47ff]/40 bg-linear-to-b from-[#6c47ff]/10 to-[#8b5cf6]/5 shadow-[0_20px_40px_rgba(108,71,255,0.1)]' : 'border-white/5 bg-white/3'}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                {p.featured && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-linear-to-r from-[#6c47ff] to-[#8b5cf6] px-3.5 py-1 text-[0.65rem] font-bold uppercase tracking-widest text-white whitespace-nowrap">
                    Most Popular
                  </div>
                )}
                <div className={`mb-2 text-[0.7rem] font-bold uppercase tracking-widest ${p.featured ? 'text-[#a78bfa]' : 'text-foreground/40'}`}>{p.tier}</div>
                <div className="mb-2 text-4xl font-extrabold tracking-tight text-foreground">
                  {p.price}<span className="text-sm font-normal text-foreground/35"> {p.price !== 'Custom' ? '/mo' : ''}</span>
                </div>
                <p className="mb-6 text-[0.8rem] font-light leading-relaxed text-foreground/40">{p.desc}</p>
                <div className="mb-6 h-px w-full bg-white/5" />
                <ul className="mb-8 flex flex-col gap-3">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2.5 text-[0.82rem] font-light text-foreground/60">
                      <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${p.featured ? 'bg-[#6c47ff]/30 text-[#a78bfa]' : 'bg-[#6c47ff]/10 text-[#a78bfa]'}`}>
                        <Check className="h-2.5 w-2.5" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
                <Button className={`w-full rounded-full py-6 font-bold transition-all hover:-translate-y-0.5 ${p.featured ? 'bg-linear-to-r from-[#6c47ff] to-[#8b5cf6] text-white shadow-lg shadow-[#6c47ff]/20' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}>
                  {p.price === '$0' ? 'Get Started Free' : p.price === 'Custom' ? 'Contact Sales' : 'Start 14-Day Trial'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="relative z-10 py-24">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-[28px] border border-[#6c47ff]/30 bg-linear-to-br from-[#6c47ff]/20 via-[#8b5cf6]/10 to-[#fdab3d]/5 px-8 pt-20 pb-16 text-center md:pt-24 md:pb-20 fade-up">
            <div className="absolute top-0 left-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle,rgba(108,71,255,0.25)_0%,transparent_70%)] blur-[60px]" />
            <h2 className="relative mb-4 text-4xl font-extrabold tracking-tight text-white md:text-6xl">Ready to scale<br /> your sales?</h2>
            <p className="relative mx-auto mb-10 max-w-[420px] text-lg font-light text-white/50">Join 2,000+ teams already using LeadsMind to close more deals and grow faster.</p>
            <div className="relative flex flex-wrap justify-center gap-4">
              <Button size="lg" className="h-14 rounded-full bg-white px-8 text-base font-bold text-[#6c47ff] transition-all hover:-translate-y-1 hover:shadow-xl" asChild>
                <Link href="/signup">Start for Free →</Link>
              </Button>
              <Button size="lg" variant="outline" className="h-14 rounded-full border-white/20 bg-transparent px-8 text-base font-bold text-white transition-all hover:bg-white/5 hover:border-white/40">
                Book a Demo
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
