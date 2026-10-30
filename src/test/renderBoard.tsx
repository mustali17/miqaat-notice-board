import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NoticeBoard } from '../features/notices/NoticeBoard'
import { configureDb } from '../mocks/db'
import type { Notice } from '../api/notices.schema'

export function renderBoard(seed: Notice[]) {
  configureDb(async () => structuredClone(seed))
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <NoticeBoard />
    </QueryClientProvider>,
  )
}
