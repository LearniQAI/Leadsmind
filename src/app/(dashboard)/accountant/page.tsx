import { getCurrentWorkspace } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getAccountantOnboarding } from "@/app/actions/accountant";

export default async function AccountantGatewayPage() {
  const supabase = await createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const workspace = await getCurrentWorkspace(session.user);
  if (!workspace) redirect("/dashboard");

  const onboarding = await getAccountantOnboarding(workspace.id);

  if (!onboarding || !onboarding.is_completed) {
    redirect("/accountant/onboarding");
  }

  // If already onboarded, go to the accountant dashboard
  redirect("/accountant/dashboard");
}
