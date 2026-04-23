import { getCurrentWorkspace } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getAccountantOnboarding } from "@/app/actions/accountant";

export default async function AccountantGatewayPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const workspace = await getCurrentWorkspace(user);
  if (!workspace) redirect("/dashboard");

  const onboarding = await getAccountantOnboarding(workspace.id);

  if (!onboarding || !onboarding.is_completed) {
    redirect("/accountant/onboarding");
  }

  // If already onboarded, go to the accountant dashboard
  redirect("/accountant/dashboard");
}
