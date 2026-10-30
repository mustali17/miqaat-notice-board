import type { ReactNode } from 'react'

export function NoticeSkeleton() {
  return (
    <ul className="space-y-3" aria-busy="true" aria-label="Loading notices">
      {[0, 1, 2].map((i) => (
        <li key={i} className="animate-pulse rounded-lg border border-slate-200 bg-white p-4">
          <div className="h-4 w-1/3 rounded bg-slate-200" />
          <div className="mt-3 h-3 w-full rounded bg-slate-200" />
          <div className="mt-2 h-3 w-2/3 rounded bg-slate-200" />
          <div className="mt-3 h-3 w-1/4 rounded bg-slate-200" />
        </li>
      ))}
    </ul>
  )
}

function StateBox({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-dashed border-slate-300 bg-white px-4 py-12 text-center">
      {children}
    </div>
  )
}

const primaryButton =
  'rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2'

export function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <StateBox>
      <span className="text-4xl" aria-hidden="true">📭</span>
      <h2 className="mt-3 text-lg font-semibold text-slate-900">No notices yet</h2>
      <p className="mt-1 text-slate-500">Notices you add for this Miqaat will appear here.</p>
      <button type="button" onClick={onAdd} className={`mt-4 ${primaryButton}`}>
        + Add notice
      </button>
    </StateBox>
  )
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <StateBox>
      <span className="text-4xl" aria-hidden="true">⚠️</span>
      <h2 className="mt-3 text-lg font-semibold text-slate-900">We couldn't load the notices</h2>
      <p className="mt-1 text-slate-500">
        The server didn't respond or sent data we couldn't read. Please try again.
      </p>
      <button type="button" onClick={onRetry} className={`mt-4 ${primaryButton}`}>
        Try again
      </button>
    </StateBox>
  )
}

export function NoResultsState() {
  return (
    <StateBox>
      <h2 className="text-lg font-semibold text-slate-900">No notices match your search</h2>
      <p className="mt-1 text-slate-500">Try a different title or priority.</p>
    </StateBox>
  )
}
