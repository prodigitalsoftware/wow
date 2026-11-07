'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { Drama } from '@/lib/types'

export function useDramas(params: Record<string, string | undefined>) {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v && v !== 'all') qs.set(k, v)
  })

  const query = useQuery<{ dramas: Drama[]; total: number; pages: number }>({
    queryKey: ['dramas', qs.toString()],
    queryFn: async () => {
      const res = await fetch(`/api/dramas?${qs.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    },
  })

  return {
    dramas: query.data?.dramas ?? [],
    total: query.data?.total ?? 0,
    pages: query.data?.pages ?? 1,
    loading: query.isLoading,
    error: query.isError ? 'Could not load dramas. Please try again.' : null,
    reload: query.refetch,
  }
}

/** Lightweight wrapper around TanStack Query preserving the previous useAsync API. */
export function useAsync<T>(loader: () => Promise<T>, deps: unknown[]) {
  const queryClient = useQueryClient()
  const key = JSON.stringify(deps)

  const query = useQuery<T>({
    queryKey: ['async', key],
    queryFn: loader,
  })

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.isError ? 'Something went wrong. Please try again.' : null,
    setData: (updater: T | ((prev: T | null) => T | null)) => {
      queryClient.setQueryData<T | null>(['async', key], (prev) =>
        typeof updater === 'function' ? (updater as (p: T | null) => T | null)(prev ?? null) : updater
      )
    },
    reload: query.refetch,
  }
}
