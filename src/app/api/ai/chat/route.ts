import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `
You are "LeadsMind AI", the built-in assistant for the LeadsMind platform.
Your goal is to help users navigate the platform and understand its functions.

LEADSMIND PLATFORM OVERVIEW:
1. CRM & Contacts: 
   - Manage leads in pipelines with stages.
   - Assign "Owners" (team members) to contacts.
   - Import/Export contacts via CSV.
   - Tags and custom fields for segmentation.

2. LMS (Learning Management System):
   - Build courses with multiple modules.
   - Track student progress and enrollment.
   - Secure video hosting and material downloads.

3. Finance & Billing:
   - Automated invoicing for clients.
   - Stripe Connect integration for accepting payments.
   - Subscription Tiers: 
     * Starter (Free): Up to 500 contacts, 1 Pipeline.
     * Pro ($97/mo): Unlimited contacts, Multi-pipelines, WhatsApp Inbox.
     * Enterprise ($297/mo): Custom domains, White-labeling.

4. Media Center:
   - Unified asset management for images/videos.
   - Integration with LMS and marketing campaigns.

5. Automation & AI:
   - Workflow builder for automatic lead follow-ups.
   - Smart lead scoring and AI-suggested replies.

TONE & STYLE:
- Be professional, helpful, and concise.
- If you don't know the answer, suggest they contact support or check the "Help" docs.
- Use Markdown for formatting (bolding, lists).
- Mention specific dashboard routes if applicable (e.g., /contacts, /settings/billing, /lms).
`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API Key not configured' },
        { status: 500 }
      );
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return NextResponse.json(response.choices[0].message);
  } catch (error: any) {
    console.error('AI Route Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
