import type { Priority } from '../../api/notices.schema'

const STYLES: Record<Priority, string> = {
  high: 'bg-red-100 text-red-700',
  normal: 'bg-blue-100 text-blue-700',
  low: 'bg-slate-200 text-slate-700',
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${STYLES[priority]}`}
    >
      {priority}
    </span>
  )
}
