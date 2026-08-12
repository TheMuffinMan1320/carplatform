import { client } from './client'
import type { PageResponse } from '../types/common'
import type {
  MaintenanceAlertListParams,
  MaintenanceAlertResponse,
  MaintenanceRecordRequest,
  MaintenanceRecordResponse,
  MaintenanceRuleResponse,
  MaintenanceRuleUpdateRequest,
  ServiceType,
} from '../types/maintenance'

export const listMaintenanceRecords = (vehicleId: string) =>
  client.get<MaintenanceRecordResponse[]>(`/vehicles/${vehicleId}/maintenance-records`).then((r) => r.data)

export const createMaintenanceRecord = (vehicleId: string, body: MaintenanceRecordRequest) =>
  client
    .post<MaintenanceRecordResponse>(`/vehicles/${vehicleId}/maintenance-records`, body)
    .then((r) => r.data)

export const listMaintenanceAlerts = (params: MaintenanceAlertListParams) =>
  client.get<PageResponse<MaintenanceAlertResponse>>('/maintenance-alerts', { params }).then((r) => r.data)

export const dismissMaintenanceAlert = (id: string) =>
  client.patch<MaintenanceAlertResponse>(`/maintenance-alerts/${id}/dismiss`).then((r) => r.data)

export const listMaintenanceRules = () =>
  client.get<MaintenanceRuleResponse[]>('/maintenance-rules').then((r) => r.data)

export const updateMaintenanceRule = (serviceType: ServiceType, body: MaintenanceRuleUpdateRequest) =>
  client.put<MaintenanceRuleResponse>(`/maintenance-rules/${serviceType}`, body).then((r) => r.data)
