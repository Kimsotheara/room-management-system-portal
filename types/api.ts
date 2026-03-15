// ── Shared ────────────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean
  message?: string
  status: number
  timestamp: string
  data?: T
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  username: string
  password: string
  deviceId?: string
  deviceName?: string
  deviceType?: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
  tokenType: string
  userId: number
  username: string
  email: string
  fullName: string
  isActive: boolean
  permissionCodes: string[]
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface CurrentUser {
  userId: number
  username: string
  email: string
  fullName: string
  isActive: boolean
  roles: string[]
  permissionCodes: string[]
}

export interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: CurrentUser | null
  isAuthenticated: boolean
}

// ── Role ──────────────────────────────────────────────────────────────────────

export interface RoleResponse {
  roleId: number
  roleName: string
  roleDescription: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateRoleRequest {
  roleName: string
  roleDescription?: string
}

export interface UpdateRoleRequest {
  roleName?: string
  roleDescription?: string
  isActive?: boolean
}

// ── User ──────────────────────────────────────────────────────────────────────

export interface UserResponse {
  userId: number
  username: string
  email: string
  fullName: string
  phoneNumber: string
  isActive: boolean
  roles: RoleResponse[]
  createdAt: string
  updatedAt: string
}

export interface CreateUserRequest {
  username: string
  password: string
  email: string
  fullName?: string
  phoneNumber?: string
}

export interface UpdateUserRequest {
  email?: string
  fullName?: string
  phoneNumber?: string
  isActive?: boolean
}

export interface AssignRoleRequest {
  roleId: number
  expiresAt?: string
}

// ── Pagination ─────────────────────────────────────────────────────────────────

export interface PageAbleRequest<T> {
  pageNumber: number        // 1-based
  size: number
  sortProperty?: string
  sortDirection?: 'asc' | 'desc'
  parameter: T
}

export interface PageAbleResponse<D> {
  last: boolean
  totalPages: number
  totalElements: number
  size: number
  pageNumber: number        // 1-based
  row: number
  sortProperty: string
  sortDirection: string
  list: D[]
}

// ── User Filter ────────────────────────────────────────────────────────────────

export interface UserFilterRequest {
  username?: string
  email?: string
  fullName?: string
  phoneNumber?: string
  isActive?: boolean
  roleId?: number
}

// ── Room ───────────────────────────────────────────────────────────────────────

export interface RoomImageResponse {
  imageId: number
  imageData: string         // Base64 encoded
  displayOrder: number
}

export interface RoomTypeResponse {
  roomTypeId: number
  typeName: string
  bed: number
  price: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export enum RoomStatus {
  AVAILABLE   = 'AVAILABLE',
  BOOKING     = 'BOOKING',
  OCCUPIED    = 'OCCUPIED',
  MAINTENANCE = 'MAINTENANCE',
  CLEANING    = 'CLEANING',
}

export interface RoomResponse {
  roomId: number
  roomNumber: string
  roomType: RoomTypeResponse
  roomStatus: RoomStatus | string
  isActive: boolean
  images: RoomImageResponse[]
  createdAt: string
  updatedAt: string
}

export interface CreateRoomRequest {
  roomNumber?: string       // optional per API spec (only roomTypeId is required)
  roomTypeId: number
  roomStatus?: RoomStatus
}

export interface UpdateRoomRequest {
  roomNumber?: string
  roomTypeId?: number
  roomStatus?: RoomStatus
  isActive?: boolean
}

export interface AddRoomImagesRequest {
  images: string[]          // Base64 strings
}

export interface CreateRoomTypeRequest {
  typeName?: string
  bed?: number
  price?: number
}

export interface UpdateRoomTypeRequest {
  typeName?: string
  bed?: number
  price?: number
  isActive?: boolean
}

// ── Hotel ──────────────────────────────────────────────────────────────────────

export interface HotelResponse {
  hotelId: number
  hotelName: string
  contact: string
  address: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateHotelRequest {
  hotelName?: string
  contact?: string
  address?: string
}

export interface UpdateHotelRequest {
  hotelName?: string
  contact?: string
  address?: string
  isActive?: boolean
}

// ── Guest ──────────────────────────────────────────────────────────────────────

export interface GuestResponse {
  guestId: number
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  identityType: string
  identityNumber: string
  nationality: string
  address: string
  profileImage: string      // Base64 encoded
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateGuestRequest {
  firstName?: string
  lastName?: string
  email?: string
  phoneNumber?: string
  identityType?: string
  identityNumber?: string
  nationality?: string
  address?: string
}

export interface UpdateGuestRequest {
  firstName?: string
  lastName?: string
  email?: string
  phoneNumber?: string
  identityType?: string
  identityNumber?: string
  nationality?: string
  address?: string
  isActive?: boolean
}
