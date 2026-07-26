/**
 * Central permission catalogue. Backend uses RESOURCE_ACTION uppercase codes
 * (e.g. USER_READ). Adjust the resource tokens here if the backend differs —
 * this is the single source of truth for the whole UI.
 */
export const PERM = {
  USER:        { READ: 'USER_READ',        CREATE: 'USER_CREATE',        UPDATE: 'USER_UPDATE',        DELETE: 'USER_DELETE' },
  ROLE:        { READ: 'ROLE_READ',        CREATE: 'ROLE_CREATE',        UPDATE: 'ROLE_UPDATE',        DELETE: 'ROLE_DELETE' },
  ROOM:        { READ: 'ROOM_READ',        CREATE: 'ROOM_CREATE',        UPDATE: 'ROOM_UPDATE',        DELETE: 'ROOM_DELETE' },
  ROOM_TYPE:   { READ: 'ROOM_TYPE_READ',   CREATE: 'ROOM_TYPE_CREATE',   UPDATE: 'ROOM_TYPE_UPDATE',   DELETE: 'ROOM_TYPE_DELETE' },
  GUEST:       { READ: 'GUEST_READ',       CREATE: 'GUEST_CREATE',       UPDATE: 'GUEST_UPDATE',       DELETE: 'GUEST_DELETE' },
  RESERVATION: { READ: 'RESERVATION_READ', CREATE: 'RESERVATION_CREATE', UPDATE: 'RESERVATION_UPDATE', DELETE: 'RESERVATION_DELETE' },
  SERVICE:     { READ: 'SERVICE_READ',     CREATE: 'SERVICE_CREATE',     UPDATE: 'SERVICE_UPDATE',     DELETE: 'SERVICE_DELETE' },
  PROMOTION:   { READ: 'PROMOTION_READ',   CREATE: 'PROMOTION_CREATE',   UPDATE: 'PROMOTION_UPDATE',   DELETE: 'PROMOTION_DELETE' },
  PAYMENT:     { READ: 'PAYMENT_READ',     CREATE: 'PAYMENT_CREATE',     DELETE: 'PAYMENT_DELETE' },
  HOTEL:       { READ: 'HOTEL_READ',       CREATE: 'HOTEL_CREATE',       UPDATE: 'HOTEL_UPDATE',       DELETE: 'HOTEL_DELETE' },
  REPORT:      { READ: 'REPORT_READ' },
} as const

/**
 * can(code) — true if the current user holds the permission (or any of the
 * given codes). Admins bypass all checks. Passing no code returns true.
 */
export const usePermissions = () => {
  const auth = useAuthStore()

  const can = (code?: string | string[]): boolean => {
    if (!code) return true
    if (auth.isAdmin) return true
    const codes = Array.isArray(code) ? code : [code]
    return codes.some((c) => auth.hasPermission(c))
  }

  return { can }
}
