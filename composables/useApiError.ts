/**
 * Normalises an unknown error (Nuxt $fetch error, Error, or plain object)
 * into a user-facing message. Prefers the API's `data.message` payload.
 */
export function getApiError(err: unknown, fallback = 'Something went wrong'): string {
  const e = err as { data?: { message?: string }; message?: string }
  return e?.data?.message || e?.message || fallback
}
