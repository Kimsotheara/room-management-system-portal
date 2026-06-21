import { RoomStatus } from '~/types/api'

export interface RoomStatusMeta {
  label: string
  badgeClass: string   // bg + text + ring classes for the pill badge
  dotClass: string     // rounded-full background class
  overlayClass: string // semi-transparent variant for image overlays
}

const STATUS_MAP: Record<string, RoomStatusMeta> = {
  [RoomStatus.AVAILABLE]: {
    label:        'Available',
    badgeClass:   'bg-green-50 text-green-700 ring-green-200',
    dotClass:     'bg-green-500',
    overlayClass: 'bg-green-50/90 text-green-700 ring-green-200',
  },
  [RoomStatus.RESERVED]: {
    label:        'Reserved',
    badgeClass:   'bg-blue-50 text-blue-700 ring-blue-200',
    dotClass:     'bg-blue-500',
    overlayClass: 'bg-blue-50/90 text-blue-700 ring-blue-200',
  },
  [RoomStatus.OCCUPIED]: {
    label:        'Occupied',
    badgeClass:   'bg-red-50 text-red-700 ring-red-200',
    dotClass:     'bg-red-500',
    overlayClass: 'bg-red-50/90 text-red-700 ring-red-200',
  },
  [RoomStatus.MAINTENANCE]: {
    label:        'Maintenance',
    badgeClass:   'bg-amber-50 text-amber-700 ring-amber-200',
    dotClass:     'bg-amber-500',
    overlayClass: 'bg-amber-50/90 text-amber-700 ring-amber-200',
  },
  [RoomStatus.CLEANING]: {
    label:        'Cleaning',
    badgeClass:   'bg-purple-50 text-purple-700 ring-purple-200',
    dotClass:     'bg-purple-500',
    overlayClass: 'bg-purple-50/90 text-purple-700 ring-purple-200',
  },
}

const FALLBACK: RoomStatusMeta = {
  label:        'Unknown',
  badgeClass:   'bg-gray-100 text-gray-500 ring-gray-200',
  dotClass:     'bg-gray-400',
  overlayClass: 'bg-gray-50/90 text-gray-600 ring-gray-200',
}

export function useRoomStatus() {
  function getMeta(status: string | undefined | null): RoomStatusMeta {
    if (!status) return FALLBACK
    return STATUS_MAP[status.toUpperCase()] ?? FALLBACK
  }

  function getLabel(status: string | undefined | null): string {
    return getMeta(status).label
  }

  function getBadgeClass(status: string | undefined | null): string {
    return getMeta(status).badgeClass
  }

  function getDotClass(status: string | undefined | null): string {
    return getMeta(status).dotClass
  }

  function getOverlayClass(status: string | undefined | null): string {
    return getMeta(status).overlayClass
  }

  /** All statuses as options for a <select> */
  const statusOptions = Object.entries(STATUS_MAP).map(([value, meta]) => ({
    value,
    label: meta.label,
  }))

  return { getMeta, getLabel, getBadgeClass, getDotClass, getOverlayClass, statusOptions }
}
