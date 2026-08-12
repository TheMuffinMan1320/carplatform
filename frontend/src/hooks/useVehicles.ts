import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as vehiclesApi from '../api/vehicles'
import type { VehicleListParams, VehicleRequest, VehicleStatusUpdateRequest } from '../types/vehicle'

export function useVehiclesQuery(params: VehicleListParams) {
  return useQuery({
    queryKey: ['vehicles', params],
    queryFn: () => vehiclesApi.listVehicles(params),
  })
}

/** All vehicles as an id -> "Make Model" lookup, used where only a vehicleId is available (e.g. reservation rows). */
export function useVehiclesMap() {
  const { data } = useVehiclesQuery({ size: 100 })
  const map = useMemo(() => {
    const entries = new Map<string, string>()
    data?.content.forEach((v) => entries.set(v.id, `${v.make} ${v.model}`))
    return entries
  }, [data])
  return { map }
}

export function useVehicleQuery(id: string | undefined) {
  return useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => vehiclesApi.getVehicle(id!),
    enabled: !!id,
  })
}

export function useVehicleAvailability(vehicleId: string | undefined, startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['vehicle-availability', vehicleId, startDate, endDate],
    queryFn: () => vehiclesApi.getVehicleAvailability(vehicleId!, startDate, endDate),
    enabled: !!vehicleId && !!startDate && !!endDate,
  })
}

function useInvalidateVehicles() {
  const queryClient = useQueryClient()
  return (id?: string) => {
    queryClient.invalidateQueries({ queryKey: ['vehicles'] })
    if (id) queryClient.invalidateQueries({ queryKey: ['vehicle', id] })
  }
}

export function useCreateVehicle() {
  const invalidate = useInvalidateVehicles()
  return useMutation({
    mutationFn: (body: VehicleRequest) => vehiclesApi.createVehicle(body),
    onSuccess: () => invalidate(),
  })
}

export function useUpdateVehicle(id: string) {
  const invalidate = useInvalidateVehicles()
  return useMutation({
    mutationFn: (body: VehicleRequest) => vehiclesApi.updateVehicle(id, body),
    onSuccess: () => invalidate(id),
  })
}

export function useUpdateVehicleStatus(id: string) {
  const invalidate = useInvalidateVehicles()
  return useMutation({
    mutationFn: (body: VehicleStatusUpdateRequest) => vehiclesApi.updateVehicleStatus(id, body),
    onSuccess: () => invalidate(id),
  })
}

export function useDeleteVehicle() {
  const invalidate = useInvalidateVehicles()
  return useMutation({
    mutationFn: (id: string) => vehiclesApi.deleteVehicle(id),
    onSuccess: (_data, id) => invalidate(id),
  })
}
