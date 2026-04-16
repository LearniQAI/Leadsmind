import { redirect } from 'next/navigation';

interface AutomationPageProps {
  params: {
    id: string;
  };
}

export default function AutomationPage({ params }: AutomationPageProps) {
  // Prevent 404 by redirecting to the builder
  redirect(`/automations/${params.id}/edit`);
}
