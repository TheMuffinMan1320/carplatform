import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { PublicOnlyRoute } from './components/guards/PublicOnlyRoute'
import { ProtectedRoute } from './components/guards/ProtectedRoute'
import { LoginPage } from './features/auth/LoginPage'
import { RegisterPage } from './features/auth/RegisterPage'
import { VehicleBrowsePage } from './features/vehicles/VehicleBrowsePage'
import { VehicleDetailPage } from './features/vehicles/VehicleDetailPage'
import { MyReservationsPage } from './features/reservations/MyReservationsPage'
import { ReservationDetailPage } from './features/reservations/ReservationDetailPage'
import { FleetVehiclesPage } from './features/vehicles/FleetVehiclesPage'
import { FleetReservationsPage } from './features/reservations/FleetReservationsPage'
import { VehicleMaintenancePage } from './features/maintenance/VehicleMaintenancePage'
import { MaintenanceAlertsPage } from './features/maintenance/MaintenanceAlertsPage'
import { MaintenanceRulesPage } from './features/maintenance/MaintenanceRulesPage'
import { LocationsAdminPage } from './features/locations/LocationsAdminPage'
import { UsersAdminPage } from './features/users/UsersAdminPage'
import { AdminDashboardPage } from './features/admin/AdminDashboardPage'

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Navigate to="/vehicles" replace />} />
        <Route path="/vehicles" element={<VehicleBrowsePage />} />
        <Route path="/vehicles/:id" element={<VehicleDetailPage />} />
        <Route
          path="/my/reservations"
          element={
            <ProtectedRoute roles={['CUSTOMER']}>
              <MyReservationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my/reservations/:id"
          element={
            <ProtectedRoute roles={['CUSTOMER']}>
              <ReservationDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/fleet/vehicles"
          element={
            <ProtectedRoute roles={['FLEET_AGENT', 'ADMIN']}>
              <FleetVehiclesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/fleet/vehicles/:vehicleId/maintenance"
          element={
            <ProtectedRoute roles={['FLEET_AGENT', 'ADMIN']}>
              <VehicleMaintenancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/fleet/reservations"
          element={
            <ProtectedRoute roles={['FLEET_AGENT', 'ADMIN']}>
              <FleetReservationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/fleet/maintenance-alerts"
          element={
            <ProtectedRoute roles={['FLEET_AGENT', 'ADMIN']}>
              <MaintenanceAlertsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/maintenance-rules"
          element={
            <ProtectedRoute roles={['FLEET_AGENT', 'ADMIN']}>
              <MaintenanceRulesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/locations"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <LocationsAdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <UsersAdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <RegisterPage />
            </PublicOnlyRoute>
          }
        />
        <Route path="*" element={<Navigate to="/vehicles" replace />} />
      </Route>
    </Routes>
  )
}
