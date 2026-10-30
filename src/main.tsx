import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import { NoticeBoard } from './features/notices/NoticeBoard'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000, refetchOnWindowFocus: false } },
})

async function enableMockApi() {
  // There is no backend: MSW answers /api/notices in the browser. Remove this to use a real API.
  const { worker } = await import('./mocks/browser')
  await worker.start({ quiet: true, onUnhandledFrame: 'bypass' })
}

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

enableMockApi()
  .catch(console.error)
  .then(() => {
    createRoot(root).render(
      <StrictMode>
        <QueryClientProvider client={queryClient}>
          <NoticeBoard />
        </QueryClientProvider>
      </StrictMode>,
    )
  })
