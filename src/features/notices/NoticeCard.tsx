import { memo } from 'react'
import type { Notice } from '../../api/notices.schema'
import { PriorityBadge } from './PriorityBadge'
import { formatPublishedAt } from './formatDate'

type Props = {
  notice: Notice
  onDelete: (notice: Notice) => void
}

// memo: with thousands of notices, typing in the search box must not re-render every card.
export const NoticeCard = memo(function NoticeCard({ notice, onDelete }: Props) {
  return (
    <li className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <PriorityBadge priority={notice.priority} />
        <h3 className="font-bold text-slate-900">{notice.title}</h3>
        <button
          type="button"
          onClick={() => onDelete(notice)}
          aria-label={`Delete notice: ${notice.title}`}
          className="ml-auto rounded px-2 py-1 text-sm text-slate-500 hover:bg-red-50 hover:text-red-600"
        >
          Delete
        </button>
      </div>
      <p className="mt-2 text-slate-700">{notice.message}</p>
      <p className="mt-2 text-sm text-slate-500">
        Published {formatPublishedAt(notice.publishedAt)}
        {notice.link && (
          <>
            {' · '}
            <a
              href={notice.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:underline"
            >
              Open link ↗
            </a>
          </>
        )}
      </p>
    </li>
  )
})
