import { client } from './client'
import type { PageResponse } from '../types/common'
import type {
  VehicleListParams,
  VehicleRequest,
  VehicleResponse,
  VehicleStatusUpdateRequest,
} from '../types/vehicle'
import type { AvailabilityResponse } from '../types/reservation'

export const listVehicles = (params: VehicleListParams) =>
  client.get<PageResponse<VehicleResponse>>('/vehicles', { params }).then((r) => r.data)

export const getVehicle = (id: string) => client.get<VehicleResponse>(`/vehicles/${id}`).then((r) => r.data)

export const createVehicle = (body: VehicleRequest) =>
  client.post<VehicleResponse>('/vehicles', body).then((r) => r.data)

export const updateVehicle = (id: string, body: VehicleRequest) =>
  client.put<VehicleResponse>(`/vehicles/${id}`, body).then((r) => r.data)

export const updateVehicleStatus = (id: string, body: VehicleStatusUpdateRequest) =>
  client.patch<VehicleResponse>(`/vehicles/${id}/status`, body).then((r) => r.data)

export const deleteVehicle = (id: string) => client.delete<void>(`/vehicles/${id}`).then((r) => r.data)

export const getVehicleAvailability = (vehicleId: string, startDate: string, endDate: string) =>
  client
    .get<AvailabilityResponse>(`/vehicles/${vehicleId}/availability`, { params: { startDate, endDate } })
    .then((r) => r.data)
