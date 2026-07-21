# Smart Hire Auth And User API Contract

Base URL: `http://127.0.0.1:8000/api`

## Auth

### POST `/auth/register`

Public. Registers a customer or provider. Admin registration is rejected publicly.

Customer request:

```json
{
  "email": "customer@example.com",
  "password": "Password123",
  "confirm_password": "Password123",
  "full_name": "Customer User",
  "phone": "0771234567",
  "role": "customer"
}
```

Provider request:

```json
{
  "email": "provider@example.com",
  "password": "Password123",
  "confirm_password": "Password123",
  "full_name": "Provider User",
  "phone": "0777654321",
  "role": "provider",
  "provider_profile": {
    "bio": "Electrical and home repair provider.",
    "years_experience": 4
  }
}
```

Success: `201` with user fields. `password_hash` is never returned.

Common errors: `409` duplicate email, `422` validation error.

### POST `/auth/login`

Public.

```json
{
  "email": "customer@example.com",
  "password": "Password123"
}
```

Success: `200`

```json
{
  "access_token": "jwt-token",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "customer@example.com",
    "full_name": "Customer User",
    "phone": "0771234567",
    "role": "customer",
    "status": "active",
    "email_verified": false,
    "created_at": "2026-07-16T00:00:00Z",
    "updated_at": "2026-07-16T00:00:00Z"
  }
}
```

Common errors: `401` invalid credentials, `403` inactive account.

### GET `/auth/me`

Requires bearer token. Returns the current user and provider profile when available.

## Users

### GET `/users/me`

Requires bearer token. Returns the current user.

### PUT `/users/me`

Requires bearer token. Allows only `full_name` and `phone`.

```json
{
  "full_name": "Updated Name",
  "phone": "0711111111"
}
```

### GET `/users/provider-profile`

Requires bearer token and `provider` role.

### PUT `/users/provider-profile`

Requires bearer token and `provider` role. Allows only `bio` and `years_experience`.

```json
{
  "bio": "Updated provider bio",
  "years_experience": 6
}
```

### GET `/users/providers/{provider_id}`

Public. Returns public provider details and provider profile. Private account fields and password hash are not returned.

## Reviews

A review can only be created once a booking is `completed`, by the customer on that booking, and only once per booking.

### POST `/reviews/`

Requires bearer token and `customer` role.

```json
{
  "booking_id": 12,
  "customer_id": 1,
  "provider_id": 1,
  "service_id": 1,
  "rating": 5,
  "comment": "Great work"
}
```

`customer_id`/`provider_id`/`service_id` are accepted for schema compatibility but are ignored server-side — they're always derived from the booking and the authenticated user, so a caller cannot spoof them. `rating` must be `1`–`5`.

Success: `200` with the created review. Also recalculates the provider's `avg_rating`/`total_reviews` on their provider profile.

Common errors: `400` booking not completed, review already exists for this booking; `403` not a customer, or the booking isn't yours; `404` booking not found; `422` rating out of range.

### GET `/reviews/`

Public. Lists all reviews (paginated via `skip`/`limit`).

### GET `/reviews/provider/{provider_id}`

Public. Reviews for a given provider.

### GET `/reviews/service/{service_id}`

Public. Reviews for a given service.

### GET `/reviews/customer/me`

Requires bearer token and `customer` role. Reviews the current customer has written.

### GET `/reviews/{review_id}`

Public. A single review by id.

## AI

All AI endpoints are served under `/api/ai` and require a bearer token. OpenAI is called only from the FastAPI backend; API keys are never sent to Angular.

### POST `/ai/chat`

Creates or continues the signed-in user's conversation and stores both the user message and the assistant reply.

```json
{
  "message": "My kitchen sink is leaking. I need help in Colombo.",
  "conversation_id": 12
}
```

Omit `conversation_id` to create a new conversation. The response contains the persistent `conversation_id` and the assistant `reply`. The assistant uses the most recent saved messages and the current service categories as context; it does not invent bookings, prices, providers, or availability.

### GET `/ai/conversations`

Returns the signed-in user's conversation list only, ordered by most recently updated conversation.

### GET `/ai/conversations/analysis`

Returns the signed-in user's `conversation_count`, `message_count`, and `latest_conversation_at`. It does not expose another user's messages.

### GET `/ai/conversations/{conversation_id}`

Returns the full saved message history for one conversation owned by the signed-in user. Returns `404` for another user's conversation.

### POST `/ai/recommend`

```json
{ "description": "My kitchen sink is leaking." }
```

Returns a category validated against `service_categories`, a short reason, and up to six active services from that category with provider, location, price, and rating information.

### POST `/ai/provider-match`

Accepts a customer request and a supplied list of providers, then returns the strongest supplied candidate based on rating and experience. Use `/ai/recommend` for database-backed service results.

### POST `/ai/reviews/summarize`

Requires the `provider` role.

```json
{ "service_id": 42 }
```

The service must belong to the signed-in provider. The API summarizes that service's written reviews and stores the result in `review_summaries`.

### AI Booking Handoff

The assistant can guide a customer to a recommended service but never creates a booking automatically. The customer must explicitly select a future date and time in the assistant UI. The UI then calls the existing `POST /api/bookings` endpoint, preserving its customer-role validation, active-service check, and provider notification.

## Payments

Payment is only accepted once a booking is `completed`. This is a simulated gateway — there is no external processor, so a successful `POST` is an immediately `completed` payment with a generated `transaction_id`, not a `pending` one awaiting a callback.

### POST `/payments/`

Requires bearer token and `customer` role.

```json
{
  "booking_id": 12,
  "customer_id": 1,
  "amount": 1500,
  "payment_method": "card"
}
```

`customer_id` is accepted for schema compatibility but ignored server-side (derived from the authenticated user). `amount` must be `> 0`.

Success: `200` with the created payment (`status: "completed"`, real `transaction_id`).

Common errors: `400` booking not completed, or already paid; `401` no token; `403` not a customer, or the booking isn't yours; `404` booking not found; `422` amount `<= 0`.

### GET `/payments/`

Requires bearer token and `admin` role. Lists all payments (paginated).

### GET `/payments/booking/{booking_id}`

Requires bearer token. Visible to the booking's customer, the booking's provider, or an admin.

### GET `/payments/customer/me`

Requires bearer token and `customer` role. Payments the current customer has made.

### GET `/payments/provider/me`

Requires bearer token and `provider` role. Payments received across the current provider's bookings.

### GET `/payments/{payment_id}`

Requires bearer token. Visible to the payment's customer, the related booking's provider, or an admin.

### PUT `/payments/{payment_id}`

Requires bearer token and `admin` role. Updates `status` (`pending`/`completed`/`failed`/`refunded`) and/or `transaction_id`.

```json
{ "status": "refunded" }
```

## Admin

All `/admin/*` routes require bearer token and `admin` role.

### GET `/admin/dashboard-stats`

Platform totals: `total_payments`, `total_reviews`, `total_users`, `total_bookings`, `total_services`, `avg_review_rating`, `total_revenue` (sum of `completed` payments).

### Users

- `GET /admin/users` — paginated list.
- `PUT /admin/users/{id}/status` — body `{ "status": "active" | "pending" | "suspended" | "deactivated" }`.

### Categories

- `GET /admin/categories` — each category includes a real `service_count` (services currently in that category).
- `POST /admin/categories` — body `{ "name": "...", "description": "...", "icon": "🛠️" }`. `400` if the name already exists.
- `DELETE /admin/categories/{id}` — `400` if any service still references the category.

### Services

- `GET /admin/services` — every service regardless of status, with `provider_name`.
- `PUT /admin/services/{id}/status` — body `{ "status": "active" | "paused" | "draft" }`.

### Payments

- `GET /admin/payments` — every payment with `customer_email` joined in, plus `created_at`/`updated_at`.
- `PUT /admin/payments/{id}/status` — body `{ "status": "pending" | "completed" | "failed" | "refunded" }`.

### Reviews

- `GET /admin/reviews` — paginated list.
- `DELETE /admin/reviews/{id}` — removes a review (does not currently recalculate the provider's rating — see Reviews section above for how rating recalculation happens on create).

### Seed data

- `POST /admin/seed-test-data` — inserts fixed demo users/services/bookings/payments/reviews (idempotent, skips existing rows by unique key). Presentation/demo aid only; not required for normal app operation.

## Status Codes

- `200` success
- `201` created
- `400` business-rule violation (e.g. booking not completed, already paid/reviewed, category still in use)
- `401` missing, invalid, or expired token
- `403` wrong role or inactive account
- `404` provider profile or public provider not found
- `409` duplicate email
- `422` validation error
