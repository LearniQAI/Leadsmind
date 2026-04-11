'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Check, Loader2, Plus, ArrowRightLeft, Building2 } from 'lucide-react'
import { switchWorkspace, createNewWorkspace } from '@/app/actions/workspace'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'

interface WorkspaceWithRole {
  id: string
  name: string
  logoUrl: string | null
  role: 'admin' | 'member' | 'client'
}

interface WorkspaceListProps {
  workspaces: WorkspaceWithRole[]
  activeWorkspaceId: string | null
}

export function WorkspaceList({ workspaces, activeWorkspaceId }: WorkspaceListProps) {
  const [isPending, startTransition] = useTransition()
  const [isSwitching, setIsSwitching] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [newWorkspaceName, setNewWorkspaceName] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  async function handleSwitch(workspaceId: string) {
    if (workspaceId === activeWorkspaceId) return
    
    setIsSwitching(workspaceId)
    
    startTransition(async () => {
      try {
        const result = await switchWorkspace(workspaceId)
        
        // If the function returns (meaning it didn't redirect), check for errors
        if (result && 'success' in result && !result.success) {
          toast.error(result.error || 'Failed to switch workspace')
          setIsSwitching(null)
        }
      } catch (error: any) {
        // Next.js redirect() throws an error that startTransition handles.
        // We only reset isSwitching if it's NOT a redirect error.
        const isRedirectError = error?.digest?.startsWith('NEXT_REDIRECT') || 
                               error?.message === 'NEXT_REDIRECT';
        
        if (isRedirectError) {
          return
        }
        
        // Fail-safe for other errors
        console.error('Switch workspace error:', error)
        toast.error('An unexpected error occurred')
        setIsSwitching(null)
      }
    })
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newWorkspaceName.trim()) return

    try {
      setIsCreating(true)
      const result = await createNewWorkspace(newWorkspaceName)
      if (result.success) {
        toast.success('Workspace created successfully')
        setIsDialogOpen(false)
        setNewWorkspaceName('')
      } else {
        toast.error(result.error || 'Failed to create workspace')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          Your Workspaces
        </CardTitle>
        <CardDescription>
          Switch between your different organizations or create a new one.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          {workspaces.map((workspace) => {
            const isActive = workspace.id === activeWorkspaceId
            const switchingCurrent = isSwitching === workspace.id

            return (
              <div 
                key={workspace.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                  isActive 
                    ? 'border-primary/50 bg-primary/5' 
                    : 'border-border hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-border">
                    <AvatarImage src={workspace.logoUrl || ''} alt={workspace.name} />
                    <AvatarFallback className="bg-secondary text-secondary-foreground">
                      {workspace.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{workspace.name}</span>
                      <Badge variant={workspace.role === 'admin' ? 'default' : 'secondary'} className="text-[10px] h-4 px-1.5 leading-none">
                        {workspace.role}
                      </Badge>
                      {isActive && (
                        <div className="flex items-center gap-1 text-[10px] text-primary font-medium bg-primary/10 px-1.5 py-0.5 rounded-full">
                          <Check className="h-2.5 w-2.5" />
                          Active
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant={isActive ? "ghost" : "outline"}
                  disabled={isActive || switchingCurrent || isSwitching !== null}
                  onClick={() => handleSwitch(workspace.id)}
                  className="h-8"
                >
                  {switchingCurrent ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  ) : isActive ? (
                    null
                  ) : (
                    <ArrowRightLeft className="h-3 w-3 mr-1" />
                  )}
                  {isActive ? "Default" : "Switch"}
                </Button>
              </div>
            )
          })}
        </div>

        <Separator className="my-4" />

        <div className="flex justify-start">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary transition-colors pl-0">
                <Plus className="h-4 w-4 mr-1 text-primary" />
                Create a new workspace
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Workspace</DialogTitle>
                <DialogDescription>
                  Enter a name for your new organization. You&apos;ll be the administrator.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Workspace Name</Label>
                    <Input
                      id="name"
                      placeholder="Acme Inc."
                      value={newWorkspaceName}
                      onChange={(e) => setNewWorkspaceName(e.target.value)}
                      autoFocus
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={isCreating || !newWorkspaceName.trim()}
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Workspace'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}
