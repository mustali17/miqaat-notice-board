import { lazy, Suspense, useCallback, useState } from 'react'
import { useNotices } from '../../api/useNotices'
import { useCreateNotice, useDeleteNotice } from '../../api/useNoticeMutations'
import type { Notice } from '../../api/notices.schema'
import type { PriorityFilter } from '../../api/notices.api'
import type { AddNoticeValues } from './addNotice.schema'
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog'
import { NoticeCard } from './NoticeCard'
import { EmptyState, ErrorState, NoResultsState, NoticeSkeleton } from './NoticeListStates'
import { useDebouncedValue } from './useDebouncedValue'

// The form is only needed after a click, so it is split out of the initial bundle.
const AddNoticeForm = lazy(() => import('./AddNoticeForm').then((m) => ({ default: m.AddNoticeForm })))

const MENU = ['Miqaats', 'Notice Board', 'Reports']
const SEARCH_DEBOUNCE_MS = 300

export function NoticeBoard() {
  const [search, setSearch] = useState('')
  const [priority, setPriority] = useState<PriorityFilter>('all')
  const [formOpen, setFormOpen] = useState(false)
  const [noticeToDelete, setNoticeToDelete] = useState<Notice | null>(null)

  // The input updates instantly; the request only goes out once typing pauses.
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS)
  const { status, notices, total, hasNextPage, fetchNextPage, isFetchingNextPage, retry } = useNotices({
    search: debouncedSearch,
    priority,
  })
  const createNotice = useCreateNotice()
  const deleteNotice = useDeleteNotice()

  const hasFilters = debouncedSearch.trim() !== '' || priority !== 'all'

  const handleSave = async (values: AddNoticeValues) => {
    const { link, ...rest } = values
    await createNotice.mutateAsync({ ...rest, ...(link ? { link } : {}) })
    setFormOpen(false)
  }

  const handleConfirmDelete = async () => {
    if (!noticeToDelete) return
    try {
      await deleteNotice.mutateAsync(noticeToDelete.id)
      setNoticeToDelete(null)
    } catch {
      // The dialog stays open and shows the error from deleteNotice.isError.
    }
  }

  const closeForm = useCallback(() => setFormOpen(false), [])
  const openForm = useCallback(() => setFormOpen(true), [])
  const requestDelete = useCallback((notice: Notice) => {
    deleteNotice.reset()
    setNoticeToDelete(notice)
  }, [deleteNotice])
  const cancelDelete = useCallback(() => setNoticeToDelete(null), [])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-slate-900 text-white">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-x-8 gap-y-2 px-4 py-3">
          <span className="font-bold">RMS Admin</span>
          <nav className="flex gap-5 text-sm">
            {MENU.map((item) => (
              <a
                key={item}
                href="#"
                onClick={(e) => e.preventDefault()}
                aria-current={item === 'Notice Board' ? 'page' : undefined}
                className={
                  item === 'Notice Board'
                    ? 'border-b-2 border-white pb-0.5 font-medium'
                    : 'text-slate-300 hover:text-white'
                }
              >
                {item}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">
        <p className="text-sm text-slate-500">Miqaats / Sample Miqaat 2026 / Notice Board</p>
        <h1 className="mt-1 text-2xl font-bold">Notice Board</h1>
        <p className="mt-1 text-slate-500">
          Sample Miqaat 2026 · Mumbai — notices shown to registered participants
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title…"
            aria-label="Search by title"
            className="min-w-48 flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 sm:max-w-xs sm:flex-none"
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as PriorityFilter)}
            aria-label="Filter by priority"
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="all">All priorities</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>
          <button
            type="button"
            onClick={openForm}
            className="ml-auto rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            + Add notice
          </button>
        </div>

        {status === 'success' && (
          <p className="mt-4 text-sm text-slate-500" aria-live="polite">
            Showing {total} {total === 1 ? 'notice' : 'notices'} · newest first
          </p>
        )}

        <div className="mt-3">
          {status === 'loading' && <NoticeSkeleton />}
          {status === 'error' && <ErrorState onRetry={() => void retry()} />}
          {status === 'success' && total === 0 && !hasFilters && <EmptyState onAdd={openForm} />}
          {status === 'success' && total === 0 && hasFilters && <NoResultsState />}
          {status === 'success' && notices.length > 0 && (
            <>
              <ul className="space-y-3">
                {notices.map((notice) => (
                  <NoticeCard key={notice.id} notice={notice} onDelete={requestDelete} />
                ))}
              </ul>
              {hasNextPage && (
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => void fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                  >
                    {isFetchingNextPage ? 'Loading…' : `Load more (${notices.length} of ${total})`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {formOpen && (
        <Suspense fallback={null}>
          <AddNoticeForm onSave={handleSave} onCancel={closeForm} />
        </Suspense>
      )}
      {noticeToDelete && (
        <ConfirmDeleteDialog
          title={noticeToDelete.title}
          isDeleting={deleteNotice.isPending}
          hasError={deleteNotice.isError}
          onConfirm={() => void handleConfirmDelete()}
          onCancel={cancelDelete}
        />
      )}
    </div>
  )
}
