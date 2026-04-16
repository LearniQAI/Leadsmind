'use client';

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { deleteWorkflow } from "@/app/actions/automation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

interface DeleteAutomationItemProps {
  id: string;
}

export function DeleteAutomationItem({ id }: DeleteAutomationItemProps) {
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this automation? This cannot be undone.")) return;
    
    try {
      await deleteWorkflow(id);
      toast.success("Workflow deleted successfully");
    } catch (error) {
      toast.error("Failed to delete workflow");
    }
  };

  return (
    <DropdownMenuItem onClick={handleDelete} className="text-red-400 focus:text-red-400 focus:bg-red-400/10">
      <Trash2 className="mr-2 h-4 w-4" />
      Delete
    </DropdownMenuItem>
  );
}
