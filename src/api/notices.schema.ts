import { z } from 'zod'

export const prioritySchema = z.enum(['low', 'normal', 'high'])
export type Priority = z.infer<typeof prioritySchema>

export const noticeSchema = z.object({
  id: z.number().int(),
  title: z.string().min(1),
  message: z.string().min(1),
  priority: prioritySchema,
  publishedAt: z.string().datetime(),
  link: z
    .string()
    .url()
    .refine((value) => /^https?:\/\//i.test(value), 'Link must be http(s)')
    .optional(),
})
export type Notice = z.infer<typeof noticeSchema>

export const noticesResponseSchema = z.object({
  items: z.array(noticeSchema),
})
export type NoticesResponse = z.infer<typeof noticesResponseSchema>

/** One page of the paginated list endpoint. `nextCursor` is null on the last page. */
export const noticesPageSchema = z.object({
  items: z.array(noticeSchema),
  total: z.number().int().nonnegative(),
  nextCursor: z.number().int().nonnegative().nullable(),
})
export type NoticesPage = z.infer<typeof noticesPageSchema>

/** What the client sends when creating a notice; the server assigns id and publishedAt. */
export type NewNotice = Omit<Notice, 'id' | 'publishedAt'>
