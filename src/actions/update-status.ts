'use server'

import { supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function updateShipmentStatus(id: string, status: string) {
  const { error } = await supabase
    .from('shipments')
    .update({ status })
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard')
  return { success: true }
}
