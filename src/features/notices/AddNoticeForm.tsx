import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { addNoticeSchema, TITLE_MAX, type AddNoticeValues } from './addNotice.schema'
import { prioritySchema, type Priority } from '../../api/notices.schema'

type Props = {
  /** Should reject if saving fails; the form then stays open and shows an error. */
  onSave: (values: AddNoticeValues) => Promise<void>
  onCancel: () => void
}

const PRIORITY_LABELS: Record<Priority, string> = { low: 'Low', normal: 'Normal', high: 'High' }

const fieldClass = (hasError: boolean) =>
  `mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
    hasError
      ? 'border-red-500 focus:ring-red-300'
      : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-200'
  }`

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} role="alert" className="mt-1 text-sm text-red-600">
      {message}
    </p>
  )
}

export function AddNoticeForm({ onSave, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    setFocus,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AddNoticeValues>({
    resolver: zodResolver(addNoticeSchema),
    defaultValues: { title: '', message: '', priority: 'normal', link: '' },
  })

  const titleLength = watch('title').length

  useEffect(() => {
    setFocus('title')
  }, [setFocus])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onCancel])

  return (
    <div className="fixed inset-0 z-20 flex justify-end bg-slate-900/50" onClick={onCancel}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-notice-heading"
        className="flex h-full w-full max-w-md flex-col bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <form noValidate onSubmit={handleSubmit(async (values) => {
            try {
              await onSave(values)
            } catch {
              setError('root', { message: "We couldn't save the notice. Please try again." })
            }
          })} className="flex h-full flex-col">
          <h2 id="add-notice-heading" className="border-b border-slate-200 px-6 py-4 text-xl font-semibold">
            Add notice
          </h2>

          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-700">
                Title <span className="text-red-600">*</span>
              </label>
              <input
                id="title"
                type="text"
                aria-invalid={!!errors.title}
                aria-describedby={errors.title ? 'title-error' : undefined}
                className={fieldClass(!!errors.title)}
                {...register('title')}
              />
              <div className="flex justify-between">
                <FieldError id="title-error" message={errors.title?.message} />
                <span className="ml-auto mt-1 text-xs text-slate-500">
                  {titleLength} / {TITLE_MAX}
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-slate-700">
                Message <span className="text-red-600">*</span>
              </label>
              <textarea
                id="message"
                rows={5}
                aria-invalid={!!errors.message}
                aria-describedby={errors.message ? 'message-error' : undefined}
                className={fieldClass(!!errors.message)}
                {...register('message')}
              />
              <FieldError id="message-error" message={errors.message?.message} />
            </div>

            <fieldset>
              <legend className="block text-sm font-medium text-slate-700">
                Priority <span className="text-red-600">*</span>
              </legend>
              <div className="mt-2 flex gap-4">
                {prioritySchema.options.map((value) => (
                  <label key={value} className="flex items-center gap-2 text-sm text-slate-700">
                    <input type="radio" value={value} {...register('priority')} />
                    {PRIORITY_LABELS[value]}
                  </label>
                ))}
              </div>
              <FieldError id="priority-error" message={errors.priority?.message} />
            </fieldset>

            <div>
              <label htmlFor="link" className="block text-sm font-medium text-slate-700">
                Link
              </label>
              <input
                id="link"
                type="text"
                placeholder="https://example.com"
                aria-invalid={!!errors.link}
                aria-describedby={errors.link ? 'link-error' : undefined}
                className={fieldClass(!!errors.link)}
                {...register('link')}
              />
              <FieldError id="link-error" message={errors.link?.message} />
            </div>
          </div>

          {errors.root && (
            <p role="alert" className="px-6 pb-2 text-sm text-red-600">
              {errors.root.message}
            </p>
          )}

          <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {isSubmitting ? 'Saving…' : 'Save notice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
