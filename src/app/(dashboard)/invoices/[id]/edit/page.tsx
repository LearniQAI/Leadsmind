import { requireAuth, getCurrentWorkspaceId } from "@/lib/auth";
import { getInvoiceById, getInvoiceSettings, getContactsForInvoicing, getProducts } from "@/app/actions/finance";
import { InvoiceBuilder } from "@/components/invoices/InvoiceBuilder";
import { redirect } from "next/navigation";

interface EditInvoicePageProps {
  params: { id: string };
}

export default async function EditInvoicePage({ params }: EditInvoicePageProps) {
  await requireAuth();
  const workspaceId = await getCurrentWorkspaceId();
  const { id } = await params;

  const [invoice, settingsData, contacts, products] = await Promise.all([
    getInvoiceById(id),
    getInvoiceSettings(workspaceId!),
    getContactsForInvoicing(workspaceId!),
    getProducts(workspaceId!)
  ]);

  if (!invoice) {
    redirect('/invoices');
  }

  // Ensure settings have fallbacks
  const settings = settingsData || {
    invoice_prefix: 'INV-',
    next_invoice_number: 1,
    default_terms: '',
    default_notes: '',
    company_address: '',
    company_email: '',
    company_phone: '',
    currency: 'USD'
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <InvoiceBuilder 
        workspaceId={workspaceId!}
        settings={settings}
        contacts={contacts}
        products={products}
        initialData={invoice}
      />
    </div>
  );
}
