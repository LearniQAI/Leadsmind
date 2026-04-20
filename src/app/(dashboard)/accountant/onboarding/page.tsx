import { getCurrentWorkspace } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AccountantOnboarding from "@/components/accountant/AccountantOnboarding";

export default async function OnboardingPage() {
  const supabase = await createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const workspace = await getCurrentWorkspace(session.user);
  if (!workspace) redirect("/dashboard");

  return <AccountantOnboarding workspaceId={workspace.id} />;
}
