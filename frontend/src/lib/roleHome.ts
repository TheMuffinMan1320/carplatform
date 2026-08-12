import type { Role } from '../types/user'

export function homePathForRole(role: Role): string {
  switch (role) {
    case 'ADMIN':
      return '/admin'
    case 'FLEET_AGENT':
      return '/fleet/vehicles'
    case 'CUSTOMER':
      return '/my/reservations'
  }
}
