import { describe, expect, it } from 'vitest'
import { addNoticeSchema } from './addNotice.schema'

const valid = {
  title: 'Gates open at 6 pm',
  message: 'The main gate opens at 6 pm for everyone.',
  priority: 'normal',
  link: '',
}

function errorFor(values: unknown, field: string): string | undefined {
  const result = addNoticeSchema.safeParse(values)
  if (result.success) return undefined
  return result.error.issues.find((i) => i.path[0] === field)?.message
}

describe('addNoticeSchema', () => {
  it('accepts a complete, valid notice', () => {
    expect(addNoticeSchema.safeParse({ ...valid, link: 'https://example.com/map' }).success).toBe(true)
  })

  it('rejects an empty title', () => {
    expect(errorFor({ ...valid, title: '' }, 'title')).toBe('Title is required')
  })

  it('rejects a whitespace-only title', () => {
    expect(errorFor({ ...valid, title: '   ' }, 'title')).toBe('Title is required')
  })

  it('accepts a title of exactly 80 characters', () => {
    expect(addNoticeSchema.safeParse({ ...valid, title: 'a'.repeat(80) }).success).toBe(true)
  })

  it('rejects a title longer than 80 characters', () => {
    expect(errorFor({ ...valid, title: 'a'.repeat(81) }, 'title')).toBe(
      'Title can be at most 80 characters',
    )
  })

  it('rejects a message shorter than 10 characters', () => {
    expect(errorFor({ ...valid, message: 'too short' }, 'message')).toBe(
      'Message must be at least 10 characters',
    )
  })

  it('rejects an unknown priority', () => {
    expect(addNoticeSchema.safeParse({ ...valid, priority: 'urgent' }).success).toBe(false)
  })

  it('accepts an empty link', () => {
    expect(addNoticeSchema.safeParse({ ...valid, link: '' }).success).toBe(true)
  })

  it('rejects an invalid link', () => {
    expect(errorFor({ ...valid, link: 'not a url' }, 'link')).toBe(
      'Enter a valid URL, e.g. https://example.com',
    )
  })

  it('rejects non-http links such as javascript:', () => {
    expect(addNoticeSchema.safeParse({ ...valid, link: 'javascript:alert(1)' }).success).toBe(false)
  })

  describe('high priority needs a link', () => {
    it('rejects a high priority notice without a link', () => {
      expect(errorFor({ ...valid, priority: 'high' }, 'link')).toBe('High priority notices need a link')
    })

    it('accepts a high priority notice with a link', () => {
      expect(
        addNoticeSchema.safeParse({ ...valid, priority: 'high', link: 'https://example.com' }).success,
      ).toBe(true)
    })
  })
})
