'use client';

import { useState, useRef } from 'react';
import { 
  Type, 
  Image as ImageIcon, 
  Minus, 
  Box, 
  MousePointer2, 
  Trash2, 
  GripVertical,
  ChevronUp,
  ChevronDown,
  Plus,
  ArrowRight,
  Monitor,
  Smartphone,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export type EmailBlockType = 'text' | 'image' | 'button' | 'divider' | 'spacer';

export interface EmailBlock {
  id: string;
  type: EmailBlockType;
  content?: string;
  url?: string;
  alt?: string;
  height?: number;
  style?: {
    textAlign?: 'left' | 'center' | 'right';
    fontWeight?: 'normal' | 'bold';
    fontSize?: string;
    bg?: string;
    color?: string;
    padding?: string;
  };
}

interface MinimalistEmailBuilderProps {
  initialBlocks?: EmailBlock[];
  onChange?: (blocks: EmailBlock[]) => void;
  onSave?: (html: string, json: EmailBlock[]) => void;
}

const DEFAULT_BLOCKS: EmailBlock[] = [
  { id: '1', type: 'text', content: '<h1>Welcome to LeadsMind</h1>', style: { textAlign: 'center' } },
  { id: '2', type: 'spacer', height: 20 },
  { id: '3', type: 'text', content: '<p>This is your premium minimalist email template. Start dragging blocks to build your message.</p>', style: { textAlign: 'center' } },
];

export function MinimalistEmailBuilder({ initialBlocks, onChange, onSave }: MinimalistEmailBuilderProps) {
  const [blocks, setBlocks] = useState<EmailBlock[]>(initialBlocks?.length ? initialBlocks : DEFAULT_BLOCKS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isSaving, setIsSaving] = useState(false);

  const addBlock = (type: EmailBlockType) => {
    const newBlock: EmailBlock = {
      id: Math.random().toString(36).substring(7),
      type,
      content: type === 'text' ? '<p>Click to edit this text...</p>' : undefined,
      url: type === 'button' ? '#' : undefined,
      height: type === 'spacer' ? 20 : undefined,
      style: { textAlign: 'left', bg: '#6c47ff', color: '#ffffff' }
    };
    const newBlocks = [...blocks, newBlock];
    setBlocks(newBlocks);
    setSelectedId(newBlock.id);
    onChange?.(newBlocks);
  };

  const removeBlock = (id: string) => {
    const newBlocks = blocks.filter(b => b.id !== id);
    setBlocks(newBlocks);
    setSelectedId(null);
    onChange?.(newBlocks);
  };

  const moveBlock = (id: string, direction: 'up' | 'down') => {
    const index = blocks.findIndex(b => b.id === id);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === blocks.length - 1) return;

    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
    setBlocks(newBlocks);
    onChange?.(newBlocks);
  };

  const updateBlock = (id: string, updates: Partial<EmailBlock>) => {
    const newBlocks = blocks.map(b => b.id === id ? { ...b, ...updates } : b);
    setBlocks(newBlocks);
    onChange?.(newBlocks);
  };

  // Convert blocks to Email-friendly HTML
  const generateHtml = () => {
    const bodyHtml = blocks.map(block => {
      switch (block.type) {
        case 'text':
          return `<div style="text-align: ${block.style?.textAlign || 'left'}; color: #374151; font-family: sans-serif; line-height: 1.6;">${block.content}</div>`;
        case 'image':
          return `<img src="${block.url}" alt="${block.alt || ''}" style="max-width: 100%; height: auto; display: block; margin: 0 auto; border-radius: 8px;" />`;
        case 'button':
          return `<div style="text-align: ${block.style?.textAlign || 'center'}; padding: 20px 0;">
                    <a href="${block.url}" style="background-color: ${block.style?.bg || '#6c47ff'}; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-family: sans-serif; display: inline-block;">${block.content || 'Click Here'}</a>
                  </div>`;
        case 'divider':
          return `<hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />`;
        case 'spacer':
          return `<div style="height: ${block.height || 20}px;"></div>`;
        default:
          return '';
      }
    }).join('\n');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 40px 0; background-color: #f8fafc; font-family: sans-serif;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td align="center">
                <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                  <tr>
                    <td>${bodyHtml}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const html = generateHtml();
      await onSave?.(html, blocks);
      toast.success('Campaign design updated');
    } catch (err) {
      toast.error('Failed to save design');
    } finally {
      setIsSaving(false);
    }
  };

  const selectedBlock = blocks.find(b => b.id === selectedId);

  return (
    <div className="flex h-full flex-col bg-[#030303] overflow-hidden">
      {/* Top Toolbar */}
      <div className="flex h-14 items-center justify-between border-b border-white/5 bg-[#0b0b10] px-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex bg-white/5 rounded-lg p-1">
             <button 
               onClick={() => setViewMode('desktop')}
               className={cn("p-1.5 rounded-md transition-all", viewMode === 'desktop' ? "bg-white/10 text-white" : "text-white/20 hover:text-white/40")}
             >
               <Monitor size={14} />
             </button>
             <button 
               onClick={() => setViewMode('mobile')}
               className={cn("p-1.5 rounded-md transition-all", viewMode === 'mobile' ? "bg-white/10 text-white" : "text-white/20 hover:text-white/40")}
             >
               <Smartphone size={14} />
             </button>
          </div>
          <span className="text-[10px] uppercase font-black tracking-widest text-white/20">Canvas Mode</span>
        </div>

        <Button 
          size="sm" 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-white text-black hover:bg-white/90 rounded-lg h-9 font-bold px-6 text-xs gap-2"
        >
          {isSaving ? '...' : <Check size={14} />}
          Update Content
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Library */}
        <aside className="w-64 border-r border-white/5 bg-[#0b0b10] p-6 flex flex-col gap-6">
           <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-[#6c47ff]">Blocks</h4>
              <div className="grid grid-cols-2 gap-3">
                 {[
                   { type: 'text', icon: Type, label: 'Text' },
                   { type: 'image', icon: ImageIcon, label: 'Image' },
                   { type: 'button', icon: Box, label: 'Button' },
                   { type: 'divider', icon: Minus, label: 'Divider' },
                   { type: 'spacer', icon: Plus, label: 'Spacer' },
                 ].map((tool) => (
                   <button 
                     key={tool.type}
                     onClick={() => addBlock(tool.type as any)}
                     className="flex flex-col items-center justify-center p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all gap-2 group"
                   >
                     <tool.icon size={18} className="text-white/20 group-hover:text-white transition-colors" />
                     <span className="text-[10px] font-bold text-white/40 group-hover:text-white/60 tracking-tight">{tool.label}</span>
                   </button>
                 ))}
              </div>
           </div>

           <div className="mt-auto border-t border-white/5 pt-6">
              <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4">
                 <p className="text-[10px] text-blue-400 leading-relaxed font-medium">
                    <strong>Pro Tip:</strong> Click any block in the canvas to edit its properties and reorder.
                 </p>
              </div>
           </div>
        </aside>

        {/* Center Canvas */}
        <main className="flex-1 overflow-y-auto p-12 scrollbar-none bg-[#030303]">
           <div 
             className={cn(
               "mx-auto transition-all duration-500 min-h-[800px] bg-white rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)]",
               viewMode === 'mobile' ? "w-[375px]" : "w-[600px]"
             )}
           >
              <div className="p-10 space-y-4">
                 {blocks.map((block) => (
                   <div 
                     key={block.id}
                     onClick={() => setSelectedId(block.id)}
                     className={cn(
                       "relative group cursor-pointer rounded-xl transition-all",
                       selectedId === block.id ? "ring-2 ring-[#6c47ff] ring-offset-8 ring-offset-white p-2" : "hover:outline hover:outline-1 hover:outline-black/5"
                     )}
                   >
                      {/* Interaction Controls */}
                      {selectedId === block.id && (
                        <div className="absolute -left-12 top-0 flex flex-col gap-1">
                           <button onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'up'); }} className="p-1.5 bg-white border border-black/10 rounded-md shadow-sm hover:bg-slate-50"><ChevronUp size={14} /></button>
                           <button onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'down'); }} className="p-1.5 bg-white border border-black/10 rounded-md shadow-sm hover:bg-slate-50"><ChevronDown size={14} /></button>
                           <button onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }} className="p-1.5 bg-red-50 border border-red-100 text-red-500 rounded-md shadow-sm hover:bg-red-100 mt-2"><Trash2 size={14} /></button>
                        </div>
                      )}

                      {/* Content Renderers */}
                      {block.type === 'text' && (
                        <div 
                          className="prose prose-sm max-w-none text-slate-700 outline-none"
                          style={{ textAlign: block.style?.textAlign }}
                          contentEditable
                          dangerouslySetInnerHTML={{ __html: block.content || '' }}
                          onBlur={(e) => updateBlock(block.id, { content: e.currentTarget.innerHTML })}
                        />
                      )}

                      {block.type === 'image' && (
                        <div className="w-full aspect-video bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden">
                           {block.url ? (
                             <img src={block.url} alt={block.alt} className="w-full h-full object-cover" />
                           ) : (
                             <div className="flex flex-col items-center gap-2 text-slate-400">
                                <ImageIcon size={24} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Add Image URL</span>
                             </div>
                           )}
                        </div>
                      )}

                      {block.type === 'button' && (
                        <div className="py-4" style={{ textAlign: block.style?.textAlign }}>
                           <button 
                             className="px-8 py-3 rounded-full font-bold shadow-lg transition-transform active:scale-95"
                             style={{ backgroundColor: block.style?.bg, color: block.style?.color }}
                           >
                             {block.content || 'Action Button'}
                           </button>
                        </div>
                      )}

                      {block.type === 'divider' && <hr className="border-t border-slate-100 my-8" />}
                      
                      {block.type === 'spacer' && <div style={{ height: block.height }} />}
                   </div>
                 ))}
              </div>
           </div>
        </main>

        {/* Right Properties */}
        <aside className="w-80 border-l border-white/5 bg-[#0b0b10] flex flex-col overflow-y-auto scrollbar-none">
           {selectedBlock ? (
             <div className="p-8 space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between">
                   <h3 className="text-xs font-black uppercase tracking-widest text-white">Properties</h3>
                   <span className="text-xs text-white/20 font-mono">[{selectedBlock.type}]</span>
                </div>

                <div className="space-y-6">
                   {selectedBlock.type === 'button' && (
                     <>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Button Text</label>
                           <Input 
                             value={selectedBlock.content}
                             onChange={(e) => updateBlock(selectedBlock.id, { content: e.target.value })}
                             className="bg-white/5 border-white/10 h-10 rounded-lg text-sm"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Action Link (URL)</label>
                           <Input 
                             value={selectedBlock.url}
                             onChange={(e) => updateBlock(selectedBlock.id, { url: e.target.value })}
                             className="bg-white/5 border-white/10 h-10 rounded-lg text-sm"
                           />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Background</label>
                              <div className="flex gap-2">
                                 <input 
                                   type="color" 
                                   value={selectedBlock.style?.bg} 
                                   onChange={(e) => updateBlock(selectedBlock.id, { style: { ...selectedBlock.style, bg: e.target.value } })}
                                   className="w-full h-10 rounded bg-transparent border-none cursor-pointer"
                                 />
                              </div>
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Text Color</label>
                              <input 
                                type="color" 
                                value={selectedBlock.style?.color} 
                                onChange={(e) => updateBlock(selectedBlock.id, { style: { ...selectedBlock.style, color: e.target.value } })}
                                className="w-full h-10 rounded bg-transparent border-none cursor-pointer"
                              />
                           </div>
                        </div>
                     </>
                   )}

                   {selectedBlock.type === 'image' && (
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Image URL</label>
                        <Input 
                          value={selectedBlock.url}
                          onChange={(e) => updateBlock(selectedBlock.id, { url: e.target.value })}
                          placeholder="https://images.unsplash.com/..."
                          className="bg-white/5 border-white/10 h-10 rounded-lg text-sm"
                        />
                     </div>
                   )}

                   {selectedBlock.type === 'spacer' && (
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Height (px)</label>
                        <input 
                          type="range"
                          min="10"
                          max="200"
                          value={selectedBlock.height}
                          onChange={(e) => updateBlock(selectedBlock.id, { height: parseInt(e.target.value) })}
                          className="w-full accent-[#6c47ff]"
                        />
                        <div className="text-right text-[10px] text-white/30">{selectedBlock.height}px</div>
                     </div>
                   )}

                   {['text', 'button'].includes(selectedBlock.type) && (
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Alignment</label>
                        <div className="flex bg-white/5 rounded-lg p-1">
                           {(['left', 'center', 'right'] as const).map((align) => (
                             <button
                               key={align}
                               onClick={() => updateBlock(selectedBlock.id, { style: { ...selectedBlock.style, textAlign: align } })}
                               className={cn(
                                 "flex-1 py-1.5 text-[10px] uppercase font-black tracking-tighter rounded-md transition-all",
                                 selectedBlock.style?.textAlign === align ? "bg-white text-black" : "text-white/20 hover:text-white/40"
                               )}
                             >
                               {align}
                             </button>
                           ))}
                        </div>
                     </div>
                   )}
                </div>
             </div>
           ) : (
             <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <MousePointer2 className="h-10 w-10 text-white/5 mb-4" />
                <p className="text-xs text-white/20 font-medium">Select a block on the canvas to configure properties.</p>
             </div>
           )}
        </aside>
      </div>
    </div>
  );
}
