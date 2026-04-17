'use client';

import { useState } from 'react';
import { 
  Plus, 
  MoreVertical, 
  Trash2, 
  Pencil, 
  X, 
  Check, 
  Loader2,
  LayoutGrid
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { 
  addPipelineStage, 
  updatePipelineStage, 
  removePipelineStage 
} from '@/app/actions/pipelines';
import { PipelineStage } from '@/types/crm.types';

interface StageManagerProps {
  pipelineId: string;
  initialStages: PipelineStage[];
}

export function StageManager({ pipelineId, initialStages }: StageManagerProps) {
  const [stages, setStages] = useState(initialStages);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleAdd() {
    if (!newName.trim()) return;
    setIsLoading(true);
    try {
      const result = await addPipelineStage(pipelineId, newName);
      if (result.success && result.data) {
        setStages([...stages, result.data]);
        setNewName('');
        setIsAdding(false);
        toast.success('Stage added');
      } else {
        toast.error(result.error || 'Failed to add stage');
      }
    } catch (err) {
      toast.error('Error adding stage');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUpdate(id: string) {
    if (!editName.trim()) return;
    setIsLoading(true);
    try {
      const result = await updatePipelineStage(id, pipelineId, editName);
      if (result.success && result.data) {
        setStages(stages.map(s => s.id === id ? result.data! : s));
        setEditingId(null);
        toast.success('Stage updated');
      }
    } catch (err) {
      toast.error('Error updating stage');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure? This will affect deals in this stage.')) return;
    setIsLoading(true);
    try {
      const result = await removePipelineStage(id, pipelineId);
      if (result.success) {
        setStages(stages.filter(s => s.id !== id));
        toast.success('Stage removed');
      }
    } catch (err) {
      toast.error('Error removing stage');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <LayoutGrid className="w-5 h-5 text-primary" />
          Pipeline Flow
        </h2>
        {!isAdding && (
          <Button 
            onClick={() => setIsAdding(true)}
            className="bg-[#6c47ff] hover:bg-[#5b3ce0] text-white rounded-xl gap-2 font-bold px-4"
          >
            <Plus className="h-4 w-4" />
            <span>Add Stage</span>
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {isAdding && (
          <div className="flex items-center gap-2 p-4 rounded-2xl bg-primary/10 border border-primary/20 animate-in fade-in slide-in-from-top-2">
            <Input 
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="Enter stage name (e.g. Discovery)"
              className="bg-black/20 border-white/10 text-white"
            />
            <Button size="icon" onClick={handleAdd} disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsAdding(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {stages.map((stage, index) => (
          <div 
            key={stage.id} 
            className="flex items-center justify-between p-5 rounded-2xl bg-white/2 border border-white/5 hover:border-white/10 transition-all group"
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold text-white/20 group-hover:text-[#6c47ff] transition-colors">
                {index + 1}
              </div>
              
              {editingId === stage.id ? (
                <Input 
                  autoFocus
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleUpdate(stage.id)}
                  className="bg-black/20 border-white/10 text-white h-9 py-0"
                />
              ) : (
                <span className="text-base font-semibold text-white/80 group-hover:text-white transition-colors">
                  {stage.name}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {editingId === stage.id ? (
                <>
                  <Button size="sm" variant="ghost" onClick={() => handleUpdate(stage.id)} disabled={isLoading}>
                    <Check className="w-4 h-4 text-emerald-400" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                    <X className="w-4 h-4 text-rose-400" />
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-white/20 hover:text-white/60 text-xs gap-1"
                    onClick={() => {
                      setEditingId(stage.id);
                      setEditName(stage.name);
                    }}
                  >
                    <Pencil className="w-3 h-3" />
                    Edit
                  </Button>
                  <div className="h-4 w-px bg-white/5" />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-400/40 hover:text-red-400 text-xs gap-1"
                    onClick={() => handleDelete(stage.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                    Remove
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}

        {stages.length === 0 && !isAdding && (
          <div className="h-40 flex flex-col items-center justify-center text-center space-y-2 border-2 border-dashed border-white/5 rounded-2xl">
            <p className="text-sm text-white/20">No stages defined for this pipeline</p>
            <Button 
              variant="link" 
              className="text-[#6c47ff] font-bold"
              onClick={() => setIsAdding(true)}
            >
              Create first stage
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
