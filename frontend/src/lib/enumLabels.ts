import type { VehicleStatus, PricingTier } from '../types/vehicle'
import type { ReservationStatus } from '../types/reservation'
import type { ServiceType, AlertStatus } from '../types/maintenance'
import type { PaymentStatus } from '../types/payment'
import type { Role } from '../types/user'

export type BadgeTone = 'green' | 'blue' | 'amber' | 'red' | 'slate' | 'purple'

export const BADGE_TONE_CLASSES: Record<BadgeTone, string> = {
  green: 'bg-emerald-100 text-emerald-800',
  blue: 'bg-sky-100 text-sky-800',
  amber: 'bg-amber-100 text-amber-800',
  red: 'bg-rose-100 text-rose-800',
  slate: 'bg-slate-200 text-slate-700',
  purple: 'bg-violet-100 text-violet-800',
}

export const VEHICLE_STATUS_LABEL: Record<VehicleStatus, string> = {
  AVAILABLE: 'Available',
  RENTED: 'Rented',
  IN_MAINTENANCE: 'In Maintenance',
  OUT_OF_SERVICE: 'Out of Service',
  RETIRED: 'Retired',
}

export const VEHICLE_STATUS_TONE: Record<VehicleStatus, BadgeTone> = {
  AVAILABLE: 'green',
  RENTED: 'blue',
  IN_MAINTENANCE: 'amber',
  OUT_OF_SERVICE: 'red',
  RETIRED: 'slate',
}

export const PRICING_TIER_LABEL: Record<PricingTier, string> = {
  ECONOMY: 'Economy',
  STANDARD: 'Standard',
  PREMIUM: 'Premium',
  LUXURY: 'Luxury',
}

export const PRICING_TIER_GRADIENT: Record<PricingTier, string> = {
  ECONOMY: 'from-teal-400 to-emerald-600',
  STANDARD: 'from-sky-400 to-blue-600',
  PREMIUM: 'from-violet-400 to-purple-700',
  LUXURY: 'from-amber-300 to-yellow-600',
}

export const RESERVATION_STATUS_LABEL: Record<ReservationStatus, string> = {
  RESERVED: 'Reserved',
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

export const RESERVATION_STATUS_TONE: Record<ReservationStatus, BadgeTone> = {
  RESERVED: 'blue',
  ACTIVE: 'amber',
  COMPLETED: 'green',
  CANCELLED: 'red',
}

export const SERVICE_TYPE_LABEL: Record<ServiceType, string> = {
  OIL_CHANGE: 'Oil Change',
  TIRE_ROTATION: 'Tire Rotation',
  BRAKE_SERVICE: 'Brake Service',
  INSPECTION: 'Inspection',
}

export const ALERT_STATUS_LABEL: Record<AlertStatus, string> = {
  OPEN: 'Open',
  RESOLVED: 'Resolved',
  DISMISSED: 'Dismissed',
}

export const ALERT_STATUS_TONE: Record<AlertStatus, BadgeTone> = {
  OPEN: 'amber',
  RESOLVED: 'green',
  DISMISSED: 'slate',
}

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  PENDING: 'Pending',
  REQUIRES_ACTION: 'Requires Action',
  SUCCEEDED: 'Succeeded',
  FAILED: 'Failed',
  CANCELED: 'Canceled',
}

export const PAYMENT_STATUS_TONE: Record<PaymentStatus, BadgeTone> = {
  PENDING: 'blue',
  REQUIRES_ACTION: 'amber',
  SUCCEEDED: 'green',
  FAILED: 'red',
  CANCELED: 'slate',
}

export const ROLE_LABEL: Record<Role, string> = {
  CUSTOMER: 'Customer',
  FLEET_AGENT: 'Fleet Agent',
  ADMIN: 'Admin',
}
