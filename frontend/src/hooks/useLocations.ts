import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as locationsApi from '../api/locations'
import type { LocationRequest } from '../types/location'
import type { PageParams } from '../types/common'

export function useLocationsQuery(params: PageParams = {}) {
  return useQuery({
    queryKey: ['locations', params],
    queryFn: () => locationsApi.listLocations(params),
  })
}

/** All locations as an id -> name lookup, used for display in tables/cards that only carry a locationId. */
export function useLocationsMap() {
  const { data, isLoading } = useLocationsQuery({ size: 100 })
  const map = useMemo(() => {
    const entries = new Map<string, string>()
    data?.content.forEach((loc) => entries.set(loc.id, loc.name))
    return entries
  }, [data])
  return { map, isLoading }
}

export function useLocationQuery(id: string | undefined) {
  return useQuery({
    queryKey: ['location', id],
    queryFn: () => locationsApi.getLocation(id!),
    enabled: !!id,
  })
}

function useInvalidateLocations() {
  const queryClient = useQueryClient()
  return (id?: string) => {
    queryClient.invalidateQueries({ queryKey: ['locations'] })
    if (id) queryClient.invalidateQueries({ queryKey: ['location', id] })
  }
}

export function useCreateLocation() {
  const invalidate = useInvalidateLocations()
  return useMutation({
    mutationFn: (body: LocationRequest) => locationsApi.createLocation(body),
    onSuccess: () => invalidate(),
  })
}

export function useUpdateLocation(id: string) {
  const invalidate = useInvalidateLocations()
  return useMutation({
    mutationFn: (body: LocationRequest) => locationsApi.updateLocation(id, body),
    onSuccess: () => invalidate(id),
  })
}

export function useDeleteLocation() {
  const invalidate = useInvalidateLocations()
  return useMutation({
    mutationFn: (id: string) => locationsApi.deleteLocation(id),
    onSuccess: (_data, id) => invalidate(id),
  })
}
