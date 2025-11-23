'use client'

import { useState } from 'react'

interface DeleteButtonProps {
  id: string
  action: (id: string) => Promise<{ error?: string; success?: boolean }>
  disabled?: boolean
  confirmMessage?: string
}

export default function DeleteButton({
  id,
  action,
  disabled = false,
  confirmMessage = 'Are you sure you want to delete this item?'
}: DeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    if (disabled) return

    if (!confirm(confirmMessage)) {
      return
    }

    setIsDeleting(true)

    try {
      const result = await action(id)

      if (result.error) {
        alert(result.error)
        setIsDeleting(false)
      }
      // On success, the page will revalidate and re-render
    } catch (error) {
      alert('Failed to delete')
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={disabled || isDeleting}
      className={`${
        disabled
          ? 'text-gray-400 cursor-not-allowed'
          : 'text-red-600 hover:text-red-700'
      }`}
    >
      {isDeleting ? 'Deleting...' : 'Delete'}
    </button>
  )
}
