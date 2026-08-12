import { NavLink } from 'react-router-dom'
import type { Role } from '../../types/user'

interface NavItem {
  to: string
  label: string
}

const PUBLIC_ITEMS: NavItem[] = [{ to: '/vehicles', label: 'Browse Vehicles' }]

const ROLE_ITEMS: Record<Role, NavItem[]> = {
  CUSTOMER: [
    { to: '/vehicles', label: 'Browse Vehicles' },
    { to: '/my/reservations', label: 'My Reservations' },
  ],
  FLEET_AGENT: [
    { to: '/fleet/vehicles', label: 'Fleet Vehicles' },
    { to: '/fleet/reservations', label: 'Reservations' },
    { to: '/fleet/maintenance-alerts', label: 'Maintenance Alerts' },
    { to: '/maintenance-rules', label: 'Maintenance Rules' },
  ],
  ADMIN: [
    { to: '/admin', label: 'Dashboard' },
    { to: '/fleet/vehicles', label: 'Vehicles' },
    { to: '/fleet/reservations', label: 'Reservations' },
    { to: '/fleet/maintenance-alerts', label: 'Maintenance Alerts' },
    { to: '/maintenance-rules', label: 'Maintenance Rules' },
    { to: '/admin/locations', label: 'Locations' },
    { to: '/admin/users', label: 'Users' },
  ],
}

export function RoleNav({ role }: { role: Role | null }) {
  const items = role ? ROLE_ITEMS[role] : PUBLIC_ITEMS
  return (
    <nav className="flex flex-wrap items-center gap-1">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
