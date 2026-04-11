import { z } from 'zod';

export const twilioSchema = z.object({
  accountSid: z.string().min(1, 'Account SID is required').regex(/^AC[a-f0-9]{32}$/, 'Invalid Twilio Account SID format'),
  authToken: z.string().min(1, 'Auth Token is required'),
  phoneNumber: z.string().min(1, 'Phone number is required').regex(/^\+[1-9]\d{1,14}$/, 'Invalid phone number format (e.g., +1234567890)'),
});

export type TwilioValues = z.infer<typeof twilioSchema>;

export const emailSchema = z.object({
  apiKey: z.string().min(1, 'API Key is required'),
  fromEmail: z.string().email('Invalid email format').min(1, 'From email is required'),
});

export type EmailValues = z.infer<typeof emailSchema>;

export const metaSchema = z.object({
  accessToken: z.string().min(1, 'Access Token is required'),
  pageId: z.string().min(1, 'Page ID is required'),
});

export type MetaValues = z.infer<typeof metaSchema>;

export const twitterSchema = z.object({
  apiKey: z.string().min(1, 'API Key is required'),
  apiSecret: z.string().min(1, 'API Secret is required'),
  accessToken: z.string().min(1, 'Access Token is required'),
  accessSecret: z.string().min(1, 'Access Secret is required'),
});

export type TwitterValues = z.infer<typeof twitterSchema>;
