import { getApiError } from '../api/client'

const FRIENDLY_MESSAGES: Partial<Record<string, string>> = {
  RESOURCE_NOT_FOUND: 'That item could not be found.',
  FORBIDDEN: "You don't have permission to do that — likely because it belongs to a different location.",
  INVALID_CREDENTIALS: 'Incorrect email or password.',
  ACCOUNT_DISABLED: 'This account has been disabled.',
  INVALID_REFRESH_TOKEN: 'Your session is invalid. Please log in again.',
  REFRESH_TOKEN_REUSE_DETECTED:
    'Your session was used elsewhere and has been revoked for safety. Please log in again.',
  REFRESH_TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
  EMAIL_ALREADY_REGISTERED: 'An account with that email already exists.',
  VIN_ALREADY_REGISTERED: 'A vehicle with that VIN already exists.',
  VEHICLE_NOT_AVAILABLE: 'This vehicle is already booked for those dates.',
  VEHICLE_NOT_BOOKABLE: 'This vehicle is not currently available for booking.',
  INVALID_DATE_RANGE: 'The selected date range is invalid.',
  CANNOT_CANCEL_ACTIVE_RESERVATION: 'An active reservation cannot be cancelled once picked up.',
  ILLEGAL_STATE_TRANSITION: 'That action is not valid for the current status.',
  RESERVATION_NOT_PAYABLE: 'This reservation cannot be paid for right now.',
  ALREADY_PAID: 'This reservation has already been paid.',
  IDEMPOTENCY_CONFLICT: 'A conflicting request with the same key was already processed.',
  PAYMENT_GATEWAY_ERROR:
    'The payment gateway rejected this request — expected in this demo without a configured Stripe key.',
  VALIDATION_FAILED: 'Please fix the highlighted fields.',
  DATA_INTEGRITY_VIOLATION: 'That change conflicts with existing data.',
  INTERNAL_ERROR: 'Something went wrong on the server.',
}

export function friendlyErrorMessage(error: unknown): string {
  const apiError = getApiError(error)
  if (!apiError) return 'Something went wrong. Please try again.'
  return FRIENDLY_MESSAGES[apiError.code] ?? apiError.message
}

export function isForbidden(error: unknown): boolean {
  return getApiError(error)?.code === 'FORBIDDEN'
}

export function applyServerErrors(
  error: unknown,
  setFieldError: (field: string, message: string) => void,
): string | null {
  const apiError = getApiError(error)
  if (apiError?.validationErrors?.length) {
    apiError.validationErrors.forEach((e) => setFieldError(e.field, e.message))
    return null
  }
  return friendlyErrorMessage(error)
}
