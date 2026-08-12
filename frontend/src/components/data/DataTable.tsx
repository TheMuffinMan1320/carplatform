import type { ReactNode } from 'react'

export interface Column<T> {
  header: string
  render: (row: T) => ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string
}

export function DataTable<T>({ columns, rows, rowKey }: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-[3px] border border-ink/12 bg-white">
      <table className="min-w-full divide-y divide-ink/10 text-sm">
        <thead className="bg-vellum-dim">
          <tr>
            {columns.map((col) => (
              <th
                key={col.header}
                className="whitespace-nowrap px-4 py-2.5 text-left font-mono text-[11px] font-medium uppercase tracking-[0.07em] text-ink-soft"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/8">
          {rows.map((row) => (
            <tr key={rowKey(row)} className="transition-colors hover:bg-vellum">
              {columns.map((col) => (
                <td key={col.header} className={`px-4 py-2.5 align-middle text-ink ${col.className ?? ''}`}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
