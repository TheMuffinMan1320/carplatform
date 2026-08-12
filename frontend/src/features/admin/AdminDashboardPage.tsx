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
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-600">Unscoped access across all locations.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LINKS.map((link) => (
          <Link key={link.to} to={link.to}>
            <Card className="h-full p-5 transition-shadow hover:shadow-md">
              <h2 className="font-semibold text-slate-900">{link.title}</h2>
              <p className="mt-1 text-sm text-slate-600">{link.description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
