import { z } from 'zod'
import { prioritySchema } from '../../api/notices.schema'

export const TITLE_MAX = 80

// Only http(s) links are allowed: they end up in an href, so javascript: URLs must be rejected.
function isHttpUrl(value: string): boolean {
  try {
    const { protocol } = new URL(value)
    return protocol === 'http:' || protocol === 'https:'
  } catch {
    return false
  }
}

export const addNoticeSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Title is required')
      .max(TITLE_MAX, `Title can be at most ${TITLE_MAX} characters`),
    message: z
      .string()
      .trim()
      .min(10, 'Message must be at least 10 characters'),
    priority: prioritySchema,
    link: z
      .string()
      .trim()
      .refine((value) => value === '' || isHttpUrl(value), {
        message: 'Enter a valid URL, e.g. https://example.com',
      }),
  })
  .superRefine((values, ctx) => {
    if (values.priority === 'high' && values.link === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['link'],
        message: 'High priority notices need a link',
      })
    }
  })

export type AddNoticeValues = z.infer<typeof addNoticeSchema>
