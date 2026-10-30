import {
  noticeSchema,
  noticesPageSchema,
  type NewNotice,
  type Notice,
  type NoticesPage,
  type Priority,
} from './notices.schema'

export const PAGE_SIZE = 20

export type PriorityFilter = Priority | 'all'

export type NoticeFilters = {
  search: string
  priority: PriorityFilter
}

// Absolute URL so the same code works in the browser and in the Node-based test runner.
const endpoint = (path = '') => new URL(`/api/notices${path}`, window.location.origin)

async function readJson(response: Response, action: string): Promise<unknown> {
  if (!response.ok) {
    throw new Error(`Failed to ${action} (HTTP ${response.status})`)
  }
  return response.json()
}

/** Loads one page of notices. The server filters, sorts (newest first) and paginates. */
export async function fetchNoticesPage(params: {
  filters: NoticeFilters
  cursor: number
  signal?: AbortSignal
}): Promise<NoticesPage> {
  const url = endpoint()
  url.searchParams.set('limit', String(PAGE_SIZE))
  url.searchParams.set('cursor', String(params.cursor))
  if (params.filters.search.trim()) url.searchParams.set('search', params.filters.search.trim())
  if (params.filters.priority !== 'all') url.searchParams.set('priority', params.filters.priority)

  const response = await fetch(url, { signal: params.signal })
  return noticesPageSchema.parse(await readJson(response, 'load notices'))
}

export async function createNotice(input: NewNotice): Promise<Notice> {
  const response = await fetch(endpoint(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  return noticeSchema.parse(await readJson(response, 'save notice'))
}

export async function deleteNotice(id: number): Promise<void> {
  const response = await fetch(endpoint(`/${id}`), { method: 'DELETE' })
  if (!response.ok) {
    throw new Error(`Failed to delete notice (HTTP ${response.status})`)
  }
}
