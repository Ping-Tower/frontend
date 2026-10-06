export function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="px-1 font-sans text-xs text-status-down">{message}</p>
}
