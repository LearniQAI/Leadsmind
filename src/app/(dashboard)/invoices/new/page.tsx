import { requireAuth, getCurrentWorkspaceId } from "@/lib/auth";
import { getInvoiceSettings, getContactsForInvoicing, getProducts } from "@/app/actions/finance";
import { InvoiceBuilder } from "@/components/invoices/InvoiceBuilder";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ contactId?: string }>;
}) {
  await requireAuth();
  const workspaceId = await getCurrentWorkspaceId();
  const { contactId } = await searchParams;

  const [settings, contacts, products] = await Promise.all([
    getInvoiceSettings(workspaceId!),
    getContactsForInvoicing(workspaceId!),
    getProducts(workspaceId!)
  ]);

  // If settings don't exist, redirect to setup
  if (!settings) {
    // For now, let's just use defaults if first time
    // But ideally redirect to a setup wizard
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/invoices">
          <Button variant="ghost" size="icon" className="text-white/40 hover:text-white rounded-xl">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">New Invoice</h1>
          <p className="text-sm text-white/40 mt-1">Fill in details to generate a professional billing document</p>
        </div>
      </div>

      <InvoiceBuilder 
        workspaceId={workspaceId!}
        contacts={contacts} 
        products={products} 
        settings={settings || {
           id: "default",
           workspace_id: workspaceId!,
           invoice_prefix: "INV-",
           next_invoice_number: 1,
           quote_prefix: "QT-",
           next_quote_number: 1,
           default_terms: "",
           default_notes: "",
           company_address: "",
           company_email: "",
           company_phone: "",
           logo_url: null
        }} 
        initialData={{ contact_id: contactId }}
      />
    </div>
  );
}
