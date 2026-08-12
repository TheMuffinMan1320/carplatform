import type { VehicleStatus, PricingTier } from '../types/vehicle'
import type { ReservationStatus } from '../types/reservation'
import type { ServiceType, AlertStatus } from '../types/maintenance'
import type { PaymentStatus } from '../types/payment'
import type { Role } from '../types/user'

export type BadgeTone = 'green' | 'blue' | 'amber' | 'red' | 'slate' | 'purple'

export const BADGE_TONE_CLASSES: Record<BadgeTone, string> = {
  green: 'border-[#1f8b4c]/30 bg-[#e2f3e8] text-[#1f8b4c]',
  blue: 'border-[#2f6fed]/25 bg-[#e4ecfd] text-[#2f6fed]',
  amber: 'border-[#a5751f]/30 bg-[#f6ecda] text-[#a5751f]',
  red: 'border-[#b3402c]/25 bg-[#fbe7e2] text-[#b3402c]',
  slate: 'border-ink/15 bg-vellum-dim text-ink-soft',
  purple: 'border-[#5b4fc4]/25 bg-[#e9e6fa] text-[#5b4fc4]',
}

export const BADGE_DOT_CLASSES: Record<BadgeTone, string> = {
  green: 'bg-[#1f8b4c]',
  blue: 'bg-[#2f6fed]',
  amber: 'bg-[#a5751f]',
  red: 'bg-[#b3402c]',
  slate: 'bg-ink-faint',
  purple: 'bg-[#5b4fc4]',
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

/** Tier accent used to tint the vehicle blueprint stroke and rate figure — data color, not decoration. */
export const PRICING_TIER_ACCENT: Record<PricingTier, string> = {
  ECONOMY: '#1f8b4c',
  STANDARD: '#2f6fed',
  PREMIUM: '#5b4fc4',
  LUXURY: '#a5751f',
}

export const PRICING_TIER_SILHOUETTE: Record<PricingTier, 'compact' | 'executive'> = {
  ECONOMY: 'compact',
  STANDARD: 'compact',
  PREMIUM: 'executive',
  LUXURY: 'executive',
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
