'use client';

import { Form } from '@/types/forms.types';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { 
  MoreHorizontal, 
  ClipboardList, 
  ExternalLink,
  Code2,
  Trash2,
  FileText
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { toast } from 'sonner';

interface FormListProps {
  forms: Form[];
}

export function FormList({ forms }: FormListProps) {
  if (forms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-[#0b0b10] p-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 mb-6">
          <ClipboardList className="h-8 w-8 text-white/20" />
        </div>
        <h3 className="text-xl font-bold text-white">No forms yet</h3>
        <p className="text-white/50 max-w-xs mt-2">
          Create forms or surveys to start capturing leads and gathering data.
        </p>
        <div className="flex gap-4 mt-8">
          <Link href="/forms/new?type=form">
            <Button variant="outline" className="border-white/10 hover:bg-white/5">
              Create Form
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const copyEmbedCode = (id: string) => {
    const code = `<script src="${window.location.origin}/forms/embed.js" data-form-id="${id}"></script>`;
    navigator.clipboard.writeText(code);
    toast.success('Embed code copied to clipboard');
  };

  return (
    <div className="rounded-2xl border border-white/5 bg-[#0b0b10] overflow-hidden">
      <Table>
        <TableHeader className="bg-white/[0.02]">
          <TableRow className="hover:bg-transparent border-white/5">
            <TableHead className="text-white/40">Form Name</TableHead>
            <TableHead className="text-white/40">Type</TableHead>
            <TableHead className="text-white/40">Status</TableHead>
            <TableHead className="text-white/40">Submissions</TableHead>
            <TableHead className="text-white/40">Last Response</TableHead>
            <TableHead className="text-white/40">Created</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {forms.map((form) => {
            return (
              <TableRow key={form.id} className="hover:bg-white/[0.02] border-white/5 group">
                <TableCell className="font-semibold text-white">
                  {form.name}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize border-white/10 text-white/50">
                    {form.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  {form.status === 'published' ? (
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Published</Badge>
                  ) : (
                    <Badge className="bg-white/10 text-white/50 border-white/10">Draft</Badge>
                  )}
                </TableCell>
                <TableCell className="text-white/70">
                  <div className="flex items-center gap-2">
                    <FileText className="h-3 w-3 text-white/20" />
                    {form.submission_count.toLocaleString()}
                  </div>
                </TableCell>
                <TableCell className="text-white/50 text-xs">
                  {form.updated_at ? format(new Date(form.updated_at), 'MMM d, HH:mm') : '-'}
                </TableCell>
                <TableCell className="text-white/30 text-xs">
                  {format(new Date(form.created_at), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger render={
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-white/30 hover:text-white">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    } />
                    <DropdownMenuContent align="end" className="w-56 bg-[#1a1a24] border-white/10 text-white">
                      <DropdownMenuItem className="gap-2 cursor-pointer" render={
                        <Link href={`/forms/${form.id}/builder`}>
                          <ClipboardList className="h-4 w-4" /> Edit Builder
                        </Link>
                      } />
                      <DropdownMenuItem className="gap-2 cursor-pointer" render={
                        <Link href={`/forms/${form.id}/submissions`}>
                          <FileText className="h-4 w-4" /> View Submissions
                        </Link>
                      } />
                      <DropdownMenuItem 
                        className="gap-2 cursor-pointer"
                        onClick={() => copyEmbedCode(form.id)}
                      >
                        <Code2 className="h-4 w-4" /> Copy Embed Code
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 cursor-pointer" render={
                        <a href={`/f/${form.id}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" /> View Live Form
                        </a>
                      } />
                      <DropdownMenuItem className="gap-2 cursor-pointer text-red-400 focus:text-red-400">
                        <Trash2 className="h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
