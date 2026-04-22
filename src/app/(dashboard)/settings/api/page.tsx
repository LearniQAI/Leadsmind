'use client';

import { 
  Code2, 
  Plus, 
  MoreHorizontal, 
  Key, 
  Globe, 
  Webhook, 
  ShieldCheck,
  Copy,
  Trash2,
  ToggleLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function ApiSettingsPage() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Developer Settings</h1>
          <p className="text-white/50 text-sm mt-1">Manage your API keys and webhook integrations.</p>
        </div>
      </div>

      <Tabs defaultValue="api" className="space-y-6">
        <TabsList className="bg-[#0b0b10] border border-white/5 p-1 rounded-xl h-auto">
          <TabsTrigger value="api" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/40 px-6 py-2.5 text-xs font-bold uppercase tracking-widest">API Keys</TabsTrigger>
          <TabsTrigger value="webhooks" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/40 px-6 py-2.5 text-xs font-bold uppercase tracking-widest">Webhooks</TabsTrigger>
          <TabsTrigger value="usage" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/40 px-6 py-2.5 text-xs font-bold uppercase tracking-widest">Usage Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="api" className="space-y-6 focus-visible:outline-none">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Active API Keys</h3>
            <Button className="bg-[#6c47ff] hover:bg-[#8b5cf6] text-white gap-2">
              <Plus className="h-4 w-4" /> Create Key
            </Button>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#0b0b10] overflow-hidden">
            <Table>
              <TableHeader className="bg-white/[0.02]">
                <TableRow className="border-white/5">
                  <TableHead className="text-white/40">Key Name</TableHead>
                  <TableHead className="text-white/40">Key Prefix</TableHead>
                  <TableHead className="text-white/40">Scopes</TableHead>
                  <TableHead className="text-white/40">Last Used</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="border-white/5 hover:bg-white/[0.02]">
                  <TableCell className="font-bold text-white">Zapier Production</TableCell>
                  <TableCell className="font-mono text-xs text-white/50">pk_live_8f3d...</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-[10px] bg-emerald-500/5 text-emerald-500 border-emerald-500/20">read:contacts</Badge>
                      <Badge variant="outline" className="text-[10px] bg-[#6c47ff]/5 text-[#6c47ff] border-[#6c47ff]/20">write:contacts</Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-white/30 text-xs">2 hours ago</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="text-white/20 hover:text-white">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-6 focus-visible:outline-none">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Webhook Endpoints</h3>
            <Button className="bg-[#6c47ff] hover:bg-[#8b5cf6] text-white gap-2">
              <Plus className="h-4 w-4" /> Add Endpoint
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
             <div className="p-6 rounded-2xl bg-[#0b0b10] border border-white/5 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                   <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <Webhook className="h-6 w-6 text-emerald-500" />
                   </div>
                   <div>
                      <div className="flex items-center gap-3">
                         <h4 className="font-bold text-white text-sm">Main CRM Webhook</h4>
                         <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[10px] uppercase">Active</Badge>
                      </div>
                      <p className="text-xs text-white/30 mt-1 font-mono">https://api.external.app/v1/webhook</p>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="text-right">
                      <div className="text-[11px] font-bold text-white/50">8 Events</div>
                      <div className="text-[10px] text-white/20 mt-1">Success rate: 99.8%</div>
                   </div>
                   <Button variant="ghost" size="icon" className="text-white/20 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="h-4 w-4" />
                   </Button>
                </div>
             </div>
          </div>
        </TabsContent>

        <TabsContent value="usage" className="focus-visible:outline-none">
           <div className="rounded-2xl border border-white/5 bg-[#0b0b10] p-20 flex flex-col items-center justify-center text-center">
              <Code2 className="h-12 w-12 text-white/10 mb-4" />
              <h3 className="text-white font-bold">No API logs yet</h3>
              <p className="text-white/30 text-sm mt-1">When you start making requests to our public API, logs will appear here.</p>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
