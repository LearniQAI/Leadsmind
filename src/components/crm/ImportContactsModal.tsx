'use client';

import { useState, useRef } from 'react';
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
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowRight, 
  ArrowLeft,
  Settings2,
  Table as TableIcon,
  Search,
  Tag as TagIcon
} from 'lucide-react';
import { bulkImportContacts } from '@/app/actions/contacts';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

type Step = 'upload' | 'mapping' | 'options' | 'results';

const CRM_FIELDS = [
  { value: 'first_name', label: 'First Name (Required)' },
  { value: 'last_name', label: 'Last Name' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'source', label: 'Source' },
];

export function ImportContactsModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [duplicateHandler, setDuplicateHandler] = useState<'skip' | 'update' | 'create'>('skip');
  const [importTags, setImportTags] = useState<string>('');
  const [importing, setImporting] = useState(false);
  const [stats, setStats] = useState<{ success: number; skipped: number; updated: number; failed: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      const text = await selectedFile.text();
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length === 0) {
        toast.error("File is empty");
        return;
      }

      const rawHeaders = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
      setHeaders(rawHeaders);
      
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
        const obj: any = {};
        rawHeaders.forEach((h, i) => {
          obj[h] = values[i];
        });
        return obj;
      });

      setCsvData(data);

      // Auto-mapping logic
      const initialMapping: Record<string, string> = {};
      rawHeaders.forEach(h => {
        const lowerH = h.toLowerCase();
        if (lowerH.includes('first') || lowerH === 'name') initialMapping[h] = 'first_name';
        else if (lowerH.includes('last')) initialMapping[h] = 'last_name';
        else if (lowerH.includes('email')) initialMapping[h] = 'email';
        else if (lowerH.includes('phone') || lowerH.includes('tel')) initialMapping[h] = 'phone';
        else if (lowerH.includes('source')) initialMapping[h] = 'source';
      });
      setMapping(initialMapping);
      setStep('mapping');
    }
  };

  const startImport = async () => {
    setImporting(true);
    try {
      const tags = importTags.split(',').map(t => t.trim()).filter(Boolean);
      const result = await bulkImportContacts({
        contacts: csvData,
        mapping,
        options: {
          duplicateHandler,
          tags
        }
      });

      if (result.success) {
        setStats(result.stats);
        setStep('results');
        toast.success("Import processed successfully");
      } else {
        toast.error("Import failed");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setImporting(false);
    }
  };

  const reset = () => {
    setFile(null);
    setCsvData([]);
    setHeaders([]);
    setMapping({});
    setStep('upload');
    setStats(null);
    setImportTags('');
    setDuplicateHandler('skip');
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val);
      if (!val) setTimeout(reset, 300);
    }}>
      <DialogTrigger 
        render={
          <Button variant="outline" className="border-white/5 bg-white/3 hover:bg-white/5 text-white/80 h-11 px-5 rounded-xl gap-2 font-semibold">
            <Upload className="h-4 w-4" />
            <span>Import CSV</span>
          </Button>
        }
      />
      <DialogContent className="bg-[#0b0b10] border-white/10 text-white max-w-2xl overflow-hidden p-0 gap-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-black uppercase italic flex items-center gap-2">
            <Upload className="h-6 w-6 text-blue-500" />
            Contact Import
          </DialogTitle>
          <DialogDescription className="text-white/40">
            {step === 'upload' && "Upload your spreadsheet to begin."}
            {step === 'mapping' && "Map your CSV columns to LeadsMind fields."}
            {step === 'options' && "Configure import settings and tags."}
            {step === 'results' && "Your import is complete."}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="px-6 pb-6">
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-blue-600 transition-all duration-500" 
                    style={{ width: step === 'upload' ? '25%' : step === 'mapping' ? '50%' : step === 'options' ? '75%' : '100%' }}
                />
            </div>
        </div>

        <div className="p-6 pt-0 max-h-[60vh] overflow-y-auto">
          {step === 'upload' && (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/5 bg-white/3 rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group"
            >
              <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500">
                <FileText className="h-8 w-8 text-white/20 group-hover:text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2">Select CSV File</h3>
              <p className="text-sm text-white/30 text-center max-w-[280px]">
                Drag and drop your file here or click to browse. Supports CSV and XLSX up to 50k rows.
              </p>
              <input 
                ref={fileInputRef}
                type="file" 
                accept=".csv" 
                className="hidden" 
                onChange={handleFileChange}
              />
            </div>
          )}

          {step === 'mapping' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 pb-2 border-b border-white/5 px-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/20">CSV Column</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/20">LeadsMind Field</span>
              </div>
              {headers.map(header => (
                <div key={header} className="grid grid-cols-2 gap-4 items-center bg-white/3 p-3 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                  <div className="flex items-center gap-3">
                    <TableIcon className="h-4 w-4 text-white/10" />
                    <span className="text-sm font-bold truncate">{header}</span>
                  </div>
                  <Select 
                    value={mapping[header] || 'none'} 
                    onValueChange={(val) => setMapping(prev => ({ ...prev, [header]: val === 'none' ? '' : val }))}
                  >
                    <SelectTrigger className="bg-[#08080f] border-white/5 h-9 rounded-lg">
                      <SelectValue placeholder="Select field..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0b0b10] border-white/10">
                      <SelectItem value="none">Ignore Column</SelectItem>
                      {CRM_FIELDS.map(f => (
                        <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          )}

          {step === 'options' && (
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Settings2 className="h-4 w-4 text-blue-500" />
                    <h4 className="text-sm font-black uppercase tracking-widest italic">Duplicate Handling</h4>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { id: 'skip', label: 'Skip', desc: 'Do not import' },
                        { id: 'update', label: 'Update', desc: 'Overwrite data' },
                        { id: 'create', label: 'Create New', desc: 'Allow duplicates' }
                    ].map(opt => (
                        <button
                            key={opt.id}
                            onClick={() => setDuplicateHandler(opt.id as any)}
                            className={`p-4 rounded-2xl border text-left transition-all ${duplicateHandler === opt.id ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' : 'bg-white/3 border-white/5 text-white/40 hover:border-white/10'}`}
                        >
                            <p className="text-xs font-black uppercase tracking-widest mb-1">{opt.label}</p>
                            <p className="text-[10px] opacity-60 leading-tight">{opt.desc}</p>
                        </button>
                    ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <TagIcon className="h-4 w-4 text-purple-500" />
                    <h4 className="text-sm font-black uppercase tracking-widest italic">Apply Tags</h4>
                </div>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none transition-colors group-focus-within:text-purple-500/50">
                        <Search className="h-4 w-4 text-white/10" />
                    </div>
                    <Input 
                        value={importTags}
                        onChange={(e) => setImportTags(e.target.value)}
                        placeholder="e.g. jan-2024-import, facebook-leads" 
                        className="pl-11 h-12 bg-white/3 border-white/5 text-white placeholder:text-white/10 rounded-xl focus:border-purple-500/30 transition-all"
                    />
                </div>
                <p className="text-[10px] text-white/20 uppercase font-bold tracking-tight">Separate tags with commas</p>
              </div>
            </div>
          )}

          {step === 'results' && stats && (
            <div className="py-8 space-y-6">
                <div className="flex flex-col items-center justify-center mb-8">
                    <div className="h-20 w-20 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mb-4">
                        <CheckCircle2 className="h-10 w-10" />
                    </div>
                    <h3 className="text-2xl font-black uppercase italic">Import Complete</h3>
                    <p className="text-white/40 text-sm font-medium">We've processed {csvData.length} records.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/3 border border-white/5 rounded-2xl p-5 flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-green-500/20 text-green-500 flex items-center justify-center font-black text-lg">
                            {stats.success}
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Imported</p>
                            <p className="text-xs font-bold text-white">Successfully created</p>
                        </div>
                    </div>
                    <div className="bg-white/3 border border-white/5 rounded-2xl p-5 flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-blue-500/20 text-blue-500 flex items-center justify-center font-black text-lg">
                            {stats.updated}
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Updated</p>
                            <p className="text-xs font-bold text-white">Existing refreshed</p>
                        </div>
                    </div>
                    <div className="bg-white/3 border border-white/5 rounded-2xl p-5 flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-white/5 text-white/20 flex items-center justify-center font-black text-lg">
                            {stats.skipped}
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Skipped</p>
                            <p className="text-xs font-bold text-white">Duplicates ignored</p>
                        </div>
                    </div>
                    <div className="bg-white/3 border border-white/5 rounded-2xl p-5 flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-red-500/20 text-red-500 flex items-center justify-center font-black text-lg">
                            {stats.failed}
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Failed</p>
                            <p className="text-xs font-bold text-white">Validation errors</p>
                        </div>
                    </div>
                </div>
            </div>
          )}
        </div>

        <DialogFooter className="p-6 border-t border-white/5 flex items-center justify-between gap-4">
            {step === 'upload' && (
                <Button variant="ghost" className="text-white/20 hover:text-white" onClick={() => setOpen(false)}>Cancel</Button>
            )}
            
            {step === 'mapping' && (
                <>
                    <Button variant="ghost" className="text-white/20 hover:text-white gap-2 font-bold" onClick={() => setStep('upload')}>
                        <ArrowLeft className="h-4 w-4" /> Back
                    </Button>
                    <Button 
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold px-8 gap-2 h-12 shadow-lg shadow-blue-600/20"
                        disabled={!Object.values(mapping).includes('first_name')}
                        onClick={() => setStep('options')}
                    >
                        Review Options <ArrowRight className="h-4 w-4" />
                    </Button>
                </>
            )}

            {step === 'options' && (
                <>
                    <Button variant="ghost" className="text-white/20 hover:text-white gap-2 font-bold" onClick={() => setStep('mapping')}>
                        <ArrowLeft className="h-4 w-4" /> Back
                    </Button>
                    <Button 
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold px-8 gap-2 h-12 shadow-lg shadow-blue-600/20"
                        disabled={importing}
                        onClick={startImport}
                    >
                        {importing ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</> : <><CheckCircle2 className="h-4 w-4" /> Start Import</>}
                    </Button>
                </>
            )}

            {step === 'results' && (
                <Button 
                    className="w-full bg-white/5 hover:bg-white/10 text-white rounded-xl font-black uppercase tracking-widest h-12 transition-all"
                    onClick={() => setOpen(false)}
                >
                    Done
                </Button>
            )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
