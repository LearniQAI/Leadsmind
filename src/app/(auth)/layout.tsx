import { BackgroundEffects } from '@/components/marketing/BackgroundEffects'
import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-6">
      <BackgroundEffects />
      
      <div className="relative z-10 mb-8">
        <Link href="/" className="group flex items-center gap-1">
          <span className="text-2xl font-extrabold tracking-tighter text-foreground">
            Leads<span className="text-[#fdab3d]">Mind</span>
          </span>
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-[440px] overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-8 shadow-[0_40px_120px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)] backdrop-blur-3xl md:p-10">
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[#6c47ff]/30 to-transparent" />
        {children}
      </div>

      <div className="relative z-10 mt-8 text-center">
        <p className="text-[0.75rem] font-light text-foreground/25">
          © {new Date().getFullYear()} LeadsMind. Securely encrypted.
        </p>
      </div>
    </div>
  )
}
