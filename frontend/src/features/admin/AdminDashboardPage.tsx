import { Link } from 'react-router-dom'
import { Card } from '../../components/ui/Card'

const LINKS = [
  { to: '/fleet/vehicles', title: 'Vehicles', description: 'Manage fleet vehicles across every location.' },
  { to: '/fleet/reservations', title: 'Reservations', description: 'Activate, complete, and cancel bookings.' },
  { to: '/fleet/maintenance-alerts', title: 'Maintenance Alerts', description: 'Vehicles due for service.' },
  { to: '/maintenance-rules', title: 'Maintenance Rules', description: 'Configure mileage and time intervals.' },
  { to: '/admin/locations', title: 'Locations', description: 'Add, edit, and deactivate rental locations.' },
  { to: '/admin/users', title: 'Users', description: 'Create fleet agents and admins.' },
]

export function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-ink-soft">Unscoped access across all locations.</p>
      </div>
      <div className="dim-rule" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LINKS.map((link) => (
          <Link key={link.to} to={link.to}>
            <Card className="h-full p-5 transition-shadow hover:shadow-[0_4px_16px_-4px_rgba(22,33,44,0.18)]">
              <h2 className="font-display text-base font-semibold text-ink">{link.title}</h2>
              <p className="mt-1 text-sm text-ink-soft">{link.description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
