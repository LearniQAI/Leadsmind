'use client';

import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { createContact } from '@/app/actions/contacts';
import { toast } from 'sonner';

export function ImportContactsModal() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [stats, setStats] = useState<{ total: number; success: number; failed: number } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const processImport = async () => {
    if (!file) return;
    setImporting(true);
    setStats(null);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      // Simple CSV parsing (assuming First, Last, Email)
      // Skip header if it looks like one
      let startIndex = 0;
      if (lines[0].toLowerCase().includes('name') || lines[0].toLowerCase().includes('email')) {
        startIndex = 1;
      }

      let successCount = 0;
      let failCount = 0;

      for (let i = startIndex; i < lines.length; i++) {
        const parts = lines[i].split(',').map(p => p.trim());
        if (parts.length < 2) {
          failCount++;
          continue;
        }

        const firstName = parts[0];
        const lastName = parts[1] || 'Import';
        const email = parts[2] || undefined;

        const result = await createContact({
          firstName,
          lastName,
          email,
          source: 'CSV Import'
        });

        if (result.success) successCount++;
        else failCount++;
      }

      setStats({ total: lines.length - startIndex, success: successCount, failed: failCount });
      toast.success(`Import complete! ${successCount} added, ${failCount} failed.`);
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to parse file. Please ensure it is a valid CSV.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button variant="outline" className="border-white/5 bg-white/3 hover:bg-white/5 text-white/80 h-11 px-5 rounded-xl gap-2 font-semibold">
          <Upload className="h-4 w-4" />
          <span>Import CSV</span>
        </Button>
      } />
      <DialogContent className="bg-[#0b0b10] border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Import Contacts</DialogTitle>
          <DialogDescription className="text-white/40">
            Upload a CSV file with: <span className="text-white/60">FirstName, LastName, Email</span>
          </DialogDescription>
        </DialogHeader>

        <div className="py-8">
          {!stats ? (
            <div className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all ${file ? 'border-[#6c47ff]/50 bg-[#6c47ff]/5' : 'border-white/5 bg-white/3'}`}>
              <div className={`h-12 w-12 rounded-full flex items-center justify-center mb-4 ${file ? 'bg-[#6c47ff] text-white' : 'bg-white/5 text-white/20'}`}>
                {file ? <FileText className="h-6 w-6" /> : <Upload className="h-6 w-6" />}
              </div>
              <p className="text-sm font-bold text-white mb-1">
                {file ? file.name : 'Choose a CSV file'}
              </p>
              <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold">
                Max size: 5MB
              </p>
              <input 
                type="file" 
                accept=".csv" 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                onChange={handleFileChange}
                disabled={importing}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white/3 rounded-2xl p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{stats.success} Successfully Imported</p>
                  <p className="text-xs text-white/40 text-nowrap">These contacts are now in your workspace.</p>
                </div>
              </div>
              {stats.failed > 0 && (
                <div className="bg-white/3 rounded-2xl p-4 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center">
                    <AlertCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{stats.failed} Failed</p>
                    <p className="text-xs text-white/40">Usually due to duplicate emails or missing names.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {!stats ? (
             <>
               <Button 
                variant="ghost" 
                className="text-white/40 hover:text-white" 
                onClick={() => setOpen(false)}
                disabled={importing}
              >
                Cancel
              </Button>
              <Button 
                onClick={processImport} 
                disabled={!file || importing}
                className="bg-[#6c47ff] hover:bg-[#5b3ce0] text-white font-bold rounded-xl"
              >
                {importing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Importing...</> : 'Import Now'}
              </Button>
             </>
          ) : (
            <Button 
              className="w-full bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl"
              onClick={() => {
                setOpen(false);
                setFile(null);
                setStats(null);
              }}
            >
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
