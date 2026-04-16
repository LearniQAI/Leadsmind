import { redirect } from 'next/navigation';

interface AutomationPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AutomationPage({ params }: AutomationPageProps) {
  const { id } = await params;
  // Prevent 404 by redirecting to the builder
  redirect(`/automations/${id}/edit`);
}
