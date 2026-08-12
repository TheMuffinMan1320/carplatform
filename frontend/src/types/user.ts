export type Role = 'CUSTOMER' | 'FLEET_AGENT' | 'ADMIN'

export interface UserSummary {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string | null
  role: Role
  locationId: string | null
}

export interface AdminCreateUserRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  role: Role
  locationId?: string
}
