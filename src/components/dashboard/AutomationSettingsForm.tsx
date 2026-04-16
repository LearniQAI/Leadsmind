'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { 
  Loader2, 
  Mail, 
  MessageSquare, 
  ShieldCheck, 
  ShieldAlert,
  Save,
  Activity,
  Info,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { 
  automationSettingsSchema, 
  AutomationSettingsValues 
} from '@/lib/validations/automation-settings.schema';
import { 
  updateAutomationSettings, 
  testResendConnection, 
  testTwilioConnection 
} from '@/app/actions/workspace';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface AutomationSettingsFormProps {
  initialValues: AutomationSettingsValues;
}

export function AutomationSettingsForm({ initialValues }: AutomationSettingsFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingResend, setIsTestingResend] = useState(false);
  const [isTestingTwilio, setIsTestingTwilio] = useState(false);

  const form = useForm<AutomationSettingsValues>({
    resolver: zodResolver(automationSettingsSchema),
    defaultValues: initialValues,
  });

  async function onSubmit(values: AutomationSettingsValues) {
    setIsSaving(true);
    try {
      const result = await updateAutomationSettings(values);
      if (result.success) {
        toast.success('Automation settings updated successfully');
      } else {
        toast.error(result.error || 'Failed to update settings');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleTestResend() {
    const apiKey = form.getValues('resend_api_key');
    if (!apiKey) {
      toast.error('Please enter a Resend API key first');
      return;
    }

    setIsTestingResend(true);
    try {
      const result = await testResendConnection(apiKey);
      if (result.success) {
        toast.success('Resend connection verified successfully!');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to test Resend connection');
    } finally {
      setIsTestingResend(false);
    }
  }

  async function handleTestTwilio() {
    const sid = form.getValues('twilio_sid');
    const token = form.getValues('twilio_token');
    
    if (!sid || !token) {
      toast.error('Please enter Twilio SID and Token first');
      return;
    }

    setIsTestingTwilio(true);
    try {
      const result = await testTwilioConnection(sid, token);
      if (result.success) {
        toast.success('Twilio connection verified successfully!');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to test Twilio connection');
    } finally {
      setIsTestingTwilio(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Resend Card */}
        <Card className="border-none shadow-xl bg-gradient-to-br from-background to-accent/20 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-6 opacity-5">
            <Mail size={120} />
          </div>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-xl">Email Integration (Resend)</CardTitle>
                  <CardDescription>Configure your custom email sending infrastructure.</CardDescription>
                </div>
              </div>
              <Badge variant={initialValues.resend_api_key ? "default" : "secondary"} className="gap-1 px-3 py-1">
                {initialValues.resend_api_key ? (
                  <><ShieldCheck className="w-3 h-3" /> Configured</>
                ) : (
                  <><ShieldAlert className="w-3 h-3" /> Pending</>
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 relative z-10">
            {/* Setup Guide */}
            <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-primary font-semibold">
                <Info className="w-4 h-4" />
                <span className="text-sm">Setup Guide: Domain Verification</span>
              </div>
              <p className="text-xs text-muted-foreground">
                To send emails from your own domain, you must perform the following in your Resend account:
              </p>
              <ul className="space-y-2">
                {[
                  "Obtain your API Key from your Resend Dashboard.",
                  "Add and verify your sending domain in Resend Settings (DNS records).",
                  "Ensure your 'Sender Email' below matches your verified domain."
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-primary/60 shrink-0" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
              <Button variant="link" size="sm" className="h-auto p-0 text-primary text-xs gap-1" asChild>
                <a href="https://resend.com/domains" target="_blank" rel="noopener noreferrer">
                  Verify your domain on Resend <ExternalLink className="w-3 h-3" />
                </a>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="email_from_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sender Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Leadsmind Sales" {...field} className="bg-background/50 backdrop-blur-sm transition-all focus:ring-primary" />
                    </FormControl>
                    <FormDescription>The name recipients will see.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email_from_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sender Email</FormLabel>
                    <FormControl>
                      <Input placeholder="noreply@yourdomain.com" {...field} className="bg-background/50 backdrop-blur-sm transition-all focus:ring-primary" />
                    </FormControl>
                    <FormDescription>Must belong to your verified Resend domain.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="resend_api_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resend API Key</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input 
                        type="password" 
                        placeholder="re_..." 
                        {...field} 
                        className="bg-background/50 backdrop-blur-sm transition-all focus:ring-primary flex-1"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleTestResend}
                        disabled={isTestingResend}
                        className="gap-2"
                      >
                        {isTestingResend ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                        Test
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription>Your secret API key from resend.com.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Twilio Card */}
        <Card className="border-none shadow-xl bg-gradient-to-br from-background to-accent/20 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-6 opacity-5">
            <MessageSquare size={120} />
          </div>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-xl">SMS Integration (Twilio)</CardTitle>
                  <CardDescription>Configure your SMS and voice automated messaging.</CardDescription>
                </div>
              </div>
              <Badge variant={initialValues.twilio_sid ? "default" : "secondary"} className="gap-1 px-3 py-1">
                {initialValues.twilio_sid ? (
                  <><ShieldCheck className="w-3 h-3" /> Configured</>
                ) : (
                  <><ShieldAlert className="w-3 h-3" /> Pending</>
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="twilio_sid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account SID</FormLabel>
                    <FormControl>
                      <Input placeholder="AC..." {...field} className="bg-background/50 backdrop-blur-sm transition-all focus:ring-primary" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="twilio_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Twilio Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+1234567890" {...field} className="bg-background/50 backdrop-blur-sm transition-all focus:ring-primary" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="twilio_token"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Auth Token</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input 
                        type="password" 
                        placeholder="auth_token" 
                        {...field} 
                        className="bg-background/50 backdrop-blur-sm transition-all focus:ring-primary flex-1"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleTestTwilio}
                        disabled={isTestingTwilio}
                        className="gap-2"
                      >
                        {isTestingTwilio ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                        Test
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Action Bar */}
        <div className="flex justify-end pt-4">
          <Button type="submit" size="lg" disabled={isSaving} className="px-10 gap-2 shadow-lg shadow-primary/20">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save All Settings
          </Button>
        </div>
      </form>
    </Form>
  );
}
