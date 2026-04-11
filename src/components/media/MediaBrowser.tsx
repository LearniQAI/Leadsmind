'use client';

import { useState, useEffect, useTransition } from 'react';
import { 
  Folder, 
  File, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  MoreVertical, 
  Plus, 
  Upload,
  Search,
  ChevronRight,
  Trash2,
  Download,
  Share2,
  FolderPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  getMediaFiles, 
  createFolder, 
  uploadFile, 
  deleteMediaFile, 
  getSignedUrl,
  searchMediaFiles
} from '@/app/actions/media';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { formatBytes } from '@/lib/utils';

interface MediaBrowserProps {
  workspaceId: string;
}

export function MediaBrowser({ workspaceId }: MediaBrowserProps) {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<{ id: string | null, name: string }[]>([{ id: null, name: 'Root' }]);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    loadFiles(currentFolderId);
  }, [currentFolderId, workspaceId]);

  async function loadFiles(parentId: string | null) {
    setLoading(true);
    try {
      const data = await getMediaFiles(workspaceId, parentId);
      setFiles(data);
    } catch (error) {
      toast.error('Failed to load media files');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateFolder() {
    if (!newFolderName.trim()) return;
    try {
      await createFolder(workspaceId, newFolderName, currentFolderId);
      toast.success('Folder created');
      setNewFolderName('');
      setIsCreateFolderOpen(false);
      loadFiles(currentFolderId);
    } catch (error) {
      toast.error('Failed to create folder');
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const toastId = toast.loading(`Uploading ${file.name}...`);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('workspaceId', workspaceId);
      if (currentFolderId) {
        formData.append('parentId', currentFolderId);
      }

      await uploadFile(formData);
      toast.success('File uploaded', { id: toastId });
      loadFiles(currentFolderId);
    } catch (error) {
      console.error('Upload Error:', error);
      toast.error('Upload failed', { id: toastId });
    }
  }

  async function handleDelete(file: any) {
    try {
      await deleteMediaFile(file.id, file.path, file.type);
      toast.success('Deleted successfully');
      loadFiles(currentFolderId);
    } catch (error) {
      toast.error('Failed to delete');
    }
  }

  async function handleDownload(file: any) {
    try {
      const url = await getSignedUrl(file.path);
      window.open(url, '_blank');
    } catch (error) {
      toast.error('Failed to get download link');
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      loadFiles(currentFolderId);
      return;
    }
    setLoading(true);
    try {
      const results = await searchMediaFiles(workspaceId, searchQuery);
      setFiles(results);
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
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

  const getFileIcon = (mimeType: string | null) => {
    if (!mimeType) return <File className="h-5 w-5 text-zinc-400" />;
    if (mimeType.startsWith('image/')) return <ImageIcon className="h-5 w-5 text-blue-400" />;
    if (mimeType.startsWith('video/')) return <Video className="h-5 w-5 text-purple-400" />;
    if (mimeType.includes('pdf')) return <FileText className="h-5 w-5 text-red-400" />;
    return <File className="h-5 w-5 text-zinc-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <form onSubmit={handleSearch} className="relative w-full sm:w-80 md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <Input 
            placeholder="Search files..." 
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 h-11"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
            <DialogTrigger render={
              <Button variant="outline" className="flex-1 sm:flex-none gap-2 bg-white/5 border-white/10 text-white hover:bg-white/10 h-11">
                <FolderPlus className="h-4 w-4" />
                <span className="hidden xs:inline">New Folder</span>
                <span className="xs:hidden">Folder</span>
              </Button>
            } />
            <DialogContent className="bg-[#0b0b10] border-white/5 text-white w-[90vw] max-w-md rounded-3xl">
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <Input 
                  placeholder="Folder name" 
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="ghost" onClick={() => setIsCreateFolderOpen(false)} className="rounded-xl">Cancel</Button>
                <Button onClick={handleCreateFolder} className="bg-[#6c47ff] hover:bg-[#5b3ce0] rounded-xl px-8">Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <label className="flex-1 sm:flex-none">
            <Button asChild className="w-full gap-2 bg-[#6c47ff] hover:bg-[#5b3ce0] text-white h-11 whitespace-nowrap">
              <span>
                <Upload className="h-4 w-4" />
                <span className="hidden xs:inline">Upload File</span>
                <span className="xs:hidden">Upload</span>
                <input type="file" className="hidden" onChange={handleFileUpload} />
              </span>
            </Button>
          </label>
        </div>
      </div>

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-white/50">
        {breadcrumb.map((crumb, i) => (
          <div key={crumb.id || 'root'} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-4 w-4" />}
            <button 
              onClick={() => navigateBack(i)}
              className={`hover:text-white transition-colors ${i === breadcrumb.length - 1 ? 'text-white font-medium' : ''}`}
            >
              {crumb.name}
            </button>
          </div>
        ))}
      </nav>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-28 sm:h-36 w-full rounded-2xl bg-white/5" />
              <Skeleton className="h-4 w-2/3 bg-white/5" />
            </div>
          ))
        ) : files.length === 0 ? (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
            <Folder className="h-12 w-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/30 text-sm">No files found here</p>
          </div>
        ) : (
          files.map((file) => (
            <div 
              key={file.id} 
              className="group relative bg-white/3 border border-white/5 rounded-2xl p-3 sm:p-4 transition-all hover:bg-white/5 hover:border-white/10 hover:shadow-xl hover:shadow-black/20"
            >
              <div className="aspect-square mb-3 sm:mb-4 flex items-center justify-center rounded-xl bg-black/40 overflow-hidden ring-1 ring-white/5">
                {file.type === 'folder' ? (
                  <Folder className="h-12 w-12 text-[#6c47ff]/60" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {getFileIcon(file.mime_type)}
                  </div>
                )}
              </div>
              
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p 
                    className={`text-sm font-medium text-white truncate ${file.type === 'folder' ? 'cursor-pointer hover:text-[#6c47ff]' : ''}`}
                    onClick={() => file.type === 'folder' && navigateToFolder(file)}
                  >
                    {file.name}
                  </p>
                  <p className="text-[10px] text-white/30">
                    {file.type === 'folder' ? 'Folder' : formatBytes(file.size || 0)}
                  </p>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger render={
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-white/30 hover:text-white">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  } />
                  <DropdownMenuContent align="end" className="bg-[#1a1a24] border-white/5 text-white">
                    {file.type === 'file' && (
                      <>
                        <DropdownMenuItem onClick={() => handleDownload(file)} className="gap-2">
                          <Download className="h-4 w-4" /> Download
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <Share2 className="h-4 w-4" /> Share link
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuItem 
                      onClick={() => handleDelete(file)} 
                      className="gap-2 text-red-400 focus:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
