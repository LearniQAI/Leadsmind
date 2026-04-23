import { fetchFormById, fetchSubmissions } from '@/app/actions/forms';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronLeft, Download, Filter, Search, MoreHorizontal, User } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { format } from 'date-fns';

export default async function FormSubmissionsPage({
  params
}: {
  params: { id: string }
}) {
  const [form, submissions] = await Promise.all([
    fetchFormById(params.id),
    fetchSubmissions(params.id)
  ]);

  if (!form) {
    redirect('/forms');
  }

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/forms">
            <Button variant="ghost" size="icon" className="text-white/50 hover:text-white bg-white/5 rounded-xl">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">{form.name}</h1>
            <p className="text-white/50 text-sm mt-1">View and export form submissions.</p>
          </div>
        </div>
        <Button variant="outline" className="border-white/10 bg-white/5 text-white/70 hover:bg-white/10 rounded-xl gap-2 font-bold">
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <input 
            placeholder="Search submissions..." 
            className="w-full h-11 bg-[#0b0b10] border border-white/5 rounded-xl pl-10 text-sm text-white focus:outline-none focus:border-[#6c47ff]/50 transition-all"
          />
        </div>
        <Button variant="ghost" className="text-white/40"><Filter className="h-4 w-4 mr-2" /> Filter</Button>
      </div>

      <div className="rounded-2xl border border-white/5 bg-[#0b0b10] overflow-hidden">
        <Table>
          <TableHeader className="bg-white/[0.02]">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-white/40">Contact</TableHead>
              {form.fields.slice(0, 3).map((field: any) => (
                <TableHead key={field.id} className="text-white/40">{field.label}</TableHead>
              ))}
              <TableHead className="text-white/40">Date</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={form.fields.length + 3} className="h-32 text-center text-white/20">
                  No submissions yet.
                </TableCell>
              </TableRow>
            ) : (
              submissions.map((submission) => (
                <TableRow key={submission.id} className="border-white/5 hover:bg-white/[0.02] group">
                  <TableCell>
                    {submission.contacts ? (
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-[#6c47ff]/10 flex items-center justify-center text-[10px] font-bold text-[#6c47ff]">
                          {submission.contacts.first_name?.[0] || submission.contacts.email?.[0]}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-white leading-none mb-1">{submission.contacts.first_name} {submission.contacts.last_name}</span>
                          <span className="text-[10px] text-white/30">{submission.contacts.email}</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-white/20 italic">Anonymous</span>
                    )}
                  </TableCell>
                  {form.fields.slice(0, 3).map((field: any) => (
                    <TableCell key={field.id} className="text-white/70 max-w-[200px] truncate">
                      {submission.data[field.id] || '-'}
                    </TableCell>
                  ))}
                  <TableCell className="text-white/30 text-[10px] font-medium uppercase">
                    {format(new Date(submission.submitted_at), 'MMM d, HH:mm')}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="text-white/20 hover:text-white">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
