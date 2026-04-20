import { requireAuth, getCurrentWorkspaceId } from "@/lib/auth";
import { getInvoices } from "@/app/actions/finance";
import { 
  Plus, 
  Search, 
  Filter, 
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { InvoiceMasterDetail } from "@/components/invoices/InvoiceMasterDetail";

export const dynamic = 'force-dynamic';

export default async function InvoicesPage() {
  await requireAuth();
  const workspaceId = await getCurrentWorkspaceId();
  const invoices = await getInvoices(workspaceId!);

  return (
    <InvoiceMasterDetail invoices={invoices} />
  );
}
