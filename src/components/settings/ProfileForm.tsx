'use client'

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Camera, Loader2, Upload } from 'lucide-react'
import { profileSchema, type ProfileFormValues } from '@/lib/validations/account.schema'
import { updateProfile } from '@/app/actions/account'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

interface ProfileFormProps {
  user: {
    id: string
    email: string
    firstName: string
    lastName?: string
    avatarUrl?: string
  }
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(user.avatarUrl)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName || '',
      avatarUrl: user.avatarUrl || '',
    },
  })

  const { isSubmitting } = form.formState

  async function handleAvatarClick() {
    fileInputRef.current?.click()
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    // 1. Validate file type
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      toast.error('Only PNG and JPG images are accepted')
      return
    }

    try {
      setIsUploading(true)
      const supabase = createClient()

      // 2. Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const filePath = `${user.id}-${Math.random()}.${fileExt}`

      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true,
        })

      if (uploadError) {
        if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('bucket')) {
          toast.error('Storage not configured. Ask your admin to create an "avatars" bucket in Supabase Storage.')
        } else {
          toast.error(`Upload failed: ${uploadError.message}`)
        }
        return
      }

      // 3. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(data.path)

      // 4. Update state and form
      setAvatarPreview(publicUrl)
      form.setValue('avatarUrl', publicUrl)
      toast.success('Avatar uploaded successfully')
    } catch (error: any) {
      console.error('Error uploading avatar:', error)
      toast.error(error?.message || 'Failed to upload image. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  async function onSubmit(values: ProfileFormValues) {
    try {
      const result = await updateProfile(values)
      if (result.success) {
        toast.success('Profile updated')
      } else {
        toast.error(result.error || 'Something went wrong')
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
    }
  }

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Profile Settings</CardTitle>
        <CardDescription>
          Manage your personal information and how others see you on the platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
              <div className="relative group">
                <Avatar 
                  className="h-24 w-24 border-2 border-border cursor-pointer transition-opacity group-hover:opacity-80"
                  onClick={handleAvatarClick}
                >
                  <AvatarImage src={avatarPreview} alt={user.firstName} />
                  <AvatarFallback className="bg-muted text-muted-foreground text-2xl">
                    {user.firstName[0]}{user.lastName?.[0] || ''}
                  </AvatarFallback>
                </Avatar>
                <div 
                  className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer pointer-events-none"
                >
                  <Camera className="h-6 w-6 text-white" />
                </div>
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-full">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png,image/jpeg"
                  className="hidden"
                />
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-sm font-medium text-foreground">Profile Picture</p>
                <p className="text-xs text-muted-foreground">
                  PNG or JPG up to 5MB. Click the image to upload.
                </p>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAvatarClick}
                  disabled={isUploading}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Change photo
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                value={user.email} 
                readOnly 
                className="bg-muted text-muted-foreground cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground italic">
                Contact support to change your email
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isSubmitting || isUploading}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Profile'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
