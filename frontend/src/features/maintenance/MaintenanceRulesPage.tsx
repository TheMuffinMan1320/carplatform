import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useMaintenanceRules } from '../../hooks/useMaintenance'
import { SkeletonRows } from '../../components/ui/Skeleton'
import { ErrorBanner } from '../../components/ui/ErrorBanner'
import { DataTable, type Column } from '../../components/data/DataTable'
import { SERVICE_TYPE_LABEL } from '../../lib/enumLabels'
import { MaintenanceRuleEditModal } from './MaintenanceRuleEditModal'
import type { MaintenanceRuleResponse } from '../../types/maintenance'

export function MaintenanceRulesPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const [editingRule, setEditingRule] = useState<MaintenanceRuleResponse | null>(null)
  const { data: rules, isLoading, isError, error } = useMaintenanceRules()

  const columns: Column<MaintenanceRuleResponse>[] = [
    { header: 'Service', render: (r) => SERVICE_TYPE_LABEL[r.serviceType] },
    { header: 'Mileage interval', render: (r) => `${r.mileageInterval.toLocaleString()} mi` },
    { header: 'Time interval', render: (r) => `${r.timeIntervalMonths} mo` },
    ...(isAdmin
      ? [
          {
            header: '',
            render: (r: MaintenanceRuleResponse) => (
              <button onClick={() => setEditingRule(r)} className="text-sm font-medium text-slate-700 hover:underline">
                Edit
              </button>
            ),
          } satisfies Column<MaintenanceRuleResponse>,
        ]
      : []),
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Maintenance Rules</h1>
        <p className="text-slate-600">
          Mileage and time intervals that trigger maintenance alerts.
          {!isAdmin && ' Only admins can edit these.'}
        </p>
      </div>

      {isLoading && <SkeletonRows count={4} />}
      {isError && <ErrorBanner error={error} />}
      {!isLoading && !isError && rules && <DataTable columns={columns} rows={rules} rowKey={(r) => r.serviceType} />}

      {editingRule && <MaintenanceRuleEditModal rule={editingRule} onClose={() => setEditingRule(null)} />}
    </div>
  )
}
