'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Session } from '@supabase/supabase-js'
import { ThemeToggle } from './ThemeToggle'

const navLinks = [
  { name: 'Features', href: '/#features' },
  { name: 'Pricing', href: '/#pricing' },
  { name: 'Reviews', href: '/#testimonials' },
  { name: 'About', href: '/about' },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setSession(user ? { user } as any : null)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [supabase.auth])

  return (
    <nav className={`sticky top-0 z-100 w-full transition-all duration-300 ${
      scrolled 
        ? 'bg-background/70 backdrop-blur-xl border-b border-border py-2' 
        : 'bg-transparent py-4'
    }`}>
      <div className="container mx-auto flex items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-1">
          <span className="text-2xl font-extrabold tracking-tighter text-foreground">
            Leads<span className="text-[#fdab3d]">Mind</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-foreground/60 transition-colors hover:text-foreground"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          {session ? (
            <Button size="sm" className="rounded-full px-5 font-semibold" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="font-medium text-foreground/60 hover:text-foreground" asChild>
                <Link href="/login">Log In</Link>
              </Button>
              <Button size="sm" className="rounded-full bg-[#6c47ff] px-6 font-semibold hover:bg-[#6c47ff]/90 shadow-[0_0_20px_rgba(108,71,255,0.4)]" asChild>
                <Link href="/signup">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Trigger */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger 
              render={
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              } 
            />
            <SheetContent side="right" className="flex flex-col gap-8 pt-12">
              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="text-lg font-medium text-foreground/60 transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
              <div className="flex flex-col gap-4 border-t border-border pt-6">
                {session ? (
                  <Button className="w-full rounded-full" asChild onClick={() => setIsOpen(false)}>
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                ) : (
                  <>
                    <Button variant="ghost" className="w-full justify-start text-foreground/60" asChild onClick={() => setIsOpen(false)}>
                      <Link href="/login">Log In</Link>
                    </Button>
                    <Button className="w-full rounded-full bg-[#6c47ff]" asChild onClick={() => setIsOpen(false)}>
                      <Link href="/signup">Get Started</Link>
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
