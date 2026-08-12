import { friendlyErrorMessage } from '../../lib/errorMapping'

export function ErrorBanner({ error }: { error: unknown }) {
  return (
    <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      {friendlyErrorMessage(error)}
    </div>
  )
}
