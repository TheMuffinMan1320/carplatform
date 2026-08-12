import { NavLink } from 'react-router-dom'
import type { Role } from '../../types/user'

interface NavItem {
  to: string
  label: string
}

const PUBLIC_ITEMS: NavItem[] = [{ to: '/vehicles', label: 'Browse' }]

const ROLE_ITEMS: Record<Role, NavItem[]> = {
  CUSTOMER: [
    { to: '/vehicles', label: 'Browse' },
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
    <nav className="flex flex-wrap items-center gap-4 sm:gap-5">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `relative py-1 font-display text-[13px] font-medium tracking-[0.01em] transition-colors ${
              isActive ? 'text-ink' : 'text-ink-faint hover:text-ink-soft'
            }`
          }
        >
          {({ isActive }) => (
            <>
              {item.label}
              {isActive && <span className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-signal" />}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
