import { client } from './client'
import type { PageParams, PageResponse } from '../types/common'
import type { LocationRequest, LocationResponse } from '../types/location'

export const listLocations = (params: PageParams) =>
  client.get<PageResponse<LocationResponse>>('/locations', { params }).then((r) => r.data)

export const getLocation = (id: string) => client.get<LocationResponse>(`/locations/${id}`).then((r) => r.data)

export const createLocation = (body: LocationRequest) =>
  client.post<LocationResponse>('/locations', body).then((r) => r.data)

export const updateLocation = (id: string, body: LocationRequest) =>
  client.put<LocationResponse>(`/locations/${id}`, body).then((r) => r.data)

export const deleteLocation = (id: string) => client.delete<void>(`/locations/${id}`).then((r) => r.data)
