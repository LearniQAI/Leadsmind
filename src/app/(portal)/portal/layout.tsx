import { requireAuth, getCurrentProfile, getCurrentWorkspace, getUserRole } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  BookOpen, 
  Receipt, 
  LogOut,
  User
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { fetchBranding } from '@/lib/branding';
import { BrandingProvider } from '@/components/branding/BrandingProvider';

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();
  const role = await getUserRole();

  if (role !== 'client' && role !== 'admin') {
    // Only clients and admins can see the portal
    redirect('/dashboard');
  }

  const [profile, workspace] = await Promise.all([
    getCurrentProfile(user),
    getCurrentWorkspace(user),
  ]);

  const branding = workspace ? await fetchBranding(workspace.id) : null;

  const navItems = [
    { name: 'Dashboard', href: '/portal/dashboard', icon: LayoutDashboard },
    { name: 'My Courses', href: '/courses', icon: BookOpen }, // Clients view course list but limited
    { name: 'Invoices', href: '/portal/invoices', icon: Receipt },
  ];

  return (
    <BrandingProvider primaryColor={branding?.primary_color}>
      <div className="flex h-screen bg-[#0b0b10]">
        {/* Client Sidebar */}
        <aside className="w-64 border-r border-white/5 flex flex-col bg-[#0b0b10]">
          <div className="h-20 flex items-center px-6 border-b border-white/5">
            <Link href="/portal/dashboard" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg flex items-center justify-center font-bold text-white text-xs" style={{ backgroundColor: 'var(--primary, #6c47ff)' }}>
                {branding?.logo_url ? <img src={branding.logo_url} className="h-full w-full object-cover rounded-lg" alt="Logo" /> : (workspace?.name?.substring(0, 2).toUpperCase() || 'LM')}
              </div>
              <span className="text-sm font-black text-white uppercase tracking-tighter">
                {branding?.platform_name || workspace?.name || 'LeadsMind'} Portal
              </span>
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <Link 
                key={item.name} 
                href={item.href}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:text-white hover:bg-white/5 transition-all"
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-white/5">
            <div className="flex items-center gap-3 bg-white/3 border border-white/5 p-3 rounded-2xl">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={profile?.avatarUrl || ''} />
                <AvatarFallback className="text-[10px] font-bold" style={{ backgroundColor: 'rgba(var(--primary-rgb), 0.2)', color: 'var(--primary, #6c47ff)' }}>
                  {profile?.firstName?.substring(0, 1) || user.email?.substring(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-white truncate">{profile?.firstName}</span>
                <span className="text-[9px] text-white/30 truncate">{user.email}</span>
              </div>
            </div>
            
            <form action="/api/auth/logout" method="POST" className="mt-2">
              <button className="w-full flex items-center gap-3 px-4 py-2 text-xs font-medium text-white/20 hover:text-red-400 transition-all">
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            </form>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8 bg-[#0b0b10] noise-overlay relative">
          <div className="relative z-10 max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </BrandingProvider>
  );
}
