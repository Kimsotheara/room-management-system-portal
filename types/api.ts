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
  imageId:      number
  imageData?:   string   // may be absent; use GET /api/rooms/{id}/images/{imageId}/file
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
  RESERVED    = 'RESERVED',
  OCCUPIED    = 'OCCUPIED',
  CLEANING    = 'CLEANING',
  MAINTENANCE = 'MAINTENANCE',
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

// ── Service ────────────────────────────────────────────────────────────────────

export interface ServiceResponse {
  id: number
  name: string
  price: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateServiceRequest {
  name?: string
  price?: number
}

export interface UpdateServiceRequest {
  name?: string
  price?: number
  isActive?: boolean
}

// ── Promotion ──────────────────────────────────────────────────────────────────

export interface PromotionResponse {
  id: number
  name: string
  discountType: string
  discountValue: number
  effectiveDate: string
  expireDate?: string
  isActive: boolean
  roomTypes?: RoomTypeResponse[]
  createdAt: string
  updatedAt: string
}

export interface CreatePromotionRequest {
  name?: string
  discountType?: string
  discountValue?: number
  effectiveDate?: string   // ISO 8601
  expireDate?: string      // ISO 8601
}

export interface UpdatePromotionRequest {
  name?: string
  discountType?: string
  discountValue?: number
  effectiveDate?: string
  expireDate?: string
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
  profileImage?: string     // present only if returned inline; use GET /api/guests/{id}/profile-image for binary
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
  profileImage?: string     // Base64
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
  profileImage?: string     // Base64; send empty string to remove
}

export interface GuestFilterRequest {
  firstName?: string
  lastName?: string
  email?: string
  phoneNumber?: string
  nationality?: string
  identityType?: string
  isActive?: boolean
}

// ── Reservation ────────────────────────────────────────────────────────────────

export interface ReservationRoomRequest {
  roomId: number
  promotionId?: number
}

export interface CreateReservationRequest {
  guestId: number
  checkInDate: string       // ISO 8601
  checkOutDate: string      // ISO 8601
  rooms?: ReservationRoomRequest[]
  notes?: string
}

export interface UpdateReservationRequest {
  notes?: string
}

export interface PaymentRequest {
  reservationId: number
  paymentMethod: string
  paymentType: string
  amount: number
}

export interface PaymentResponse {
  id: number
  reservationId: number
  paymentMethod: string
  amount: number
  paymentDate: string
  paymentType: string
  isActive: boolean
  createdAt: string
}

export interface PaymentLineDto {
  id: number
  paymentMethod: string
  paymentType: string
  amount: number
  paymentDate: string
}

export interface ReservationRoomResponse {
  id: number
  roomId: number
  roomNumber: string
  roomTypeName: string
  promotionId?: number
  promotionName?: string
  basePrice: number
  discountAmount: number
  finalPrice: number
}

export interface ServiceUsageResponse {
  id: number
  reservationId: number
  serviceId: number
  serviceName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  createdAt: string
}

export interface ReservationResponse {
  id: number
  guestId: number
  guestName: string
  checkInDate: string
  checkOutDate: string
  nights: number
  totalAmount: number
  paidAmount: number
  balanceAmount: number
  paymentStatus: string
  status: string
  notes?: string
  rooms: ReservationRoomResponse[]
  serviceChargeTotal: number
  serviceUsages: ServiceUsageResponse[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface AddServiceUsageRequest {
  reservationId: number
  serviceId: number
  quantity: number
}

export interface RoomLineDto {
  roomNumber: string
  roomTypeName: string
  nights: number
  ratePerNight: number
  basePrice: number
  promotionName?: string
  discountAmount: number
  finalPrice: number
}

export interface ServiceLineDto {
  serviceName: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface InvoiceResponse {
  reservationId: number
  generatedAt: string
  guestName: string
  guestEmail: string
  guestPhone: string
  checkInDate: string
  checkOutDate: string
  nights: number
  reservationStatus: string
  notes?: string
  roomCharges: RoomLineDto[]
  roomChargeTotal: number
  serviceCharges: ServiceLineDto[]
  serviceChargeTotal: number
  payments: PaymentLineDto[]
  totalAmount: number
  paidAmount: number
  balanceAmount: number
  paymentStatus: string
}

// ── Promotion Room Type ────────────────────────────────────────────────────────

export interface AssignPromotionRoomTypeRequest {
  promotionId:  number
  roomTypeIds:  number[]
}

export interface PromotionRoomTypeResponse {
  id: number
  promotionId: number
  promotionName: string
  roomTypeId: number
  roomTypeName: string
  isActive: boolean
  createdAt: string
}
// ── Reports ────────────────────────────────────────────────────────────────────

export interface PaymentMethodSummaryDto {
  paymentMethod: string
  count: number
  amount: number
}

export interface DashboardResponse {
  totalRooms: number
  availableRooms: number
  reservedRooms: number
  occupiedRooms: number
  maintenanceRooms: number
  cleaningRooms: number
  occupancyRate: number
  todayCheckIns: number
  todayCheckOuts: number
  confirmedReservations: number
  checkedInReservations: number
  pendingPaymentReservations: number
  monthlyRevenue: number
  monthlyPaid: number
  monthlyBalance: number
}

export interface RevenueReportResponse {
  from: string
  to: string
  totalRoomCharges: number
  totalServiceCharges: number
  totalRevenue: number
  totalPaid: number
  totalBalance: number
  byPaymentMethod: PaymentMethodSummaryDto[]
}

export interface ReservationReportResponse {
  from: string
  to: string
  total: number
  confirmed: number
  checkedIn: number
  checkedOut: number
  cancelled: number
}
