export type ReservationStatus = 'RESERVED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'

export interface ReservationResponse {
  id: string
  customerId: string
  vehicleId: string
  startDate: string
  endDate: string
  status: ReservationStatus
  totalAmount: string
}

export interface ReservationRequest {
  vehicleId: string
  startDate: string
  endDate: string
}

export interface CompleteReservationRequest {
  endMileage: number
}

export interface AvailabilityResponse {
  available: boolean
}

export interface ReservationListParams {
  status?: ReservationStatus
  page?: number
  size?: number
  sort?: string
}
