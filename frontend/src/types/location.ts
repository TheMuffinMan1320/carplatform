export interface LocationResponse {
  id: string
  name: string
  addressLine1: string
  addressLine2: string | null
  city: string
  region: string
  postalCode: string
  country: string
  phone: string | null
  active: boolean
}

export interface LocationRequest {
  name: string
  addressLine1: string
  addressLine2?: string
  city: string
  region: string
  postalCode: string
  country: string
  phone?: string
}
