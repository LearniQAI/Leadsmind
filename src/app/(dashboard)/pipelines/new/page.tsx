'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { createPipeline } from '@/app/actions/pipelines';

const DEFAULT_STAGES = ['Lead', 'Contacted', 'Proposal', 'Closing'];

export default function NewPipelinePage() {
  const router = useRouter();
  const [name, setName] = useState('Sales Pipeline');
  const [stages, setStages] = useState(DEFAULT_STAGES);
  const [newStage, setNewStage] = useState('');
  const [isPending, setIsPending] = useState(false);

  const addStage = () => {
    if (newStage.trim()) {
      setStages(prev => [...prev, newStage.trim()]);
      setNewStage('');
    }
  };

  const removeStage = (i: number) => {
    setStages(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Pipeline name is required');
    if (stages.length === 0) return toast.error('Add at least one stage');
    setIsPending(true);
    try {
      const res = await createPipeline({ name, stages });
      if (res.success) {
        toast.success('Pipeline created!');
        router.push('/pipelines');
        router.refresh();
      } else {
        toast.error(res.error || 'Failed to create pipeline');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <button onClick={() => router.back()} className="flex items-center gap-2 text-white/40 hover:text-white text-sm mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1">Create Pipeline</h1>
        <p className="text-sm text-white/40 font-medium">Configure your sales stages to track deals end-to-end</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#0b0b10] border border-white/5 rounded-3xl p-8 space-y-8 shadow-2xl">
        <div className="space-y-2">
          <Label className="text-white/60">Pipeline Name</Label>
          <Input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Sales Pipeline"
            className="bg-white/[0.03] border-white/10 text-white h-12 rounded-xl focus-visible:ring-[#6c47ff]/50 focus-visible:border-[#6c47ff]/50"
          />
        </div>

        <div className="space-y-4">
          <Label className="text-white/60">Stages (in order)</Label>
          <div className="space-y-2">
            {stages.map((stage, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 group">
                <div className="h-6 w-6 rounded-lg bg-[#6c47ff]/20 text-[#6c47ff] text-xs font-black flex items-center justify-center">{i + 1}</div>
                <span className="flex-1 text-sm font-semibold text-white">{stage}</span>
                <button
                  type="button"
                  onClick={() => removeStage(i)}
                  className="text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newStage}
              onChange={e => setNewStage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addStage())}
              placeholder="Add a new stage..."
              className="bg-white/[0.03] border-white/10 text-white h-11 rounded-xl focus-visible:ring-[#6c47ff]/50"
            />
            <Button type="button" onClick={addStage} variant="outline" className="h-11 px-4 border-white/10 bg-white/5 text-white hover:bg-white/10 rounded-xl">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4 pt-2">
          <Button type="button" variant="ghost" onClick={() => router.back()} className="text-white/40 hover:text-white h-12 px-6 rounded-xl font-bold" disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending} className="bg-[#6c47ff] hover:bg-[#5b3ce0] text-white h-12 px-8 rounded-xl font-bold shadow-lg shadow-[#6c47ff]/20 flex-1">
            {isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Creating...</> : 'Create Pipeline'}
          </Button>
        </div>
      </form>
    </div>
  );
}
