# Team Page Responsibilities

This document shows where each member should add their frontend page code. The shared authentication, navbar, sidebar, route guards, and dashboard layouts are already prepared. Please add feature code inside your assigned folders instead of changing shared auth/layout files.

## Shared Rule

Do not modify these files without coordination:

- `frontend/src/app/core/services/auth.service.ts`
- `frontend/src/app/core/services/token.service.ts`
- `frontend/src/app/core/guards/auth.guard.ts`
- `frontend/src/app/core/guards/role.guard.ts`
- `frontend/src/app/core/interceptors/auth.interceptor.ts`
- `frontend/src/app/shared/layouts/customer-layout/`
- `frontend/src/app/shared/layouts/provider-layout/`
- `frontend/src/app/features/admin/admin-layout/`
- `frontend/src/app/shared/components/navbar/`
- `frontend/src/app/shared/components/sidebar/`
- `frontend/src/app/app.routes.ts`

If a new sidebar route is needed, coordinate first so routes stay consistent.

## Authentication And User Management

Owner: Authentication member

Routes:

- `/login`
- `/register`
- `/unauthorized`
- `/customer/dashboard`
- `/customer/profile`
- `/provider/dashboard`
- `/provider/profile`

Folders:

- `frontend/src/app/features/auth/login/`
- `frontend/src/app/features/auth/register/`
- `frontend/src/app/features/auth/unauthorized/`
- `frontend/src/app/features/customer/dashboard/`
- `frontend/src/app/features/customer/profile/`
- `frontend/src/app/features/provider/dashboard/`
- `frontend/src/app/features/provider/profile/`

Responsibilities:

- Login and registration
- JWT session handling
- Customer dashboard placeholder shell
- Customer profile
- Provider dashboard placeholder shell
- Provider profile
- Shared route guards and auth interceptor

## Customer Pages

### Dashboard

Owner: Authentication module member

Route:

- `/customer/dashboard`

Folder:

- `frontend/src/app/features/customer/dashboard/`

### Browse Services

Owner: Services module member

Route:

- `/customer/services`

Folder:

- `frontend/src/app/features/customer/browse-services/`

### Favourites

Owner: Services module member

Route:

- `/customer/favourites`

Folder:

- `frontend/src/app/features/customer/favourites/`

### My Bookings

Owner: Bookings module member

Route:

- `/customer/bookings`

Folder:

- `frontend/src/app/features/customer/bookings/`

### Notifications

Owner: Notifications module member

Route:

- `/customer/notifications`

Folder:

- `frontend/src/app/features/customer/notifications/`

### Reviews

Owner: Reviews module member

Route:

- `/customer/reviews`

Folder:

- `frontend/src/app/features/customer/reviews/`

### AI Assistant

Owner: AI module member

Route:

- `/customer/ai-assistant`

Folder:

- `frontend/src/app/features/customer/ai-assistant/`

Delivered functionality:

- Authenticated AI chat with saved conversation history.
- Recommendation cards based on active database services.
- Customer-confirmed booking request from a recommended service.
- Saved-chat and message counts for the current user.

## Provider Pages

### Dashboard

Owner: Authentication module member

Route:

- `/provider/dashboard`

Folder:

- `frontend/src/app/features/provider/dashboard/`

### My Services

Owner: Services module member

Route:

- `/provider/services`

Folder:

- `frontend/src/app/features/provider/services/`

### Service Areas

Owner: Services module member

Route:

- `/provider/service-areas`

Folder:

- `frontend/src/app/features/provider/service-areas/`

### Booking Requests

Owner: Bookings module member

Route:

- `/provider/booking-requests`

Folder:

- `frontend/src/app/features/provider/booking-requests/`

### Availability

Owner: Bookings module member

Route:

- `/provider/availability`

Folder:

- `frontend/src/app/features/provider/availability/`

### Notifications

Owner: Notifications module member

Route:

- `/provider/notifications`

Folder:

- `frontend/src/app/features/provider/notifications/`

### Reviews

Owner: Reviews module member

Route:

- `/provider/reviews`

Folder:

- `frontend/src/app/features/provider/reviews/`

### Payments

Owner: Payments module member

Route:

- `/provider/payments`

Folder:

- `frontend/src/app/features/provider/payments/`

### AI Insights

Owner: AI module member

Route:

- `/provider/ai-insights`

Delivered functionality:

- Providers can select one of their services and generate a stored AI review summary.

Folder:

- `frontend/src/app/features/provider/ai-insights/`

## Admin Pages

Owner: Admin module member

Routes and folders:

- `/admin/dashboard` -> `frontend/src/app/features/admin/admin-dashboard/`
- `/admin/users` -> `frontend/src/app/features/admin/user-management/`
- `/admin/categories` -> `frontend/src/app/features/admin/category-management/`
- `/admin/services` -> `frontend/src/app/features/admin/service-moderation/`
- `/admin/bookings` -> `frontend/src/app/features/admin/booking-monitoring/`
- `/admin/reviews` -> `frontend/src/app/features/admin/review-moderation/`
- `/admin/payments` -> `frontend/src/app/features/admin/payment-management/`
- `/admin/test-system` -> `frontend/src/app/features/admin/test-system/`

## How To Work In Your Page

1. Open your assigned folder.
2. Replace the placeholder HTML, SCSS, and TypeScript with your feature code.
3. Keep the component export name unless you also update `frontend/src/app/app.routes.ts`.
4. Use `AuthService` if you need the current logged-in user.
5. Use Angular `HttpClient` for API calls. The JWT is added automatically by the interceptor.
6. Do not hardcode duplicate backend URLs; use existing environment/API utilities where possible.

## Current Placeholder Purpose

The placeholder pages exist only to reserve routes and make sidebar links clickable. They do not implement business logic. Each member can safely replace the placeholder HTML, SCSS, and TypeScript in their assigned folder.

## Current Sidebar Order

Customer sidebar:

1. Dashboard -> `/customer/dashboard`
2. Profile -> `/customer/profile`
3. Browse Services -> `/customer/services`
4. Favourites -> `/customer/favourites`
5. My Bookings -> `/customer/bookings`
6. Notifications -> `/customer/notifications`
7. Reviews -> `/customer/reviews`
8. AI Assistant -> `/customer/ai-assistant`

Provider sidebar:

1. Dashboard -> `/provider/dashboard`
2. Profile -> `/provider/profile`
3. My Services -> `/provider/services`
4. Service Areas -> `/provider/service-areas`
5. Booking Requests -> `/provider/booking-requests`
6. Availability -> `/provider/availability`
7. Notifications -> `/provider/notifications`
8. Reviews -> `/provider/reviews`
9. Payments -> `/provider/payments`
10. AI Insights -> `/provider/ai-insights`

Admin sidebar:

1. Dashboard -> `/admin/dashboard`
2. Users -> `/admin/users`
3. Categories -> `/admin/categories`
4. Services -> `/admin/services`
5. Bookings -> `/admin/bookings`
6. Reviews -> `/admin/reviews`
7. Payments -> `/admin/payments`

`/admin/test-system` still exists as a route but was removed from the sidebar (2026-07-21) since it was demo/seeding scaffolding, not a real admin feature.
