'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { profileSchema, passwordSchema, type ProfileFormValues, type PasswordFormValues } from '@/lib/validations/account.schema'
import { getUser } from '@/lib/auth'

export async function updateProfile(values: ProfileFormValues) {
  const user = await getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Validate input
  const validated = profileSchema.safeParse(values)
  if (!validated.success) {
    return { success: false, error: 'Invalid input' }
  }

  const supabase = await createServerClient()
  const { error } = await supabase
    .from('users')
    .update({
      first_name: validated.data.firstName,
      last_name: validated.data.lastName,
      avatar_url: validated.data.avatarUrl,
    })
    .eq('id', user.id)

  if (error) {
    console.error('Update profile error:', error.message)
    return { success: false, error: 'Something went wrong. Please try again.' }
  }

  revalidatePath('/settings/account')
  revalidatePath('/', 'layout') // For sidebar avatar update
  return { success: true }
}

export async function updatePassword(values: PasswordFormValues) {
  const user = await getUser()
  if (!user || !user.email) {
    return { success: false, error: 'Not authenticated' }
  }

  // Validate input
  const validated = passwordSchema.safeParse(values)
  if (!validated.success) {
    return { success: false, error: 'Invalid input' }
  }

  const supabase = await createServerClient()

  // 1. Verify current password by attempting to sign in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: validated.data.currentPassword,
  })

  if (signInError) {
    return { success: false, error: 'Current password is incorrect' }
  }

  // 2. Update password
  const { error: updateError } = await supabase.auth.updateUser({
    password: validated.data.newPassword,
  })

  if (updateError) {
    console.error('Update password error:', updateError.message)
    return { success: false, error: 'Failed to update password' }
  }

  return { success: true }
}
