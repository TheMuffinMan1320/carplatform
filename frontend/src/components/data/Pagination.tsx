import { Button } from '../ui/Button'

interface PaginationProps {
  page: number
  totalPages: number
  totalElements: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, totalPages, totalElements, onPageChange }: PaginationProps) {
  if (totalElements === 0) return null
  return (
    <div className="flex items-center justify-between border-t border-ink/10 px-1 py-3 font-mono text-[11px] uppercase tracking-[0.06em] text-ink-soft">
      <span>
        Page {page + 1} / {Math.max(totalPages, 1)} · {totalElements} total
      </span>
      <div className="flex gap-2">
        <Button variant="secondary" disabled={page <= 0} onClick={() => onPageChange(page - 1)}>
          Previous
        </Button>
        <Button variant="secondary" disabled={page + 1 >= totalPages} onClick={() => onPageChange(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  )
}
