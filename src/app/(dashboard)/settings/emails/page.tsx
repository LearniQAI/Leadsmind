import { requireAuth } from '@/lib/auth';
import { getConnectedEmailAccounts, getOAuthUrl } from '@/app/actions/emails/sync';
import { Button } from '@/components/ui/button';
import { 
  Mail, 
  RefreshCw, 
  Settings2, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  Trash2,
  Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function EmailSyncSettingsPage() {
  await requireAuth();
  const accountsResult = await getConnectedEmailAccounts();
  const accounts = accountsResult.success ? accountsResult.data || [] : [];

  const providers = [
    {
      id: 'gmail',
      name: 'Gmail / Google Workspace',
      description: 'Connect your business Gmail account for two-way sync.',
      icon: '/icons/google.svg',
      color: 'bg-[#EA4335]/10 text-[#EA4335] border-[#EA4335]/20',
      connected: accounts.some(a => a.provider === 'gmail'),
      url: await getOAuthUrl('gmail')
    },
    {
      id: 'outlook',
      name: 'Outlook / Microsoft 365',
      description: 'Sync your Microsoft Outlook emails directly to Leadsmind.',
      icon: '/icons/microsoft.svg',
      color: 'bg-[#0078D4]/10 text-[#0078D4] border-[#0078D4]/20',
      connected: accounts.some(a => a.provider === 'outlook'),
      url: await getOAuthUrl('outlook')
    }
  ];

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">Email Sync</h1>
        <p className="text-sm text-white/40 font-medium">Connect your inbox to automatically track conversations with contacts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {providers.map((provider) => (
          <div 
            key={provider.id}
            className={cn(
                "group relative bg-[#0b0b10] border rounded-[2.5rem] p-8 flex flex-col gap-8 transition-all hover:border-white/10",
                provider.connected ? "border-green-500/20" : "border-white/5"
            )}
          >
            <div className="flex items-start justify-between">
                <div className={cn(
                    "h-16 w-16 rounded-2xl flex items-center justify-center border",
                    provider.color
                )}>
                    <Mail className="h-8 w-8" />
                </div>
                {provider.connected && (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-500 rounded-full border border-green-500/20">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Connected</span>
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">{provider.name}</h3>
                <p className="text-sm text-white/40 leading-relaxed font-medium">
                    {provider.description}
                </p>
            </div>

            <div className="mt-auto">
                <Button 
                    disabled={provider.connected}
                    className={cn(
                        "w-full h-12 rounded-xl font-bold gap-2 transition-all",
                        provider.connected 
                            ? "bg-white/5 text-white/20 border border-white/5" 
                            : "bg-white text-black hover:bg-white/90"
                    )}
                    asChild={!provider.connected}
                >
                    {provider.connected ? (
                        <span>Account Linked</span>
                    ) : (
                        <Link href={provider.url}>
                            <Plus className="h-4 w-4" />
                            Connect {provider.id === 'gmail' ? 'Gmail' : 'Outlook'}
                        </Link>
                    )}
                </Button>
            </div>

            {/* Micro-animations Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-[2.5rem]" />
          </div>
        ))}
      </div>

      {accounts.length > 0 && (
        <div className="space-y-6 pt-10 border-t border-white/5">
            <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-blue-600/10 text-blue-500 flex items-center justify-center">
                    <Settings2 className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-black uppercase italic tracking-tight">Manage Accounts</h2>
            </div>

            <div className="space-y-3">
                {accounts.map((account) => (
                    <div key={account.id} className="bg-[#0b0b10] border border-white/5 rounded-2xl p-5 flex items-center justify-between group hover:border-white/10 transition-all">
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                "h-10 w-10 rounded-xl flex items-center justify-center",
                                account.provider === 'gmail' ? "bg-[#EA4335]/10 text-[#EA4335]" : "bg-[#0078D4]/10 text-[#0078D4]"
                            )}>
                                <Mail className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">{account.email_address}</p>
                                <div className="flex items-center gap-2">
                                    <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">{account.provider}</p>
                                    <div className="h-1 w-1 rounded-full bg-white/10" />
                                    <p className="text-[10px] text-green-500/60 font-black uppercase tracking-widest">Active Sync</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="h-9 px-4 rounded-xl gap-2 font-bold text-white/40 hover:text-white hover:bg-white/5 transition-all">
                                <RefreshCw className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline uppercase text-[9px] tracking-widest">Re-sync</span>
                            </Button>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-white/10 hover:text-red-500 hover:bg-red-500/5 transition-all">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* Security Banner */}
      <div className="bg-blue-600/5 border border-blue-500/10 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-6">
        <div className="h-14 w-14 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
            <Lock className="h-7 w-7" />
        </div>
        <div className="space-y-1 text-center md:text-left">
            <h4 className="text-sm font-black uppercase italic tracking-tight text-blue-400">Security & Privacy</h4>
            <p className="text-xs text-white/40 font-medium leading-relaxed max-w-xl">
                LeadsMind uses industry-standard OAuth 2.0 to access your emails. We only sync emails related to your CRM contacts. Your personal data is never stored on our servers longer than necessary for processing.
            </p>
        </div>
      </div>
    </div>
  );
}
