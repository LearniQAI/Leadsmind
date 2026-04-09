import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Forgot Password | LeadsMind',
  description: 'Reset your LeadsMind account password',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
