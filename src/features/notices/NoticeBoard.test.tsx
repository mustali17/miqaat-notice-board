import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '../../test/server'
import { renderBoard } from '../../test/renderBoard'
import type { Notice } from '../../api/notices.schema'

const seed: Notice[] = [
  { id: 1, title: 'Gates open at 6 pm', message: 'The main gate opens at 6 pm.', priority: 'high', publishedAt: '2026-10-27T10:00:00Z', link: 'https://example.com/venue-map' },
  { id: 2, title: 'Parking moved to Lot B', message: 'Lot A is closed for maintenance.', priority: 'normal', publishedAt: '2026-10-26T09:30:00Z' },
  { id: 4, title: 'Lost and found desk', message: 'Collect items near Gate 2.', priority: 'low', publishedAt: '2026-10-24T15:00:00Z' },
]

const manyNotices = (count: number): Notice[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    title: `Notice number ${i + 1}`,
    message: 'A generated notice for pagination tests.',
    priority: 'normal' as const,
    publishedAt: new Date(Date.UTC(2026, 0, 1, 0, i)).toISOString(),
  }))

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('NoticeBoard', () => {
  it('lists notices newest first', async () => {
    renderBoard(seed)
    expect(await screen.findByText('Showing 3 notices · newest first')).toBeInTheDocument()
    const titles = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
    expect(titles).toEqual(['Gates open at 6 pm', 'Parking moved to Lot B', 'Lost and found desk'])
  })

  it('filters the list as the user types in the search box, ignoring case', async () => {
    renderBoard(seed)
    await screen.findByText('Showing 3 notices · newest first')

    await userEvent.type(screen.getByPlaceholderText('Search by title…'), 'PARKING')

    expect(await screen.findByText('Showing 1 notice · newest first')).toBeInTheDocument()
    expect(screen.getByText('Parking moved to Lot B')).toBeInTheDocument()
    expect(screen.queryByText('Gates open at 6 pm')).not.toBeInTheDocument()
  })

  it('combines search and priority filter and shows the no-results state', async () => {
    renderBoard(seed)
    await screen.findByText('Showing 3 notices · newest first')

    await userEvent.selectOptions(screen.getByLabelText('Filter by priority'), 'low')
    expect(await screen.findByText('Showing 1 notice · newest first')).toBeInTheDocument()

    await userEvent.type(screen.getByPlaceholderText('Search by title…'), 'gates')
    expect(await screen.findByText('No notices match your search')).toBeInTheDocument()
  })

  it('debounces search: typing several characters sends a single request', async () => {
    const searches: (string | null)[] = []
    renderBoard(seed)
    server.use(
      http.get('*/api/notices', ({ request }) => {
        searches.push(new URL(request.url).searchParams.get('search'))
        return HttpResponse.json({ items: [], total: 0, nextCursor: null })
      }),
    )
    await screen.findByText('No notices yet')
    searches.length = 0

    await userEvent.type(screen.getByPlaceholderText('Search by title…'), 'gates')
    await screen.findByText('No notices match your search')

    expect(searches).toEqual(['gates'])
  })

  it('shows the error state when the data does not match the schema, and recovers on retry', async () => {
    renderBoard(seed)
    server.use(
      http.get('*/api/notices', () =>
        HttpResponse.json({
          items: [{ ...seed[0], priority: 'urgent' }],
          total: 1,
          nextCursor: null,
        }),
        { once: true },
      ),
    )
    expect(await screen.findByText("We couldn't load the notices")).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByText('Showing 3 notices · newest first')).toBeInTheDocument()
  })

  it('shows the error state when the server fails', async () => {
    renderBoard(seed)
    server.use(http.get('*/api/notices', () => new HttpResponse(null, { status: 500 })))
    expect(await screen.findByText("We couldn't load the notices")).toBeInTheDocument()
  })

  it('shows the empty state when there are no notices', async () => {
    renderBoard([])
    expect(await screen.findByText('No notices yet')).toBeInTheDocument()
  })

  it('loads more notices page by page', async () => {
    renderBoard(manyNotices(45))
    expect(await screen.findByText('Showing 45 notices · newest first')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(20)

    await userEvent.click(screen.getByRole('button', { name: 'Load more (20 of 45)' }))
    await screen.findByRole('button', { name: 'Load more (40 of 45)' })
    expect(screen.getAllByRole('listitem')).toHaveLength(40)

    await userEvent.click(screen.getByRole('button', { name: 'Load more (40 of 45)' }))
    await vi.waitFor(() => expect(screen.getAllByRole('listitem')).toHaveLength(45))
    expect(screen.queryByRole('button', { name: /Load more/ })).not.toBeInTheDocument()
  })

  it('adds a validated notice to the top of the list', async () => {
    renderBoard(seed)
    await screen.findByText('Showing 3 notices · newest first')

    await userEvent.click(screen.getByRole('button', { name: '+ Add notice' }))
    const dialog = await screen.findByRole('dialog')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Save notice' }))
    expect(await within(dialog).findByText('Title is required')).toBeInTheDocument()

    await userEvent.type(within(dialog).getByLabelText(/Title/), 'Water stations')
    await userEvent.type(within(dialog).getByLabelText(/Message/), 'Water is available at every gate.')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Save notice' }))

    expect(await screen.findByText('Showing 4 notices · newest first')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    const cards = screen.getAllByRole('listitem')
    expect(within(cards[0]!).getByText('Water stations')).toBeInTheDocument()
  })

  it('keeps the form open and shows an error when saving fails', async () => {
    renderBoard(seed)
    await screen.findByText('Showing 3 notices · newest first')
    server.use(http.post('*/api/notices', () => new HttpResponse(null, { status: 500 })))

    await userEvent.click(screen.getByRole('button', { name: '+ Add notice' }))
    const dialog = await screen.findByRole('dialog')
    await userEvent.type(within(dialog).getByLabelText(/Title/), 'Water stations')
    await userEvent.type(within(dialog).getByLabelText(/Message/), 'Water is available at every gate.')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Save notice' }))

    expect(await within(dialog).findByText("We couldn't save the notice. Please try again.")).toBeInTheDocument()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('deletes a notice only after the user confirms', async () => {
    renderBoard(seed)
    await screen.findByText('Showing 3 notices · newest first')

    await userEvent.click(screen.getByRole('button', { name: 'Delete notice: Parking moved to Lot B' }))
    const confirm = screen.getByRole('alertdialog')
    await userEvent.click(within(confirm).getByRole('button', { name: 'Cancel' }))
    expect(screen.getByText('Parking moved to Lot B')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Delete notice: Parking moved to Lot B' }))
    await userEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Delete' }))

    expect(await screen.findByText('Showing 2 notices · newest first')).toBeInTheDocument()
    expect(screen.queryByText('Parking moved to Lot B')).not.toBeInTheDocument()
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })
})
