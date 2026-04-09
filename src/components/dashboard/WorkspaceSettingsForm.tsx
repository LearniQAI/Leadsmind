'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { workspaceSchema, WorkspaceValues } from '@/lib/validations/workspace.schema';
import { updateWorkspace, uploadLogo, deleteWorkspace } from '@/app/actions/workspace';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Loader2, 
  Upload, 
  Trash2, 
  AlertTriangle,
  CheckCircle2,
  Info
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Workspace } from '@/types/workspace.types';

interface WorkspaceSettingsFormProps {
  workspace: Workspace;
}

export function WorkspaceSettingsForm({ workspace }: WorkspaceSettingsFormProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<WorkspaceValues>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      name: workspace.name,
      slug: workspace.slug,
    },
  });

  async function onUpdateWorkspace(values: WorkspaceValues) {
    setIsUpdating(true);
    try {
      const result = await updateWorkspace(workspace.id, values);
      if (result.success) {
        toast.success('Workspace settings saved');
      } else {
        toast.error(result.error || 'Failed to update workspace');
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsUpdating(false);
    }
  }

  async function onLogoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      toast.error('Only JPEG and PNG files are allowed');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('logo', file);

    try {
      const result = await uploadLogo(workspace.id, formData);
      if (result.success) {
        toast.success('Logo updated successfully');
      } else {
        toast.error(result.error || 'Failed to upload logo');
      }
    } catch {
      toast.error('Failed to upload logo');
    } finally {
      setIsUploading(false);
    }
  }

  async function onDeleteWorkspace() {
    setIsDeleting(true);
    try {
      const result = await deleteWorkspace(workspace.id);
      if (result.success) {
        toast.success('Workspace deleted successfully');
      } else {
        toast.error(result.error || 'Failed to delete workspace');
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsDeleting(false);
    }
  }

  const freePlanFeatures = [
    'Up to 100 contacts',
    'Basic sales pipeline',
    'Email support'
  ];

  return (
    <div className="space-y-12 pb-12 animate-fade-up">
      {/* General Settings */}
      <Card className="border-white/5 bg-white/2 overflow-hidden">
        <CardHeader className="border-b border-white/5 bg-white/1 px-8 py-6">
          <CardTitle className="text-xl font-bold text-white">General Settings</CardTitle>
          <CardDescription className="text-sm font-light text-white/40">
            Update your workspace name and unique identifier.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={form.handleSubmit(onUpdateWorkspace)} className="space-y-6 max-w-2xl">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-white/80">Workspace Name</Label>
              <Input
                id="name"
                {...form.register('name')}
                placeholder="My Organization"
                disabled={isUpdating}
                className="h-11 bg-white/3 border-white/10 rounded-xl text-white focus:border-[#6c47ff]/50 transition-all"
              />
              {form.formState.errors.name && (
                <p className="text-xs font-medium text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug" className="text-sm font-semibold text-white/80">Workspace Slug</Label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Input
                    id="slug"
                    {...form.register('slug')}
                    placeholder="my-organization"
                    disabled={isUpdating}
                    className="h-11 bg-white/3 border-white/10 rounded-xl text-white focus:border-[#6c47ff]/50 transition-all"
                  />
                </div>
              </div>
              <p className="text-[11px] text-white/20 flex items-center gap-1.5 mt-1">
                <Info className="h-3 w-3" />
                The slug is used in your unique workspace URL (e.g. app.leadsmind.com/my-org).
              </p>
              {form.formState.errors.slug && (
                <p className="text-xs font-medium text-destructive">{form.formState.errors.slug.message}</p>
              )}
            </div>
            <div className="pt-4">
              <Button 
                type="submit" 
                disabled={isUpdating || !form.formState.isDirty}
                className="h-11 rounded-xl bg-[#6c47ff] hover:bg-[#6c47ff]/90 text-white font-bold px-8 shadow-lg shadow-[#6c47ff]/10 transition-all disabled:opacity-50 disabled:shadow-none"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving Changes
                  </>
                ) : (
                  'Save Settings'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Branding Section */}
      <Card className="border-white/5 bg-white/2 overflow-hidden">
        <CardHeader className="border-b border-white/5 bg-white/1 px-8 py-6">
          <CardTitle className="text-xl font-bold text-white">Branding</CardTitle>
          <CardDescription className="text-sm font-light text-white/40">
            Customize your workspace appearance with a professional logo.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-10">
            <div className="relative group">
              <Avatar className="h-28 w-28 rounded-2xl border-2 border-white/5 shadow-2xl ring-4 ring-white/2 focus-within:ring-[#6c47ff]/20 transition-all">
                <AvatarImage src={workspace.logoUrl || ''} className="object-cover" />
                <AvatarFallback className="text-3xl font-extrabold bg-linear-to-br from-white/5 to-white/10 text-white/20">
                  {workspace.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-2xl backdrop-blur-sm">
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                </div>
              )}
            </div>
            <div className="space-y-4 max-w-sm">
              <div className="space-y-1">
                <Label className="text-sm font-bold text-white/80">Workspace Logo</Label>
                <p className="text-[11px] text-white/20 leading-relaxed">
                  Upload a square format logo for the best results. 
                  Accepted: PNG, JPG (Max 2MB).
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-10 rounded-xl border-white/10 bg-white/5 font-semibold text-white transition-all hover:bg-white/10 gap-2"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                  Change Logo
                </Button>
                {workspace.logoUrl && (
                  <Button variant="ghost" size="sm" className="h-10 rounded-xl text-white/40 hover:text-destructive hover:bg-destructive/10 transition-all">
                    Remove
                  </Button>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/png,image/jpeg"
                  onChange={onLogoChange}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan & Billing */}
      <Card className="border-white/5 bg-white/2 overflow-hidden">
        <CardHeader className="border-b border-white/5 bg-white/1 px-8 py-6 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-white">Plan & Billing</CardTitle>
            <CardDescription className="text-sm font-light text-white/40">
              Manage your subscription and billing details.
            </CardDescription>
          </div>
          <Badge className="bg-[#6c47ff]/10 text-[#6c47ff] border-none font-extrabold px-3 py-1 text-[10px] uppercase tracking-widest ring-1 ring-[#6c47ff]/20">
            Free Plan
          </Badge>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <ul className="space-y-3">
                {freePlanFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm font-medium text-white/70">
                    <CheckCircle2 className="h-4 w-4 text-[#6c47ff]" />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="relative inline-block">
                <Button disabled className="h-11 rounded-xl bg-white/5 border border-white/10 text-white/20 font-bold px-8 opacity-50">
                  Upgrade to Professional
                </Button>
                <div className="absolute -top-3 -right-3 rotate-12">
                  <Badge variant="outline" className="text-[9px] font-bold bg-[#6c47ff] border-none text-white shadow-lg">SOON</Badge>
                </div>
              </div>
            </div>
            <div className="rounded-2xl bg-[#6c47ff]/5 border border-[#6c47ff]/10 p-6 space-y-3">
              <div className="flex items-center gap-2 text-[#6c47ff]">
                <Info className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Note</span>
              </div>
              <p className="text-sm font-light text-[#6c47ff]/80 leading-relaxed">
                Billing cycles reset on the 1st of every month. You currently have 0/100 contacts used.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/20 bg-destructive/5 overflow-hidden">
        <CardHeader className="border-b border-destructive/10 bg-destructive/5 px-8 py-6">
          <CardTitle className="text-xl font-bold text-destructive">Danger Zone</CardTitle>
          <CardDescription className="text-sm font-light text-destructive/60">
            Destructive actions are permanent. Proceed with extreme caution.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1">
              <p className="text-sm font-bold text-white/90">Delete this workspace</p>
              <p className="text-xs font-light text-white/30 max-w-md">
                Once deleted, all data including contacts, pipelines, and settings will be permanently erased. This cannot be undone.
              </p>
            </div>
            <Dialog>
              <DialogTrigger render={
                <Button variant="destructive" className="h-11 rounded-xl px-6 font-bold shadow-lg shadow-destructive/10 gap-2 transition-all hover:scale-105 active:scale-95">
                  <Trash2 className="h-4 w-4" />
                  Delete Workspace
                </Button>
              } />
              <DialogContent className="bg-[#0b0b10] border-white/10 text-white p-8 rounded-3xl">
                <DialogHeader className="space-y-3">
                  <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-destructive">
                    <AlertTriangle className="h-6 w-6" />
                    Heads Up!
                  </DialogTitle>
                  <DialogDescription className="text-white/50 text-base font-light">
                    You are about to permanently delete <span className="font-bold text-white">&quot;{workspace.name}&quot;</span>. This will wipe all associated data.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-8 space-y-3">
                  <p className="text-sm font-semibold text-white/70">Confirm by typing the workspace name:</p>
                  <Input 
                    value={deleteConfirmName} 
                    onChange={(e) => setDeleteConfirmName(e.target.value)}
                    placeholder={workspace.name}
                    className="h-12 bg-white/5 border-destructive/30 rounded-xl text-white focus:border-destructive transition-all placeholder:text-white/10"
                  />
                </div>
                <DialogFooter>
                  <Button 
                    variant="destructive" 
                    className="h-12 w-full rounded-xl font-bold shadow-2xl shadow-destructive/20"
                    disabled={deleteConfirmName !== workspace.name || isDeleting}
                    onClick={onDeleteWorkspace}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'I understand, delete permanently'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
