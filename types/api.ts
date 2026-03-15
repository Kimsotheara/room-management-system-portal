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
