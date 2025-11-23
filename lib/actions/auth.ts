'use server'

import { redirect } from 'next/navigation'
import { createSession, deleteSession, verifyPassword } from '@/lib/auth'

export async function login(formData: FormData) {
  const password = formData.get('password') as string

  if (!verifyPassword(password)) {
    return { error: 'Invalid password' }
  }

  await createSession()
  redirect('/admin')
}

export async function logout() {
  await deleteSession()
  redirect('/admin/login')
}
