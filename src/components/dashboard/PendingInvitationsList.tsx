'use client';

import { useState } from 'react';
import { resendInvitation, cancelInvitation } from '@/app/actions/team';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, RotateCcw, XCircle } from 'lucide-react';
import { format } from 'date-fns';

interface Invitation {
  id: string;
  email: string;
  role: string;
  created_at: string;
  expires_at: string;
}

interface PendingInvitationsListProps {
  invitations: Invitation[];
}

export function PendingInvitationsList({ invitations }: PendingInvitationsListProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleResend(id: string) {
    setLoadingId(id);
    try {
      const result = await resendInvitation(id);
      if (result.success) {
        toast.success('Invitation resent');
      } else {
        toast.error(result.error || 'Failed to resend');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoadingId(null);
    }
  }

  async function handleCancel(id: string) {
    if (!confirm('Are you sure you want to cancel this invitation?')) return;
    
    setLoadingId(id);
    try {
      const result = await cancelInvitation(id);
      if (result.success) {
        toast.success('Invitation cancelled');
      } else {
        toast.error(result.error || 'Failed to cancel');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoadingId(null);
    }
  }

  if (invitations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg bg-muted/30">
        <p className="text-muted-foreground text-sm">No pending invitations</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Sent</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invitations.map((invite) => (
            <TableRow key={invite.id}>
              <TableCell className="font-medium">{invite.email}</TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {invite.role}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {format(new Date(invite.created_at), 'MMM d, yyyy')}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={loadingId === invite.id}
                    onClick={() => handleResend(invite.id)}
                  >
                    {loadingId === invite.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Resend
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    disabled={loadingId === invite.id}
                    onClick={() => handleCancel(invite.id)}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
