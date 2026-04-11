'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createWorkflow } from '@/app/actions/automation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Zap, Loader2, ArrowLeft } from 'lucide-react';

export default function NewAutomationPage() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from('profiles').select('workspace_id').eq('id', user?.id).single();
      
      if (!profile?.workspace_id) throw new Error('No workspace found');

      const workflow = await createWorkflow(profile.workspace_id, name);
      toast.success('Workflow created');
      router.push(`/automations/${workflow.id}/edit`);
    } catch (error) {
      toast.error('Failed to create workflow');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-up">
      <div className="w-full max-w-md bg-white/3 border border-white/5 p-8 rounded-[32px] space-y-6">
        <div className="flex flex-col items-center text-center">
          <div className="h-16 w-16 rounded-2xl bg-[#6c47ff]/10 flex items-center justify-center mb-4">
            <Zap className="h-8 w-8 text-[#6c47ff]" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">New Automation</h1>
          <p className="text-sm text-white/40 mt-1">What should we name your new workflow?</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70">Automation Name</label>
            <Input 
              placeholder="e.g. Lead Tag Sequence" 
              className="bg-white/5 border-white/10 text-white h-12 rounded-xl"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          
          <Button 
            onClick={handleCreate} 
            disabled={loading || !name.trim()}
            className="w-full h-12 bg-[#6c47ff] hover:bg-[#5b3ce0] text-white font-bold rounded-xl shadow-lg shadow-[#6c47ff]/20"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create Workflow'}
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={() => router.back()} 
            className="w-full text-white/30 hover:text-white"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
