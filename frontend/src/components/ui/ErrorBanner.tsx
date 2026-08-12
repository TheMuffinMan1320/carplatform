import { friendlyErrorMessage } from '../../lib/errorMapping'

export function ErrorBanner({ error }: { error: unknown }) {
  return (
    <div className="flex items-start gap-2.5 rounded-[3px] border border-[#b3402c]/30 bg-[#fbe7e2] px-4 py-3 text-sm text-[#8f3222]">
      <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#b3402c]" />
      {friendlyErrorMessage(error)}
    </div>
  )
}
