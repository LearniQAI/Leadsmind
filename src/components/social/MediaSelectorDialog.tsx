'use client';

import React, { useState, useEffect } from 'react';
import {
  Folder,
  File,
  Image as ImageIcon,
  Video,
  Search,
  ChevronRight,
  Loader2,
  Library,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { getMediaFiles, searchMediaFiles } from '@/app/actions/media';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MediaSelectorDialogProps {
  onSelect: (url: string) => void;
}

export function MediaSelectorDialog({ onSelect }: MediaSelectorDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<{ id: string | null, name: string }[]>([{ id: null, name: 'Media Center' }]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<any>(null);

  const loadFiles = async (parentId: string | null = null) => {
    setLoading(true);
    try {
      const supabase = createClient();
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      // Get workspace ID (simplified for selector)
      const { data: workspaceData } = await supabase
        .from('workspaces')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (!workspaceData) return;

      const data = await getMediaFiles(workspaceData.id, parentId);
      setFiles(data);
    } catch (error) {
      toast.error('Failed to load media files');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadFiles(currentFolderId);
    }
  }, [isOpen, currentFolderId]);

  const handleSelect = () => {
    if (!selectedFile) return;

    const supabase = createClient();
    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(selectedFile.path);

    onSelect(publicUrl);
    setIsOpen(false);
    setSelectedFile(null);
  };

  const navigateToFolder = (folder: any) => {
    setCurrentFolderId(folder.id);
    setBreadcrumb([...breadcrumb, { id: folder.id, name: folder.name }]);
  };

  const navigateBack = (index: number) => {
    const newBreadcrumb = breadcrumb.slice(0, index + 1);
    setBreadcrumb(newBreadcrumb);
    setCurrentFolderId(newBreadcrumb[newBreadcrumb.length - 1].id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={
        <Button variant="ghost" className="h-10 px-4 rounded-xl text-white/40 hover:text-[#6c47ff] hover:bg-[#6c47ff]/10 transition-all gap-2">
          <Library className="h-4 w-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">Media Center</span>
        </Button>
      } />
      <DialogContent className="max-w-4xl h-[80vh] bg-[#030303] border-white/5 p-0 overflow-hidden rounded-[32px] flex flex-col shadow-2xl border border-white/10">
        <DialogHeader className="p-8 border-b border-white/5 bg-white/[0.01] shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-black text-white tracking-tighter italic flex items-center gap-3">
              <Library className="h-6 w-6 text-[#6c47ff]" />
              Select from Media Center
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="rounded-full hover:bg-white/5 text-white/20 hover:text-white">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="flex items-center gap-1 text-[10px] text-white/30 font-black uppercase tracking-[0.2em] mt-4">
            {breadcrumb.map((crumb, i) => (
              <div key={crumb.id || 'root'} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="h-3 w-3" />}
                <button
                  onClick={() => navigateBack(i)}
                  className={cn(
                    "hover:text-[#6c47ff] transition-colors",
                    i === breadcrumb.length - 1 ? "text-white" : ""
                  )}
                >
                  {crumb.name}
                </button>
              </div>
            ))}
          </nav>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="p-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-2xl bg-white/5" />
                ))
              ) : files.length === 0 ? (
                <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
                  <p className="text-white/20 font-bold uppercase tracking-widest text-xs">No assets found</p>
                </div>
              ) : (
                files.map((file) => (
                  <div
                    key={file.id}
                    onClick={() => {
                      if (file.type === 'folder') {
                        navigateToFolder(file);
                      } else if (file.mime_type?.startsWith('image/')) {
                        setSelectedFile(file);
                      }
                    }}
                    className={cn(
                      "group relative aspect-square rounded-2xl p-2 transition-all cursor-pointer border-2",
                      file.type === 'folder' ? "bg-white/[0.02] border-transparent hover:bg-white/[0.05]" :
                        selectedFile?.id === file.id ? "bg-[#6c47ff]/10 border-[#6c47ff]" :
                          "bg-white/[0.02] border-transparent hover:border-white/10"
                    )}
                  >
                    <div className="w-full h-full flex items-center justify-center rounded-xl overflow-hidden bg-black/40">
                      {file.type === 'folder' ? (
                        <Folder className="h-8 w-8 text-[#6c47ff]/40" />
                      ) : file.mime_type?.startsWith('image/') ? (
                        <img
                          src={createClient().storage.from('media').getPublicUrl(file.path).data.publicUrl}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-white/10" />
                      )}
                    </div>

                    <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                      <p className="text-[9px] font-black text-white/60 truncate uppercase tracking-widest">{file.name}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="p-8 bg-white/[0.01] border-t border-white/5 shrink-0">
          <Button variant="ghost" onClick={() => setIsOpen(false)} className="rounded-xl text-white/40 hover:text-white">Cancel</Button>
          <Button
            disabled={!selectedFile}
            onClick={handleSelect}
            className="bg-white text-black hover:bg-[#6c47ff] hover:text-white font-black uppercase tracking-[0.2em] text-[10px] px-8 h-12 rounded-xl"
          >
            Select Asset
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
