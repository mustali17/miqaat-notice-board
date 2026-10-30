const formatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
})

/** Formats an ISO date in the user's local time, e.g. "27 Oct 2026, 3:30 pm". */
export function formatPublishedAt(iso: string): string {
  return formatter.format(new Date(iso)).replace(/\b(am|pm)\b/i, (m) => m.toLowerCase())
}
