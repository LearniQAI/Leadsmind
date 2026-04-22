"use client";

import { useEffect, useState } from "react";
import { 
  Plus, 
  Search, 
  Users, 
  MoreVertical, 
  Mail, 
  Phone,
  MessageSquare,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/components/providers/AuthProvider";
import { getRecentClients } from "@/app/actions/finance";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ClientsListPage() {
  const { workspace } = useAuth();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (workspace?.id) {
      getRecentClients(workspace.id, 50).then(data => {
        setClients(data);
        setLoading(false);
      });
    }
  }, [workspace?.id]);

  const filteredClients = clients.filter(c => 
    c.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-black text-white tracking-tight uppercase leading-none mb-2">Clients</h1>
           <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Manage your customer list</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl px-6 h-12 shadow-xl shadow-primary/20">
          <Plus className="w-4 h-4 mr-2" />
          Add Client
        </Button>
      </div>

      {/* Grid */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
          <Input 
            placeholder="Search clients..." 
            className="pl-12 bg-[#0b0b15] border-white/5 h-12 rounded-2xl text-white placeholder:text-white/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center text-white/20 italic font-medium">Loading customers...</div>
        ) : filteredClients.length === 0 ? (
          <div className="col-span-full py-24 text-center">
             <div className="flex flex-col items-center gap-4">
                <Users size={48} className="text-white/5" />
                <p className="text-white/40 font-medium">Your client list is empty.</p>
             </div>
          </div>
        ) : filteredClients.map((client) => (
          <Card key={client.id} className="bg-[#0b0b15] border-white/5 p-6 rounded-[2.5rem] hover:border-primary/20 transition-all duration-500 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-all" />
            
            <div className="flex items-start justify-between mb-6 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl font-black text-primary uppercase">
                {client.first_name?.[0]}{client.last_name?.[0]}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger render={
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-white/20 hover:text-white hover:bg-white/5">
                    <MoreVertical size={16} />
                  </Button>
                } />
                <DropdownMenuContent align="end" className="bg-[#1a1a24] border-white/10 text-white">
                   <DropdownMenuItem className="gap-2 cursor-pointer py-2.5">Edit Details</DropdownMenuItem>
                   <DropdownMenuItem className="gap-2 cursor-pointer py-2.5">View History</DropdownMenuItem>
                   <div className="h-px bg-white/5 my-1" />
                   <DropdownMenuItem className="gap-2 text-rose-500 cursor-pointer py-2.5">Remove</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-1 mb-6 relative z-10">
              <h3 className="text-lg font-black text-white group-hover:text-primary transition-colors">
                {client.first_name} {client.last_name}
              </h3>
              <p className="text-[11px] font-bold text-white/20 uppercase tracking-[0.1em]">{client.company_name || 'Individual'}</p>
            </div>

            <div className="space-y-3 mb-8 relative z-10">
              <div className="flex items-center gap-3 text-white/40 hover:text-white transition-colors">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                   <Mail size={14} />
                </div>
                <span className="text-xs truncate">{client.email}</span>
              </div>
              {client.phone && (
                <div className="flex items-center gap-3 text-white/40">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                    <Phone size={14} />
                  </div>
                  <span className="text-xs">{client.phone}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-white/5 relative z-10">
              <div className="flex flex-col">
                 <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Invoices</span>
                 <span className="text-sm font-black text-white">{client.total_invoices}</span>
              </div>
              <div className="flex gap-2">
                 <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl bg-primary/10 text-primary hover:bg-primary/20">
                    <MessageSquare size={16} />
                 </Button>
                 <Link href={`/invoice/invoices/new?clientId=${client.id}`}>
                   <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl bg-white/5 text-white/40 hover:text-white hover:bg-white/10">
                      <Plus size={16} />
                   </Button>
                 </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
