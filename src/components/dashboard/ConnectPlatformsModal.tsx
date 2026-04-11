'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { 
  Mail, 
  MessageSquare, 
  MessageCircle, 
  ChevronLeft,
  CheckCircle2,
  Loader2,
  Lock,
  Phone,
  Key
} from 'lucide-react';
import { FaInstagram as Instagram, FaTwitter as Twitter, FaFacebook as Facebook } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  twilioSchema, TwilioValues,
  emailSchema, EmailValues,
  metaSchema, MetaValues,
  twitterSchema, TwitterValues
} from '@/lib/validations/messaging.schema';
import { 
  connectTwilio, 
  getConnectedPlatforms,
  connectEmail,
  connectMeta,
  connectTwitter,
  syncRecentMessages,
  getTwitterAuthUrl
} from '@/app/actions/messaging';

interface Platform {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  bgColor: string;
  status: 'connected' | 'not_connected';
}

interface ConnectPlatformsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConnectPlatformsModal({ open, onOpenChange }: ConnectPlatformsModalProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      const fetchStatus = async () => {
        const platforms = await getConnectedPlatforms();
        setConnectedPlatforms(platforms.map(p => p.platform));
      };
      fetchStatus();
    } else {
      setSelectedPlatform(null);
    }
  }, [open]);

  const twilioForm = useForm<TwilioValues>({
    resolver: zodResolver(twilioSchema),
    defaultValues: { accountSid: '', authToken: '', phoneNumber: '' },
  });

  const emailForm = useForm<EmailValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { apiKey: '', fromEmail: '' },
  });

  const metaForm = useForm<MetaValues>({
    resolver: zodResolver(metaSchema),
    defaultValues: { accessToken: '', pageId: '' },
  });

  const twitterForm = useForm<TwitterValues>({
    resolver: zodResolver(twitterSchema),
    defaultValues: { apiKey: '', apiSecret: '', accessToken: '', accessSecret: '' },
  });

  const platforms: Platform[] = [
    {
      id: 'email',
      name: 'Email',
      description: connectedPlatforms.includes('email') ? 'Connected' : 'Not connected',
      icon: Mail,
      iconColor: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      status: connectedPlatforms.includes('email') ? 'connected' : 'not_connected',
    },
    {
      id: 'sms',
      name: 'SMS (Twilio)',
      description: connectedPlatforms.includes('sms') ? 'Connected' : 'Not connected',
      icon: MessageSquare,
      iconColor: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
      status: connectedPlatforms.includes('sms') ? 'connected' : 'not_connected',
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      description: connectedPlatforms.includes('whatsapp') ? 'Connected' : 'Not connected',
      icon: MessageCircle,
      iconColor: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      status: connectedPlatforms.includes('whatsapp') ? 'connected' : 'not_connected',
    },
    {
      id: 'instagram',
      name: 'Instagram',
      description: connectedPlatforms.includes('instagram') ? 'Connected' : 'Not connected',
      icon: Instagram,
      iconColor: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
      status: connectedPlatforms.includes('instagram') ? 'connected' : 'not_connected',
    },
    {
      id: 'twitter',
      name: 'Twitter',
      description: connectedPlatforms.includes('twitter') ? 'Connected' : 'Not connected',
      icon: Twitter,
      iconColor: 'text-sky-400',
      bgColor: 'bg-sky-400/10',
      status: connectedPlatforms.includes('twitter') ? 'connected' : 'not_connected',
    },
    {
      id: 'facebook',
      name: 'Facebook',
      description: connectedPlatforms.includes('facebook') ? 'Connected' : 'Not connected',
      icon: Facebook,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-600/10',
      status: connectedPlatforms.includes('facebook') ? 'connected' : 'not_connected',
    },
  ];

  const handleConnectClick = (platform: Platform) => {
    setSelectedPlatform(platform);
  };

  const onTwilioSubmit = async (values: TwilioValues) => {
    setIsSubmitting(true);
    const platformId = (selectedPlatform?.id === 'whatsapp' ? 'whatsapp' : 'sms') as 'sms' | 'whatsapp';
    try {
      const result = await connectTwilio(values, platformId);
      if (result.success) {
        toast.success(`${selectedPlatform?.name || 'Platform'} connected successfully!`);
        setConnectedPlatforms(prev => [...prev, platformId]);
        syncRecentMessages();
        setSelectedPlatform(null);
      } else toast.error(result.error);
    } catch {
      toast.error('An unexpected error occurred');
    } finally { setIsSubmitting(false); }
  };

  const onEmailSubmit = async (values: EmailValues) => {
    setIsSubmitting(true);
    try {
      const result = await connectEmail(values);
      if (result.success) {
        toast.success('Email connected successfully!');
        setConnectedPlatforms(prev => [...prev, 'email']);
        syncRecentMessages();
        setSelectedPlatform(null);
      } else toast.error(result.error);
    } catch { toast.error('An error occurred'); } finally { setIsSubmitting(false); }
  };

  const onMetaSubmit = async (values: MetaValues, platformId: 'facebook' | 'instagram') => {
    setIsSubmitting(true);
    try {
      const result = await connectMeta(platformId, values);
      if (result.success) {
        toast.success(`${selectedPlatform?.name || platformId} connected successfully!`);
        setConnectedPlatforms(prev => [...prev, platformId]);
        syncRecentMessages();
        setSelectedPlatform(null);
      } else toast.error(result.error);
    } catch { toast.error('An error occurred'); } finally { setIsSubmitting(false); }
  };

  const onTwitterSubmit = async (values: TwitterValues) => {
    setIsSubmitting(true);
    try {
      const result = await connectTwitter(values);
      if (result.success) {
        toast.success('Twitter connected successfully!');
        setConnectedPlatforms(prev => [...prev, 'twitter']);
        syncRecentMessages();
        setSelectedPlatform(null);
      } else toast.error(result.error);
    } catch { toast.error('An error occurred'); } finally { setIsSubmitting(false); }
  };

  const renderForm = () => {
    if (!selectedPlatform) return null;

    if (selectedPlatform.id === 'sms' || selectedPlatform.id === 'whatsapp') {
      return (
        <form onSubmit={twilioForm.handleSubmit(onTwilioSubmit)} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-bold text-white/70 flex items-center gap-2"><Lock className="h-3.5 w-3.5 text-blue-400" /> Account SID</Label>
              <Input {...twilioForm.register('accountSid')} placeholder="AC..." className="h-12 bg-white/5 border-white/10 rounded-xl text-white focus:ring-1 focus:ring-[#6c47ff]/50 transition-all font-mono text-sm" />
              {twilioForm.formState.errors.accountSid && <p className="text-[11px] font-medium text-destructive mt-1">{twilioForm.formState.errors.accountSid.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-bold text-white/70 flex items-center gap-2"><Key className="h-3.5 w-3.5 text-blue-400" /> Auth Token</Label>
              <Input type="password" {...twilioForm.register('authToken')} placeholder="Twilio Auth Token" className="h-12 bg-white/5 border-white/10 rounded-xl text-white focus:ring-1 focus:ring-[#6c47ff]/50 transition-all" />
              {twilioForm.formState.errors.authToken && <p className="text-[11px] font-medium text-destructive mt-1">{twilioForm.formState.errors.authToken.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-bold text-white/70 flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-blue-400" /> Phone Number</Label>
              <Input {...twilioForm.register('phoneNumber')} placeholder="+1234567890" className="h-12 bg-white/5 border-white/10 rounded-xl text-white focus:ring-1 focus:ring-[#6c47ff]/50 transition-all" />
              {twilioForm.formState.errors.phoneNumber && <p className="text-[11px] font-medium text-destructive mt-1">{twilioForm.formState.errors.phoneNumber.message}</p>}
            </div>
          </div>
          <SubmitButton isSubmitting={isSubmitting} />
        </form>
      );
    }

    if (selectedPlatform.id === 'email') {
      return (
        <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-bold text-white/70 flex items-center gap-2"><Key className="h-3.5 w-3.5 text-blue-400" /> API Key</Label>
              <Input type="password" {...emailForm.register('apiKey')} placeholder="Resend API Key" className="h-12 bg-white/5 border-white/10 rounded-xl text-white focus:ring-1 focus:ring-[#6c47ff]/50 transition-all" />
              {emailForm.formState.errors.apiKey && <p className="text-[11px] font-medium text-destructive mt-1">{emailForm.formState.errors.apiKey.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-bold text-white/70 flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-blue-400" /> From Email</Label>
              <Input {...emailForm.register('fromEmail')} placeholder="hello@yourdomain.com" className="h-12 bg-white/5 border-white/10 rounded-xl text-white focus:ring-1 focus:ring-[#6c47ff]/50 transition-all" />
              {emailForm.formState.errors.fromEmail && <p className="text-[11px] font-medium text-destructive mt-1">{emailForm.formState.errors.fromEmail.message}</p>}
            </div>
          </div>
          <SubmitButton isSubmitting={isSubmitting} />
        </form>
      );
    }

    if (selectedPlatform.id === 'facebook' || selectedPlatform.id === 'instagram') {
      return (
        <form onSubmit={metaForm.handleSubmit((v) => onMetaSubmit(v, selectedPlatform.id as 'facebook' | 'instagram'))} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-bold text-white/70 flex items-center gap-2"><Key className="h-3.5 w-3.5 text-blue-400" /> Access Token</Label>
              <Input type="password" {...metaForm.register('accessToken')} placeholder="Meta Graph API Access Token" className="h-12 bg-white/5 border-white/10 rounded-xl text-white focus:ring-1 focus:ring-[#6c47ff]/50 transition-all" />
              {metaForm.formState.errors.accessToken && <p className="text-[11px] font-medium text-destructive mt-1">{metaForm.formState.errors.accessToken.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-bold text-white/70 flex items-center gap-2"><Lock className="h-3.5 w-3.5 text-blue-400" /> Page ID</Label>
              <Input {...metaForm.register('pageId')} placeholder="Meta Page ID" className="h-12 bg-white/5 border-white/10 rounded-xl text-white focus:ring-1 focus:ring-[#6c47ff]/50 transition-all font-mono" />
              {metaForm.formState.errors.pageId && <p className="text-[11px] font-medium text-destructive mt-1">{metaForm.formState.errors.pageId.message}</p>}
            </div>
          </div>
          <SubmitButton isSubmitting={isSubmitting} />
        </form>
      );
    }

    if (selectedPlatform.id === 'twitter') {
      const handleTwitterAuth = async () => {
        setIsSubmitting(true);
        try {
          const result = await getTwitterAuthUrl();
          if (result.success && result.url) {
            window.location.href = result.url;
          } else {
            toast.error(result.error || 'Failed to initialize Twitter login');
          }
        } catch {
          toast.error('An unexpected error occurred');
        } finally {
          setIsSubmitting(false);
        }
      };

      return (
        <div className="p-8 space-y-6 text-center">
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="h-20 w-20 rounded-3xl bg-sky-400/10 border border-sky-400/20 flex items-center justify-center">
              <Twitter className="h-10 w-10 text-sky-400" />
            </div>
            <div className="space-y-1">
              <h4 className="text-white font-bold text-lg">Official Twitter Connect</h4>
              <p className="text-white/40 text-sm max-w-xs mx-auto">
                We use Twitter's official OAuth 2.0 to securely access your Direct Messages.
              </p>
            </div>
          </div>
          <Button 
            onClick={handleTwitterAuth} 
            disabled={isSubmitting}
            className="w-full h-12 rounded-xl bg-white text-black hover:bg-white/90 font-black uppercase tracking-widest transition-all"
          >
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Preparing...</> : 'Sign in with Twitter'}
          </Button>
          <p className="text-[10px] text-white/20 leading-relaxed italic">
            Note: You'll be redirected to Twitter to authorize this application.
          </p>
        </div>
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] md:max-w-xl bg-[#0b0b10] border-white/5 p-0 overflow-hidden rounded-[28px] shadow-2xl transition-all duration-300">
        {!selectedPlatform ? (
          <>
            <div className="p-6 md:p-8 border-b border-white/5 bg-white/[0.01]">
              <DialogTitle className="text-xl md:text-2xl font-extrabold text-white tracking-tight">Connect Platforms</DialogTitle>
              <DialogDescription className="text-sm font-light text-white/40 mt-1">
                Sync your messaging platforms to view and reply to leads in real-time.
              </DialogDescription>
            </div>
            <div className="p-4 md:p-6 max-h-[70vh] overflow-y-auto overflow-x-hidden scrollbar-thin">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {platforms.map((platform) => (
                  <div 
                    key={platform.id} 
                    className="group relative flex flex-col items-center text-center p-5 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-[#6c47ff]/30 transition-all cursor-default"
                  >
                    <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 border border-white/5 mb-3 transition-transform group-hover:scale-110", platform.bgColor)}>
                      <platform.icon className={cn("h-7 w-7", platform.iconColor)} />
                    </div>
                    <div className="flex flex-col mb-4">
                      <span className="text-base font-bold text-white tracking-tight">{platform.name}</span>
                      <span className="text-[10px] text-white/30 uppercase tracking-widest mt-0.5 font-bold line-clamp-1">{platform.description}</span>
                    </div>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className={cn(
                        "w-full h-10 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all", 
                        platform.status === 'connected' 
                        ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20" 
                        : "bg-[#6c47ff]/10 text-[#6c47ff] hover:bg-[#6c47ff] hover:text-white"
                      )} 
                      onClick={() => handleConnectClick(platform)}
                    >
                      {platform.status === 'connected' ? <span className="flex items-center gap-1.5 justify-center"><CheckCircle2 className="h-3 w-3" /> Connected</span> : "Connect"}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="animate-in slide-in-from-right duration-500 ease-out">
            <div className="p-6 md:p-8 border-b border-white/5 bg-white/[0.01]">
              <button 
                onClick={() => setSelectedPlatform(null)} 
                className="flex items-center gap-2 text-white/30 hover:text-[#6c47ff] mb-6 group transition-colors"
              >
                <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Back to platforms</span>
              </button>
              <div className="flex items-center gap-5">
                <div className={cn("h-16 w-16 rounded-[22px] flex items-center justify-center border border-white/5 shadow-2xl transition-transform", selectedPlatform.bgColor)}>
                  <selectedPlatform.icon className={cn("h-8 w-8", selectedPlatform.iconColor)} />
                </div>
                <div>
                  <DialogTitle className="text-2xl md:text-3xl font-black text-white tracking-tighter leading-none italic">{selectedPlatform.name.split(' ')[0]}</DialogTitle>
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mt-2">API CREDENTIALS REQUIRED</p>
                </div>
              </div>
            </div>
            <div className="max-h-[60vh] overflow-y-auto px-1">
              {renderForm()}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function SubmitButton({ isSubmitting }: { isSubmitting: boolean }) {
  return (
    <div className="pt-2">
      <Button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-xl bg-[#6c47ff] hover:bg-[#6c47ff]/90 text-white font-black uppercase tracking-widest shadow-xl shadow-[#6c47ff]/10 transition-all disabled:opacity-50">
        {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connecting...</> : 'Save Connection'}
      </Button>
      <p className="text-[10px] text-center text-white/20 mt-4 leading-relaxed">
        By saving, you authorize LeadsMind to access your messages via this provider.<br />
        Credentials are stored securely using industry-standard encryption.
      </p>
    </div>
  );
}
