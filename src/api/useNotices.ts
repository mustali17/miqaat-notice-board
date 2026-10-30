import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'
import { fetchNoticesPage, type NoticeFilters } from './notices.api'

export const noticesKey = ['notices'] as const

/**
 * Paginated notices for the given filters. TanStack Query caches each filter combination,
 * de-duplicates identical requests and keeps the previous list on screen while a new search loads.
 */
export function useNotices(filters: NoticeFilters) {
  const query = useInfiniteQuery({
    queryKey: [...noticesKey, filters],
    queryFn: ({ pageParam, signal }) => fetchNoticesPage({ filters, cursor: pageParam, signal }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    placeholderData: keepPreviousData,
  })

  const status = query.data ? 'success' : query.isError ? 'error' : 'loading'

  return {
    status,
    notices: query.data?.pages.flatMap((page) => page.items) ?? [],
    total: query.data?.pages[0]?.total ?? 0,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    retry: query.refetch,
  } as const
}
