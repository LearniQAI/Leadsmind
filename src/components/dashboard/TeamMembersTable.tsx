'use client';

import { useState } from 'react';
import { updateMemberRole, removeMember } from '@/app/actions/team';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { ChevronDown, Loader2, UserMinus } from 'lucide-react';
import { format } from 'date-fns';

interface Member {
  id: string;
  role: 'admin' | 'member' | 'client';
  joined_at: string;
  user_id: string;
  users: {
    first_name: string;
    last_name: string | null;
    email: string;
    avatar_url: string | null;
  };
}

interface TeamMembersTableProps {
  members: Member[];
  currentUserId: string;
}

export function TeamMembersTable({ members, currentUserId }: TeamMembersTableProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);

  async function handleRoleChange(memberId: string, newRole: 'admin' | 'member' | 'client') {
    setLoadingId(memberId);
    try {
      const result = await updateMemberRole(memberId, newRole);
      if (result.success) {
        toast.success(`Role updated to ${newRole}`);
      } else {
        toast.error(result.error || 'Failed to update role');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoadingId(null);
    }
  }

  async function handleRemoveConfirm() {
    if (!memberToRemove) return;
    
    setLoadingId(memberToRemove.id);
    try {
      const result = await removeMember(memberToRemove.id);
      if (result.success) {
        toast.success('Member removed from workspace');
      } else {
        toast.error(result.error || 'Failed to remove member');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoadingId(null);
      setMemberToRemove(null);
    }
  }

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.users.avatar_url || undefined} />
                      <AvatarFallback>
                        {member.users.first_name[0]}
                        {member.users.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">
                      {member.users.first_name} {member.users.last_name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {member.users.email}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={member.role === 'admin' ? 'default' : 'secondary'}
                    className="capitalize"
                  >
                    {member.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {format(new Date(member.joined_at), 'MMM d, yyyy')}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2 text-sm">
                    {member.user_id !== currentUserId ? (
                      <>
                        <DropdownMenu>
                          <DropdownMenuTrigger 
                            render={
                              <Button variant="ghost" size="sm" disabled={loadingId === member.id}>
                                {loadingId === member.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    Change Role
                                    <ChevronDown className="ml-2 h-4 w-4" />
                                  </>
                                )}
                              </Button>
                            }
                          />
                          <DropdownMenuContent align="end">
                            {member.role !== 'admin' && (
                              <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'admin')}>
                                Make Admin
                              </DropdownMenuItem>
                            )}
                            {member.role !== 'member' && (
                              <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'member')}>
                                Make Member
                              </DropdownMenuItem>
                            )}
                            {member.role !== 'client' && (
                              <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'client')}>
                                Make Client
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          disabled={loadingId === member.id}
                          onClick={() => setMemberToRemove(member)}
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground italic px-2">You</span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!memberToRemove} onOpenChange={(open) => !open && setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove team member?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove <strong>{memberToRemove?.users.first_name} {memberToRemove?.users.last_name}</strong> from the workspace. They will lose access immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRemoveConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
