import { bypass } from 'msw'
import { noticesResponseSchema, type NewNotice, type Notice, type Priority } from '../api/notices.schema'

/** In-memory "database" behind the mock API. Seeded lazily from /notices.json. */
let store: Notice[] | null = null

async function loadSeedFromFile(): Promise<Notice[]> {
  // `bypass` skips the mock worker so this reaches the real static file.
  const response = await fetch(bypass('/notices.json'))
  if (!response.ok) throw new Error(`Failed to read notices.json (HTTP ${response.status})`)
  return noticesResponseSchema.parse(await response.json()).items
}

let seedLoader = loadSeedFromFile

/** Tests replace the seed source; pass nothing to restore the file loader. */
export function configureDb(loader: () => Promise<Notice[]> = loadSeedFromFile) {
  seedLoader = loader
  store = null
}

async function getStore(): Promise<Notice[]> {
  // Assigned only on success, so a broken seed file is retried on the next request.
  store ??= await seedLoader()
  return store
}

export async function queryNotices(params: {
  search: string
  priority: Priority | null
  cursor: number
  limit: number
}) {
  const query = params.search.trim().toLowerCase()
  const matches = (await getStore())
    .filter((n) => (params.priority === null || n.priority === params.priority) && n.title.toLowerCase().includes(query))
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt) || b.id - a.id)

  const items = matches.slice(params.cursor, params.cursor + params.limit)
  const end = params.cursor + items.length
  return { items, total: matches.length, nextCursor: end < matches.length ? end : null }
}

export async function insertNotice(input: NewNotice): Promise<Notice> {
  const notices = await getStore()
  const notice: Notice = {
    ...input,
    id: notices.reduce((max, n) => Math.max(max, n.id), 0) + 1,
    publishedAt: new Date().toISOString(),
  }
  notices.push(notice)
  return notice
}

export async function removeNotice(id: number): Promise<boolean> {
  const notices = await getStore()
  const index = notices.findIndex((n) => n.id === id)
  if (index === -1) return false
  notices.splice(index, 1)
  return true
}
