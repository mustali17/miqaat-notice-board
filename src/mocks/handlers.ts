import { delay, http, HttpResponse } from 'msw'
import { prioritySchema } from '../api/notices.schema'
import { addNoticeSchema } from '../features/notices/addNotice.schema'
import { insertNotice, queryNotices, removeNotice } from './db'

const serverError = () => HttpResponse.json({ message: 'Internal error' }, { status: 500 })

export const handlers = [
  http.get('*/api/notices', async ({ request }) => {
    const url = new URL(request.url)
    const priority = prioritySchema.safeParse(url.searchParams.get('priority'))
    const limit = Math.min(Number(url.searchParams.get('limit')) || 20, 100)
    const cursor = Math.max(Number(url.searchParams.get('cursor')) || 0, 0)
    try {
      await delay(300)
      return HttpResponse.json(
        await queryNotices({
          search: url.searchParams.get('search') ?? '',
          priority: priority.success ? priority.data : null,
          cursor,
          limit,
        }),
      )
    } catch (error) {
      console.error(error)
      return serverError()
    }
  }),

  http.post('*/api/notices', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>
    // The server re-validates with the same schema the form uses; never trust the client.
    const parsed = addNoticeSchema.safeParse({ link: '', ...body })
    if (!parsed.success) {
      return HttpResponse.json({ issues: parsed.error.issues }, { status: 400 })
    }
    await delay(300)
    const { link, ...rest } = parsed.data
    return HttpResponse.json(await insertNotice({ ...rest, ...(link ? { link } : {}) }), { status: 201 })
  }),

  http.delete('*/api/notices/:id', async ({ params }) => {
    await delay(200)
    const removed = await removeNotice(Number(params.id))
    return removed ? new HttpResponse(null, { status: 204 }) : HttpResponse.json({}, { status: 404 })
  }),
]
