import { getCurrentWorkspace } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { QuoteForm } from "@/components/billing/QuoteForm";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function NewQuotePage() {
  const supabase = await createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const workspace = await getCurrentWorkspace(session.user);
  if (!workspace) redirect("/invoice/dashboard");

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/invoice/quotes">
            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-white/5 border border-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all">
              <ChevronLeft size={24} />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight uppercase leading-none mb-2">New Quote</h1>
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Create a professional estimate for your client</p>
          </div>
        </div>
      </div>

      <QuoteForm workspaceId={workspace.id} />
    </div>
  );
}
