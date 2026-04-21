'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { verifyDomain } from '@/lib/branding';
import { DomainVerificationStatus } from '@/types/branding.types';

interface DomainVerifierProps {
  value: string;
  onChange: (value: string) => void;
}

export function DomainVerifier({ value, onChange }: DomainVerifierProps) {
  const [status, setStatus] = useState<DomainVerificationStatus>('unchecked');
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!value) return;
    setLoading(true);
    const result = await verifyDomain(value);
    setStatus(result.status);
    setMessage(result.message);
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs font-bold text-white/50 uppercase tracking-widest">Custom Domain</Label>
        <div className="flex gap-2">
          <Input 
            placeholder="crm.yourdomain.com" 
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setStatus('unchecked');
            }}
            className="bg-white/5 border-white/10 text-white"
          />
          <Button 
            variant="outline" 
            onClick={handleVerify}
            disabled={loading || !value}
            className="border-white/10 hover:bg-white/5"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify DNS'}
          </Button>
        </div>
      </div>

      {status !== 'unchecked' && (
        <div className={`p-4 rounded-xl border flex items-start gap-3 ${
          status === 'verified' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
            : 'bg-orange-500/10 border-orange-500/20 text-orange-400'
        }`}>
          {status === 'verified' ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
          <div className="text-sm">
            <p className="font-bold">{status === 'verified' ? 'Domain Verified' : 'Verification Pending'}</p>
            <p className="opacity-80 mt-0.5">{message}</p>
          </div>
        </div>
      )}

      <div className="bg-white/3 border border-white/5 rounded-xl p-4 space-y-3">
        <h4 className="text-xs font-bold text-white uppercase tracking-widest">DNS Configuration</h4>
        <p className="text-[11px] text-white/40 leading-relaxed">
          To connect your domain, add the following CNAME record in your DNS provider (e.g. Cloudflare, GoDaddy):
        </p>
        <div className="grid grid-cols-3 gap-2 text-[10px]">
          <div className="text-white/30 font-bold uppercase">Type</div>
          <div className="text-white/30 font-bold uppercase">Name (Host)</div>
          <div className="text-white/30 font-bold uppercase">Value (Points to)</div>
          
          <div className="text-white font-mono bg-white/5 px-2 py-1 rounded">CNAME</div>
          <div className="text-white font-mono bg-white/5 px-2 py-1 rounded">{value.split('.')[0] || 'crm'}</div>
          <div className="text-white font-mono bg-white/5 px-2 py-1 rounded">cname.leadsmind.ai</div>
        </div>
      </div>
    </div>
  );
}
