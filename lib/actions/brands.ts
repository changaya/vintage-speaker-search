'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'

export async function createBrand(formData: FormData) {
  const name = formData.get('name') as string
  const country = formData.get('country') as string
  const foundedYear = formData.get('foundedYear') as string
  const description = formData.get('description') as string
  const website = formData.get('website') as string

  if (!name || !country) {
    return { error: 'Name and country are required' }
  }

  try {
    await prisma.brand.create({
      data: {
        name,
        country,
        foundedYear: foundedYear ? parseInt(foundedYear) : null,
        description: description || null,
        website: website || null,
      },
    })

    revalidatePath('/admin/brands')
    redirect('/admin/brands')
  } catch (error) {
    console.error('Error creating brand:', error)
    return { error: 'Failed to create brand' }
  }
}

export async function updateBrand(id: string, formData: FormData) {
  const name = formData.get('name') as string
  const country = formData.get('country') as string
  const foundedYear = formData.get('foundedYear') as string
  const description = formData.get('description') as string
  const website = formData.get('website') as string

  if (!name || !country) {
    return { error: 'Name and country are required' }
  }

  try {
    await prisma.brand.update({
      where: { id },
      data: {
        name,
        country,
        foundedYear: foundedYear ? parseInt(foundedYear) : null,
        description: description || null,
        website: website || null,
      },
    })

    revalidatePath('/admin/brands')
    revalidatePath(`/admin/brands/${id}`)
    redirect('/admin/brands')
  } catch (error) {
    console.error('Error updating brand:', error)
    return { error: 'Failed to update brand' }
  }
}

export async function deleteBrand(id: string) {
  try {
    await prisma.brand.delete({
      where: { id },
    })

    revalidatePath('/admin/brands')
    return { success: true }
  } catch (error) {
    console.error('Error deleting brand:', error)
    return { error: 'Failed to delete brand. It may have associated speakers.' }
  }
}
