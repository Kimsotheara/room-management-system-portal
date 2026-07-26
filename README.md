# Room Management Portal

A web-based admin portal for managing a hotel / property: hotels, rooms and room
types, guests, bookings, services, promotions, payments, and the staff (users &
roles) who operate the system. It is the **front-end** only — it talks to a
separate backend REST API (default `http://localhost:8080`) for all data.

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

## Environment Variables

Configuration is read at runtime through Nuxt's `runtimeConfig.public`. Copy
`.env.example` to `.env` and adjust as needed.

| Variable                    | Default                  | Description                                  |
|-----------------------------|--------------------------|----------------------------------------------|
| `NUXT_PUBLIC_API_BASE_URL`  | `http://localhost:8080`  | Base URL of the backend REST API. All requests are made relative to this. |

The value is exposed to the app as `config.public.apiBaseUrl` (see
`nuxt.config.ts`) and consumed by `composables/useApi.ts`.

---

## Available Scripts

| Script              | What it does                                             |
|---------------------|---------------------------------------------------------|
| `npm run dev`       | Start the Nuxt dev server with HMR at `:3000`.          |
| `npm run build`     | Production build (`.output/`).                          |
| `npm run preview`   | Preview the production build locally.                   |
| `npm run generate`  | Static-site generation.                                 |
| `npm run postinstall` | Runs `nuxt prepare` (types) — invoked automatically by npm. |

---

## Project Structure

```
.
├─ assets/css/         # Tailwind entry + custom classes (.btn-primary, .input-field, .card, .badge-*)
├─ components/         # Vue components, grouped by domain
│  ├─ ui/              #   Modal, ConfirmDialog, Pagination, Toast, NationalitySelect
│  ├─ layout/          #   Navbar, Sidebar
│  ├─ auth/            #   FormInput, FormAlert, FormButton (Nuxt auto-import: AuthFormInput, …)
│  ├─ dashboard/       #   StatsCard, QuickBooking, ActivityFeed
│  └─ <domain>/        #   hotels, rooms, roomTypes, guests, reservations, services, promotions, users, roles
├─ composables/        # useApi, useToast, useApiError, usePermissions, useRoomStatus, image src helpers
├─ layouts/            # default (app shell) + auth (login)
├─ middleware/         # auth.ts — route protection + permission gate
├─ pages/              # File-based routes (login + /dashboard/*)
├─ plugins/            # auth.client.ts — restores session from localStorage
├─ stores/             # Pinia stores, one per resource
└─ types/api.ts        # Shared request/response DTO types
```

---

## Architecture Overview

- **State** lives in **Pinia stores** (`stores/`), one per resource: `auth`,
  `users`, `roles`, `hotels`, `rooms`, `roomTypes`, `guests`, `services`,
  `promotions`, `reservations`, `reports`. Each exposes `fetch`/`create`/`update`/
  `remove` actions plus `loading`/`submitting`/`error` state.
- **API access** is centralized in **`composables/useApi.ts`** → `apiFetch()`. It
  attaches the JWT `Authorization` header, prefixes `apiBaseUrl`, and transparently
  retries once after refreshing the token on a `401`. Responses use the
  `ApiResponse<T>` envelope (`{ success, message, data, status, timestamp }`).
- **Shared composables** keep pages thin and consistent:
  - **`useToast()`** — a global toast (via `useState`) rendered once by
    `components/ui/Toast.vue` in the default layout. Pages call
    `const { showToast } = useToast()`.
  - **`getApiError(err, fallback)`** (`composables/useApiError.ts`) — normalises
    `$fetch` errors into a display message. Used in every store/page catch block.
  - **`usePermissions()`** — `PERM` catalogue + `can(code | codes)` for RBAC.
- **Types** are declared once in **`types/api.ts`** and shared by stores and
  components.

---

## Authentication & Authorization

### Authentication (JWT)

- **Login** (`POST /api/auth/login`) returns an access + refresh token, stored in
  `localStorage` (`access_token`, `refresh_token`) by `stores/auth.ts`.
- **`plugins/auth.client.ts`** restores the session from storage on client boot.
- **`middleware/auth.ts`** protects every route: unauthenticated users are sent to
  `/login`, and the current user profile is loaded from `GET /api/auth/me`.
- **Token refresh** is automatic: `useApi` catches a `401`, calls
  `POST /api/auth/refresh`, and replays the original request.
- **Logout** (`POST /api/auth/logout`) revokes tokens and clears storage.

### Authorization (RBAC)

The backend returns `permissionCodes` (uppercase `RESOURCE_ACTION`, e.g.
`ROOM_READ`, `RESERVATION_CREATE`) and `roles` on the current user. The UI enforces
these at three levels:

1. **Navigation** — `components/layout/Sidebar.vue` only shows links the user can
   read (`visibleNavItems`).
2. **Routes** — each page declares its required code via
   `definePageMeta({ permission: 'X_READ' })`; `middleware/auth.ts` redirects to
   `/dashboard` if the user lacks it.
3. **Actions** — Add/Edit/Delete buttons are gated with
   `v-if="can(PERM.X.CREATE | UPDATE | DELETE)"`.

Helpers: `authStore.hasPermission(code)` and `usePermissions().can(...)`. Users
whose `roles` include **`ADMIN`** or **`SUPER_ADMIN`** bypass all checks
(`authStore.isAdmin`), so a misconfigured code can never lock an admin out.

> **Adjusting codes:** the permission catalogue is defined in one place —
> `composables/usePermissions.ts` (`PERM`). If the backend uses different resource
> tokens, edit that file; nothing else needs to change.

---

## Features

Each feature is a page under `/dashboard`, backed by a Pinia store and a set of
modal components. Common UI conventions across all feature pages:

- **Paginated lists** with a per-page selector (`components/ui/Pagination.vue`).
- **Debounced search** (~400 ms) and status/category filters.
- **Create/Edit modals** built on the shared `components/ui/Modal.vue`.
- **Confirm dialogs** for destructive actions (`components/ui/ConfirmDialog.vue`).
- **Global toast notifications** (top-right, auto-dismiss) via `useToast()`.
- **Permission-aware actions** — buttons appear only when the user is allowed.

### 1. Dashboard — `/dashboard`
The landing screen after login. Surfaces an at-a-glance operational summary:

- **Stats cards** (`components/dashboard/StatsCard.vue`) — key metrics pulled from
  `/api/reports/dashboard` (e.g. occupancy, today's check-ins, revenue).
- **Quick Booking** (`components/dashboard/QuickBooking.vue`) — a shortcut to
  start a new reservation without leaving the dashboard.
- **Activity Feed** (`components/dashboard/ActivityFeed.vue`) — recent system
  activity.

### 2. Hotels — `/dashboard/hotels`
Manage the hotel/property records.

- Create / edit / delete hotels (`components/hotels/HotelFormModal.vue`).
- Fields: name, contact, address, and an active/inactive toggle.

### 3. Rooms — `/dashboard/rooms`
Manage individual physical rooms.

- Create / edit / delete rooms (`components/rooms/RoomFormModal.vue`).
- Each room has a **status** shown as a colored badge
  (`components/rooms/RoomStatusBadge.vue`): `AVAILABLE`, `BOOKING`, `OCCUPIED`,
  `MAINTENANCE`, `CLEANING`.
- **Room images** — upload and preview photos
  (`components/rooms/RoomImage.vue`, `RoomImageModal.vue`,
  `composables/useRoomImageSrc.ts`).
- Status helpers live in `composables/useRoomStatus.ts`.

### 4. Room Types — `/dashboard/room-types`
Manage the categories of rooms (e.g. *Single*, *Deluxe*, *Suite*) and their base
rates. These types are referenced by rooms, reservations, and promotions.

- Create / edit / delete room types (`components/roomTypes/RoomTypeFormModal.vue`).

### 5. Guests — `/dashboard/guests`
Maintain the guest directory.

- Create / edit guests (`components/guests/GuestFormModal.vue`).
- **Nationality** picker (`components/ui/NationalitySelect.vue`).
- **Guest photo / ID image** support
  (`components/guests/GuestImage.vue`, `composables/useGuestImageSrc.ts`).
- Server-side filtering via `POST /api/guests/list/filter`.

### 6. Bookings (Reservations) — `/dashboard/bookings`
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
  - **Payment** — record and delete payments; status flows `UNPAID → PARTIAL → PAID`.
  - **Invoice** — view/generate the invoice.
- **Lifecycle:** `CONFIRMED → CHECKED_IN → CHECKED_OUT`. A booking can be
  **cancelled** while `CONFIRMED` or `CHECKED_IN`.

### 7. Services — `/dashboard/services`
Manage the catalog of add-on services that can be attached to a reservation
(e.g. breakfast, laundry, airport pickup).

- Create / edit / delete services (`components/services/ServiceFormModal.vue`).
- Services are consumed in the Bookings detail via **service usages**.

### 8. Promotions — `/dashboard/promotions`
Manage discounts and which room types they apply to.

- Create / edit promotions (`components/promotions/PromotionFormModal.vue`).
  - Supports a **permanent** flag (no end date) and **percentage** discounts.
  - Note: for `PERCENT` promotions the API stores a ratio (`0.20` = 20%); the
    form displays it ×100 and submits ÷100.
- **Assign room types** to a promotion
  (`components/promotions/PromotionRoomTypesModal.vue`).

### 9. Users — `/dashboard/users`
Manage staff accounts that can log into the portal.

- Create / edit users (`components/users/UserFormModal.vue`).
- **Assign roles** to a user (`components/users/AssignRoleModal.vue`).
- Server-side filtering via `POST /api/users/list/filter`.

### 10. Roles — `/dashboard/roles`
Define roles and the permissions attached to them. Roles drive the
permission-based UI described in [Authorization](#authentication--authorization).

- Create / edit roles and their permissions (`components/roles/RoleFormModal.vue`).

### 11. Reports — `/dashboard/reports`
Business reporting backed by `stores/reports.ts`:

- **Dashboard summary** — `GET /api/reports/dashboard`.
- **Revenue report** — `GET /api/reports/revenue?from=&to=` for a date range.
- **Reservation report** — `GET /api/reports/reservations?from=&to=`.

### 12. Settings — `/dashboard/settings`
Account / application settings for the current user.

---

## API Integration Reference

All endpoints are relative to `NUXT_PUBLIC_API_BASE_URL`. Responses use the
`ApiResponse<T>` envelope; paginated lists use a page object.

### Pagination
Paginated list endpoints (`users`, `guests`) accept a `PageAbleRequest<Filter>`
body and return a page object. Page numbers in the filter request are **1-based**.

### Key endpoints

| Area         | Endpoint(s)                                                        |
|--------------|-------------------------------------------------------------------|
| Auth         | `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout`, `GET /api/auth/me` |
| Hotels       | CRUD under `/api/hotels`                                          |
| Users        | CRUD + `POST /api/users/list/filter`; roles via `POST`/`DELETE /api/users/{id}/roles` |
| Roles        | CRUD under `/api/roles`                                           |
| Rooms        | CRUD under `/api/rooms` (+ image upload/delete under `/{id}/images`) |
| Room Types   | CRUD under `/api/room-types`                                      |
| Guests       | CRUD + `POST /api/guests/list/filter`                             |
| Services     | CRUD under `/api/services`                                        |
| Service usage| `POST /api/service-usages`, `DELETE /api/service-usages/{id}`, `GET /api/service-usages/reservation/{id}` |
| Promotions   | CRUD under `/api/promotions`; room types via `/api/promotion-room-types/promotion/{id}` |
| Reservations | `GET`/`POST /api/reservations`; `POST /{id}/check-in`, `/{id}/check-out`, `/{id}/cancel`; `GET /{id}/invoice` |
| Payments     | `POST /api/payments`, `GET /api/payments/reservation/{id}`, `DELETE /api/payments/{id}` |
| Reports      | `GET /api/reports/dashboard`, `/api/reports/revenue`, `/api/reports/reservations` |

> Routes may require specific permission codes on the backend; the UI hides
> navigation, routes, and actions the current user lacks permission for. See
> [Authorization](#authentication--authorization).

---

## Troubleshooting

| Symptom                                   | Likely cause / fix                                                                 |
|-------------------------------------------|------------------------------------------------------------------------------------|
| Dev server won't start / cryptic CLI error | Wrong Node version. Run `nvm use` (needs Node 22).                                 |
| All requests fail / network errors        | Backend not running or wrong `NUXT_PUBLIC_API_BASE_URL` in `.env`.                 |
| Redirected to `/login` immediately        | Missing/expired token, or `GET /api/auth/me` failed. Log in again.                |
| Sidebar is empty / pages redirect to dashboard | The user's `permissionCodes` don't match the `PERM` catalogue. Verify the codes and adjust `composables/usePermissions.ts`. Admin roles bypass this. |
| Actions (Add/Edit/Delete) not visible     | Expected — the current user lacks that `CREATE`/`UPDATE`/`DELETE` permission.      |
