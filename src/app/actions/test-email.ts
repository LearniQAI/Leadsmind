'use server';

import { sendEmail } from '@/lib/email';
import { requireAdmin } from '@/lib/auth';

export async function sendTestEmail(to: string) {
  try {
    await requireAdmin();
    
    const result = await sendEmail({
      to,
      subject: 'Test Email from LeadsMind',
      react: (
        <div>
          <h1>Integration Successful!</h1>
          <p>Your Resend API key is now configured and working correctly in the Leadsmind codebase.</p>
          <hr />
          <p>Sent via <strong>LeadsMind</strong></p>
        </div>
      ) as any,
    });

    return { success: true, id: (result as any).id };
  } catch (error: any) {
    console.error('Test email failed:', error);
    return { success: false, error: error.message };
  }
}
