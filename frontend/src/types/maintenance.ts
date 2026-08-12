export type ServiceType = 'OIL_CHANGE' | 'TIRE_ROTATION' | 'BRAKE_SERVICE' | 'INSPECTION'
export type AlertStatus = 'OPEN' | 'RESOLVED' | 'DISMISSED'

export interface MaintenanceRecordResponse {
  id: string
  vehicleId: string
  serviceType: ServiceType
  performedAt: string
  mileageAtService: number
  cost: string | null
  notes: string | null
  performedBy: string | null
}

export interface MaintenanceRecordRequest {
  serviceType: ServiceType
  performedAt: string
  mileageAtService: number
  cost?: number
  notes?: string
}

export interface MaintenanceAlertResponse {
  id: string
  vehicleId: string
  serviceType: ServiceType
  dueMileage: number | null
  dueDate: string | null
  status: AlertStatus
  resolvedByRecordId: string | null
}

export interface MaintenanceAlertListParams {
  status?: AlertStatus
  locationId?: string
  page?: number
  size?: number
  sort?: string
}

export interface MaintenanceRuleResponse {
  serviceType: ServiceType
  mileageInterval: number
  timeIntervalMonths: number
}

export interface MaintenanceRuleUpdateRequest {
  mileageInterval: number
  timeIntervalMonths: number
}
