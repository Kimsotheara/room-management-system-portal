# Room Management Portal

A web-based admin portal for managing a hotel / property: rooms and room types,
guests, bookings, services, promotions, and the staff (users & roles) who operate
the system. It is the **front-end** only — it talks to a separate backend REST API
(default `http://localhost:8080`) for all data.

Built with **Nuxt 3**, **Vue 3** (Composition API), **TypeScript**, **Pinia**, and
**Tailwind CSS**.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Requirements](#requirements)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Architecture Overview](#architecture-overview)
- [Authentication & Authorization](#authentication--authorization)
- [Features](#features)
- [API Integration Reference](#api-integration-reference)
- [Troubleshooting](#troubleshooting)

---

## Tech Stack

| Layer            | Technology                                   |
|------------------|----------------------------------------------|
| Framework        | [Nuxt 3](https://nuxt.com) (Vue 3, SSR-ready)|
| Language         | TypeScript (strict mode)                     |
| State management | [Pinia](https://pinia.vuejs.org) (`@pinia/nuxt`) |
| Styling          | [Tailwind CSS](https://tailwindcss.com) (`@nuxtjs/tailwindcss`) |
| Fonts            | Inter (loaded from Google Fonts)             |
| HTTP client      | Nuxt `$fetch` wrapped in a custom composable |

---

## Requirements

- **Node.js 22** (pinned in `.nvmrc`). Older versions (e.g. 20.8) will fail to
  start because Nuxt's CLI dependencies require APIs added in Node 20.12+.
- **npm** (ships with Node).
- A running **backend API** (see [Environment Variables](#environment-variables)).

If you use [nvm](https://github.com/nvm-sh/nvm):

```bash
nvm use        # reads .nvmrc → Node 22
```

---

## Quick Start

```bash
# 1. Use the correct Node version
nvm use                 # or install/switch to Node 22 manually

# 2. Install dependencies
npm install

# 3. Configure the API URL
cp .env.example .env    # then edit if your backend isn't on localhost:8080

# 4. Start the dev server
npm run dev
```

The app runs at **http://localhost:3000**.

---

## Features

Each feature is a page under `/dashboard`, backed by a Pinia store and a set of
modal components. Common UI conventions across all feature pages:

- **Paginated lists** with a per-page selector (`components/ui/Pagination.vue`).
- **Debounced search** (~400 ms) and status/category filters.
- **Create/Edit modals** built on the shared `components/ui/Modal.vue`.
- **Confirm dialogs** for destructive actions (`components/ui/ConfirmDialog.vue`).
- **Toast notifications** (top-right, auto-dismiss) for success/error feedback.

### 1. Dashboard — `/dashboard`
The landing screen after login. Surfaces an at-a-glance operational summary:

- **Stats cards** (`components/dashboard/StatsCard.vue`) — key metrics pulled from
  `/api/reports/dashboard` (e.g. occupancy, today's check-ins, revenue).
- **Quick Booking** (`components/dashboard/QuickBooking.vue`) — a shortcut to
  start a new reservation without leaving the dashboard.
- **Activity Feed** (`components/dashboard/ActivityFeed.vue`) — recent system
  activity.

### 2. Rooms — `/dashboard/rooms`
Manage individual physical rooms.

- Create / edit / delete rooms (`components/rooms/RoomFormModal.vue`).
- Each room has a **status** shown as a colored badge
  (`components/rooms/RoomStatusBadge.vue`): `AVAILABLE`, `BOOKING`, `OCCUPIED`,
  `MAINTENANCE`, `CLEANING`.
- **Room images** — upload and preview photos
  (`components/rooms/RoomImage.vue`, `RoomImageModal.vue`,
  `composables/useRoomImageSrc.ts`).
- Status helpers live in `composables/useRoomStatus.ts`.

### 3. Room Types — `/dashboard/room-types`
Manage the categories of rooms (e.g. *Single*, *Deluxe*, *Suite*) and their base
rates. These types are referenced by rooms, reservations, and promotions.

- Create / edit / delete room types (`components/roomTypes/RoomTypeFormModal.vue`).

### 4. Guests — `/dashboard/guests`
Maintain the guest directory.

- Create / edit guests (`components/guests/GuestFormModal.vue`).
- **Nationality** picker (`components/ui/NationalitySelect.vue`).
- **Guest photo / ID image** support
  (`components/guests/GuestImage.vue`, `composables/useGuestImageSrc.ts`).
- Server-side filtering via `POST /api/guests/list/filter`.

### 5. Bookings (Reservations) — `/dashboard/bookings`
The core operational feature: create and manage reservations through their full
lifecycle.

- **Tabs by status** to triage bookings.
- **Create reservation** (`components/reservations/ReservationFormModal.vue`):
  search for a guest, choose check-in/check-out dates, and add one or more rooms
  as dynamic rows.
- **Reservation detail** (`components/reservations/ReservationDetailModal.vue`) —
  a 4-tab modal:
  - **Overview** — guest, dates, rooms, totals.
  - **Services** — add/remove add-on services for the stay.
  - **Payment** — record payments; status flows `UNPAID → PARTIAL → PAID`.
  - **Invoice** — view/generate the invoice.
- **Lifecycle:** `CONFIRMED → CHECKED_IN → CHECKED_OUT`. A booking can be
  **cancelled** while `CONFIRMED` or `CHECKED_IN`.

### 6. Services — `/dashboard/services`
Manage the catalog of add-on services that can be attached to a reservation
(e.g. breakfast, laundry, airport pickup).

- Create / edit / delete services (`components/services/ServiceFormModal.vue`).
- Services are consumed in the Bookings detail via **service usages**.

### 7. Promotions — `/dashboard/promotions`
Manage discounts and which room types they apply to.

- Create / edit promotions (`components/promotions/PromotionFormModal.vue`).
  - Supports a **permanent** flag (no end date) and **percentage** discounts.
  - Note: for `PERCENT` promotions the API stores a ratio (`0.20` = 20%); the
    form displays it ×100 and submits ÷100.
- **Assign room types** to a promotion
  (`components/promotions/PromotionRoomTypesModal.vue`).

### 8. Users — `/dashboard/users`
Manage staff accounts that can log into the portal.

- Create / edit users (`components/users/UserFormModal.vue`).
- **Assign roles** to a user (`components/users/AssignRoleModal.vue`).
- Server-side filtering via `POST /api/users/list/filter`.

### 9. Roles — `/dashboard/roles`
Define roles and the permissions attached to them. Roles drive the
permission-based UI described in [Authorization](#authentication--authorization).

- Create / edit roles and their permissions (`components/roles/RoleFormModal.vue`).

### 10. Reports — `/dashboard/reports`
Business reporting backed by `stores/reports.ts`:

- **Dashboard summary** — `GET /api/reports/dashboard`.
- **Revenue report** — `GET /api/reports/revenue?from=&to=` for a date range.
- **Reservation report** — `GET /api/reports/reservations?from=&to=`.

### 11. Settings — `/dashboard/settings`
Account / application settings for the current user.

---

## API Integration Reference

All endpoints are relative to `NUXT_PUBLIC_API_BASE_URL`. Responses use the
`ApiResponse<T>` envelope; lists use a paginated response.

### Pagination
Paginated list endpoints accept a `PageAbleRequest<Filter>` body and return a page
object. (Note: page numbers in the filter request are **1-based**.)

### Key endpoints

| Area         | Endpoint(s)                                                        |
|--------------|-------------------------------------------------------------------|
| Auth         | `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout`, `GET /api/auth/me` |
| Users        | CRUD + `POST /api/users/list/filter`                              |
| Roles        | CRUD under `/api/roles`                                           |
| Rooms        | CRUD under `/api/rooms` (+ image upload)                          |
| Room Types   | CRUD under `/api/room-types`                                      |
| Guests       | CRUD + `POST /api/guests/list/filter`                             |
| Services     | CRUD under `/api/services`                                        |
| Service usage| `POST /api/service-usages`, `DELETE /api/service-usages/{id}`     |
| Promotions   | CRUD under `/api/promotions`; room types via `/api/promotion-room-types/promotion/{id}` |
| Reservations | `GET`/`POST /api/reservations`; `POST /{id}/check-in`, `/{id}/check-out`, `/{id}/cancel`, `/{id}/payments`; `GET /{id}/invoice` |
| Reports      | `GET /api/reports/dashboard`, `/api/reports/revenue`, `/api/reports/reservations` |

> Some routes may require specific permission codes on the backend; the UI hides
> actions the current user lacks permission for.
