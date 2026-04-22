'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ColourPicker } from './ColourPicker';
import { DomainVerifier } from './DomainVerifier';
import { BrandingPreview } from './BrandingPreview';
import { WorkspaceBranding } from '@/types/branding.types';
import { saveBranding } from '@/lib/branding';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Palette, Globe, Shield, Trash2, Upload } from 'lucide-react';

interface BrandingFormProps {
  initialData: WorkspaceBranding | null;
  workspaceId: string;
}

export function BrandingForm({ initialData, workspaceId }: BrandingFormProps) {
  const [loading, setLoading] = useState(false);
  const [platformName, setPlatformName] = useState(initialData?.platform_name || 'LeadsMind');
  const [primaryColor, setPrimaryColor] = useState(initialData?.primary_color || '#6c47ff');
  const [logoUrl, setLogoUrl] = useState(initialData?.logo_url || null);
  const [faviconUrl, setFaviconUrl] = useState(initialData?.favicon_url || null);
  const [customDomain, setCustomDomain] = useState(initialData?.custom_domain || '');
  const [supportEmail, setSupportEmail] = useState(initialData?.support_email || '');
  
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);

  const supabase = createClient();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon') => {
    const file = event.target.files?.[0];
    if (!file) return;

    // PNG/SVG only for logos, ICO/PNG for favicons
    if (type === 'logo' && !['image/png', 'image/svg+xml'].includes(file.type)) {
      toast.error('Logo must be PNG or SVG');
      return;
    }
    if (file.size > 1024 * 1024) {
      toast.error('File size must be under 1MB');
      return;
    }

    if (type === 'logo') setUploadingLogo(true);
    else setUploadingFavicon(true);

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${workspaceId}/branding/${type}_${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('media')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      if (type === 'logo') setLogoUrl(publicUrl);
      else setFaviconUrl(publicUrl);
      toast.success(`${type === 'logo' ? 'Logo' : 'Favicon'} uploaded successfully`);
    } catch (error: any) {
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      if (type === 'logo') setUploadingLogo(false);
      else setUploadingFavicon(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    const result = await saveBranding(workspaceId, {
      platform_name: platformName,
      primary_color: primaryColor,
      logo_url: logoUrl,
      favicon_url: faviconUrl,
      custom_domain: customDomain || null,
      support_email: supportEmail || null,
    });

    if (result.success) {
      toast.success('Branding saved successfully');
    } else {
      toast.error(`Error: ${result.error}`);
    }
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        {/* Platform Identity */}
        <Card className="bg-white/3 border-white/5 rounded-[24px] overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#6c47ff]" />
              Platform Identity
            </CardTitle>
            <CardDescription className="text-white/40">Set your platform name and brand assets.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-white/50 uppercase tracking-widest">Platform Name</Label>
              <Input 
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                placeholder="LeadsMind"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-xs font-bold text-white/50 uppercase tracking-widest">Logo (PNG/SVG, max 1MB)</Label>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                    {logoUrl ? <img src={logoUrl} className="h-full w-full object-contain p-2" alt="Logo" /> : <Upload className="h-6 w-6 text-white/20" />}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => document.getElementById('logo-upload')?.click()}
                      disabled={uploadingLogo}
                      className="border-white/10 hover:bg-white/5 h-8"
                    >
                      {uploadingLogo ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Upload className="h-3 w-3 mr-2" />}
                      Upload Logo
                    </Button>
                    <input id="logo-upload" type="file" className="hidden" accept=".png,.svg" onChange={(e) => handleFileUpload(e, 'logo')} />
                    {logoUrl && (
                      <Button variant="ghost" size="sm" onClick={() => setLogoUrl(null)} className="h-8 text-white/30 hover:text-red-400 hover:bg-red-400/10">
                        <Trash2 className="h-3 w-3 mr-2" /> Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-bold text-white/50 uppercase tracking-widest">Favicon (ICO/PNG, 32x32)</Label>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                    {faviconUrl ? <img src={faviconUrl} className="h-full w-full object-contain p-2" alt="Favicon" /> : <Globe className="h-5 w-5 text-white/20" />}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => document.getElementById('favicon-upload')?.click()}
                      disabled={uploadingFavicon}
                      className="border-white/10 hover:bg-white/5 h-8"
                    >
                      {uploadingFavicon ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Upload className="h-3 w-3 mr-2" />}
                      Upload Fav
                    </Button>
                    <input id="favicon-upload" type="file" className="hidden" accept=".ico,.png" onChange={(e) => handleFileUpload(e, 'favicon')} />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-white/50 uppercase tracking-widest">Support Email</Label>
              <Input 
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                placeholder="support@yourdomain.com"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Brand Colour */}
        <Card className="bg-white/3 border-white/5 rounded-[24px]">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Palette className="h-5 w-5 text-[#6c47ff]" />
              Brand Colour
            </CardTitle>
            <CardDescription className="text-white/40">This color will be used for buttons, sidebar, and accents.</CardDescription>
          </CardHeader>
          <CardContent>
            <ColourPicker value={primaryColor} onChange={setPrimaryColor} />
          </CardContent>
        </Card>

        {/* Custom Domain */}
        <Card className="bg-white/3 border-white/5 rounded-[24px]">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Globe className="h-5 w-5 text-[#6c47ff]" />
              Custom Domain
            </CardTitle>
            <CardDescription className="text-white/40">Access your workspace via your own branded URL.</CardDescription>
          </CardHeader>
          <CardContent>
            <DomainVerifier value={customDomain} onChange={setCustomDomain} />
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
          <Button 
            onClick={handleSave} 
            disabled={loading}
            className="rounded-xl px-8 h-12 bg-[#6c47ff] hover:bg-[#5c3ac7] text-white font-bold shadow-lg shadow-[#6c47ff]/20"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Save Branding Assets'}
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        <BrandingPreview 
          primaryColor={primaryColor} 
          platformName={platformName} 
          logoUrl={logoUrl} 
        />
      </div>
    </div>
  );
}
