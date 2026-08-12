import { useState } from 'react'
import { useDeleteLocation, useLocationsQuery } from '../../hooks/useLocations'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { SkeletonRows } from '../../components/ui/Skeleton'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorBanner } from '../../components/ui/ErrorBanner'
import { DataTable, type Column } from '../../components/data/DataTable'
import { Pagination } from '../../components/data/Pagination'
import { friendlyErrorMessage } from '../../lib/errorMapping'
import { useToast } from '../../components/ui/ToastProvider'
import { LocationFormModal } from './LocationFormModal'
import type { LocationResponse } from '../../types/location'

const PAGE_SIZE = 10

function DeactivateButton({ location }: { location: LocationResponse }) {
  const deleteLocation = useDeleteLocation()
  const [error, setError] = useState<string | null>(null)
  const { showToast } = useToast()
  return (
    <div className="flex flex-col gap-1">
      <Button
        variant="danger"
        className="!px-2 !py-1 text-xs"
        loading={deleteLocation.isPending}
        onClick={async () => {
          if (!confirm(`Deactivate ${location.name}?`)) return
          setError(null)
          try {
            await deleteLocation.mutateAsync(location.id)
            showToast('Location deactivated.', 'success')
          } catch (err) {
            setError(friendlyErrorMessage(err))
          }
        }}
      >
        Deactivate
      </Button>
      {error && <span className="font-mono text-[11px] text-[#b3402c]">{error}</span>}
    </div>
  )
}

export function LocationsAdminPage() {
  const [page, setPage] = useState(0)
  const [modalLocation, setModalLocation] = useState<LocationResponse | 'new' | null>(null)

  const { data, isLoading, isError, error } = useLocationsQuery({ page, size: PAGE_SIZE, sort: 'name,asc' })

  const columns: Column<LocationResponse>[] = [
    { header: 'Name', render: (l) => l.name },
    { header: 'Address', render: (l) => `${l.addressLine1}, ${l.city}, ${l.region} ${l.postalCode}` },
    { header: 'Phone', render: (l) => <span className="font-mono">{l.phone ?? '—'}</span> },
    { header: 'Active', render: (l) => <Badge tone={l.active ? 'green' : 'slate'}>{l.active ? 'Active' : 'Inactive'}</Badge> },
    {
      header: 'Actions',
      render: (l) => (
        <div className="flex flex-wrap items-start gap-2">
          <button onClick={() => setModalLocation(l)} className="font-display text-[13px] font-medium text-signal hover:underline">
            Edit
          </button>
          {l.active && <DeactivateButton location={l} />}
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Locations</h1>
          <p className="mt-1 text-sm text-ink-soft">Manage rental locations.</p>
        </div>
        <Button onClick={() => setModalLocation('new')}>+ Add Location</Button>
      </div>

      {isLoading && <SkeletonRows />}
      {isError && <ErrorBanner error={error} />}
      {!isLoading && !isError && data && data.content.length === 0 && (
        <EmptyState title="No locations yet" message="Add a location to get started." />
      )}
      {!isLoading && !isError && data && data.content.length > 0 && (
        <>
          <DataTable columns={columns} rows={data.content} rowKey={(l) => l.id} />
          <Pagination page={data.page} totalPages={data.totalPages} totalElements={data.totalElements} onPageChange={setPage} />
        </>
      )}

      {modalLocation && (
        <LocationFormModal location={modalLocation === 'new' ? undefined : modalLocation} onClose={() => setModalLocation(null)} />
      )}
    </div>
  )
}
