'use client';

import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { createProduct } from '@/app/actions/finance';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

interface ProductModalProps {
  workspaceId: string;
}

export function ProductModal({ workspaceId }: ProductModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const productData = {
      workspace_id: workspaceId,
      name: formData.get('name') as string,
      type: formData.get('type') as string,
      price: parseFloat(formData.get('price') as string),
      currency: 'USD',
      description: formData.get('description') as string,
    };

    try {
      await createProduct(productData);
      toast.success('Product created successfully');
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button size="icon" variant="ghost" className="h-8 w-8 text-white/30 hover:text-white bg-white/5 border border-white/10 rounded-lg">
          <Plus className="h-4 w-4" />
        </Button>
      } />
      <DialogContent className="bg-[#0b0b10] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Add New Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input 
              id="name" 
              name="name" 
              placeholder="e.g. 1-on-1 Coaching" 
              required 
              className="bg-white/5 border-white/10"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (USD)</Label>
              <Input 
                id="price" 
                name="price" 
                type="number" 
                step="0.01" 
                placeholder="49.99" 
                required 
                className="bg-white/5 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Product Type</Label>
              <Select name="type" defaultValue="service">
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a24] border-white/10 text-white">
                  <SelectItem value="course">Course</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="physical">Physical Product</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input 
              id="description" 
              name="description" 
              placeholder="Brief description of your product..." 
              className="bg-white/5 border-white/10"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setOpen(false)}
              className="text-white/50 hover:text-white"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-[#6c47ff] hover:bg-[#5b3ce0] text-white"
            >
              {loading ? 'Adding...' : 'Add Product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
