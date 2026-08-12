import { useState } from 'react'
import { useAdminUsers } from '../../hooks/useUsers'
import { useLocationsMap } from '../../hooks/useLocations'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { SkeletonRows } from '../../components/ui/Skeleton'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorBanner } from '../../components/ui/ErrorBanner'
import { DataTable, type Column } from '../../components/data/DataTable'
import { Pagination } from '../../components/data/Pagination'
import { ROLE_LABEL } from '../../lib/enumLabels'
import { CreateUserModal } from './CreateUserModal'
import type { UserSummary } from '../../types/user'

const PAGE_SIZE = 10

export function UsersAdminPage() {
  const [page, setPage] = useState(0)
  const [showCreate, setShowCreate] = useState(false)
  const { data, isLoading, isError, error } = useAdminUsers({ page, size: PAGE_SIZE, sort: 'email,asc' })
  const { map: locationsMap } = useLocationsMap()

  const columns: Column<UserSummary>[] = [
    { header: 'Name', render: (u) => `${u.firstName} ${u.lastName}` },
    { header: 'Email', render: (u) => u.email },
    { header: 'Role', render: (u) => <Badge tone="purple">{ROLE_LABEL[u.role]}</Badge> },
    { header: 'Location', render: (u) => (u.locationId ? (locationsMap.get(u.locationId) ?? '—') : '—') },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Users</h1>
          <p className="mt-1 text-sm text-ink-soft">All accounts across the platform.</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>+ Add User</Button>
      </div>

      {isLoading && <SkeletonRows />}
      {isError && <ErrorBanner error={error} />}
      {!isLoading && !isError && data && data.content.length === 0 && <EmptyState title="No users yet" />}
      {!isLoading && !isError && data && data.content.length > 0 && (
        <>
          <DataTable columns={columns} rows={data.content} rowKey={(u) => u.id} />
          <Pagination page={data.page} totalPages={data.totalPages} totalElements={data.totalElements} onPageChange={setPage} />
        </>
      )}

      {showCreate && <CreateUserModal onClose={() => setShowCreate(false)} />}
    </div>
  )
}
