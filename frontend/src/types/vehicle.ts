export type VehicleStatus = 'AVAILABLE' | 'RENTED' | 'IN_MAINTENANCE' | 'OUT_OF_SERVICE' | 'RETIRED'
export type PricingTier = 'ECONOMY' | 'STANDARD' | 'PREMIUM' | 'LUXURY'

export interface VehicleResponse {
  id: string
  locationId: string
  make: string
  model: string
  year: number
  vin: string
  licensePlate: string | null
  mileage: number
  pricingTier: PricingTier
  dailyRate: string
  status: VehicleStatus
}

export interface VehicleRequest {
  locationId: string
  make: string
  model: string
  year: number
  vin: string
  licensePlate?: string
  mileage: number
  pricingTier: PricingTier
  dailyRate: number
}

export interface VehicleStatusUpdateRequest {
  status: VehicleStatus
}

export interface VehicleListParams {
  locationId?: string
  status?: VehicleStatus
  pricingTier?: PricingTier
  page?: number
  size?: number
  sort?: string
}
