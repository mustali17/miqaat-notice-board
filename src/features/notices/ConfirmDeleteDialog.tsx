import { useEffect } from 'react'

type Props = {
  title: string
  isDeleting: boolean
  hasError: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDeleteDialog({ title, isDeleting, hasError, onConfirm, onCancel }: Props) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onCancel])

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/50 p-4" onClick={onCancel}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-heading"
        aria-describedby="delete-description"
        className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="delete-heading" className="text-lg font-semibold">
          Delete notice?
        </h2>
        <p id="delete-description" className="mt-2 text-sm text-slate-600">
          "{title}" will be removed for all participants. This can't be undone.
        </p>
        {hasError && (
          <p role="alert" className="mt-2 text-sm text-red-600">
            We couldn't delete the notice. Please try again.
          </p>
        )}
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
          >
            {isDeleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
