"use client";

import { useState } from 'react';
import { X, Plus, Tag as TagIcon, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface TagManagerProps {
  entityId: string;
  entityType: 'contacts' | 'opportunities';
  initialTags: string[];
  workspaceId: string;
}

export function TagManager({ entityId, entityType, initialTags, workspaceId }: TagManagerProps) {
  const supabase = createClient();
  const [tags, setTags] = useState<string[]>(initialTags || []);
  const [newTag, setNewTag] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);

  // Industrial, uniform tag style
  const tagStyle = "bg-blue-500/5 text-blue-400/80 border-blue-500/10 hover:bg-blue-500/10 transition-all";

  const handleAddTag = async () => {
    if (!newTag.trim()) return;
    const tagName = newTag.trim();
    
    if (tags.includes(tagName)) {
      toast.error("Tag already exists");
      return;
    }

    setLoading(true);
    const updatedTags = [...tags, tagName];

    const { error } = await supabase
      .from(entityType)
      .update({ tags: updatedTags })
      .eq('id', entityId)
      .eq('workspace_id', workspaceId);

    if (error) {
      toast.error("Failed to add tag");
    } else {
      setTags(updatedTags);
      setNewTag('');
      setIsAdding(false);
    }
    setLoading(false);
  };

  const handleRemoveTag = async (tagName: string) => {
    setLoading(true);
    const updatedTags = tags.filter(t => t !== tagName);

    const { error } = await supabase
      .from(entityType)
      .update({ tags: updatedTags })
      .eq('id', entityId)
      .eq('workspace_id', workspaceId);

    if (error) {
      toast.error("Failed to remove tag");
    } else {
      setTags(updatedTags);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      {tags.map((tag) => (
        <Badge 
          key={tag} 
          variant="outline" 
          className={`flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${tagStyle}`}
        >
          {tag}
          <button 
            onClick={() => handleRemoveTag(tag)}
            disabled={loading}
            className="hover:text-white transition-colors"
          >
            <X size={10} />
          </button>
        </Badge>
      ))}

      {isAdding ? (
        <div className="flex items-center gap-1 animate-in fade-in zoom-in duration-200">
          <Input 
            autoFocus
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddTag();
              if (e.key === 'Escape') setIsAdding(false);
            }}
            placeholder="Tag name..."
            className="h-6 w-24 text-[10px] bg-white/5 border-white/10 px-2 rounded-md"
          />
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-white/40 hover:text-emerald-400"
            onClick={handleAddTag}
            disabled={loading}
          >
            {loading ? <Loader2 size={10} className="animate-spin" /> : <Plus size={10} />}
          </Button>
        </div>
      ) : (
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 px-2 text-[10px] font-bold text-white/20 hover:text-white/60 hover:bg-white/5 gap-1.5 rounded-md"
          onClick={() => setIsAdding(true)}
        >
          <Plus size={10} />
          ADD TAG
        </Button>
      )}
    </div>
  );
}
