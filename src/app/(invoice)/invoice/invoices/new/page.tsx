"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { InvoiceForm } from "@/components/billing/InvoiceForm";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CreateInvoicePage() {
  const { workspace } = useAuth();

  if (!workspace?.id) return null;

  return (
    <div className="space-y-10 animate-in slide-in-from-bottom duration-700">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/invoice/invoices">
            <Button variant="ghost" className="p-0 h-auto text-white/40 hover:text-white mb-4 -ml-1">
              <ChevronLeft size={16} /> Back to list
            </Button>
          </Link>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase leading-none">New Invoice</h1>
        </div>
      </div>

      <InvoiceForm workspaceId={workspace.id} />
    </div>
  );
}
