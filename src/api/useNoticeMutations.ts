import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createNotice, deleteNotice } from './notices.api'
import { noticesKey } from './useNotices'

/** Both mutations invalidate every cached notice list so the page re-reads the server's truth. */
export function useCreateNotice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createNotice,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: noticesKey }),
  })
}

export function useDeleteNotice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteNotice,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: noticesKey }),
  })
}
