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

Omit `conversation_id` to create a new conversation. The response contains the persistent `conversation_id` and the assistant `reply`.

**Behavior differs by role:**

- **Customer**: context includes the real current date/time, active service listings (with `service_id`/`provider_id` so the model can reference them precisely), and the customer's own recent bookings (with `booking_id`). The assistant has three tools it can call mid-conversation, implemented as OpenAI native function-calling (`app/ai/service.py`, tool logic in `app/ai/tools.py`):
  - `check_provider_availability(provider_id, date)` — real weekly schedule minus existing bookings that day.
  - `create_booking(service_id, date, time, notes?)` — creates a real booking via the same `BookingService` the `POST /bookings` endpoint uses. Only called after the customer explicitly confirms service/date/time.
  - `cancel_booking(booking_id)` — cancels one of the customer's own pending/accepted bookings.
  It never invents a provider, price, availability, or booking that isn't backed by a real tool call or the listings/bookings given in context.
- **Provider**: a different system prompt and context (their own services, count of pending booking requests). No booking tools — it explicitly declines customer-style "find me a service" requests and redirects to provider-relevant topics instead.

A floating chat widget (bottom-right, all customer/provider pages) and the full `/customer/ai-assistant` page both call this same endpoint.

**Request also accepts** `use_mcp: bool = false` — when `true`, the three customer tool calls above are executed through the standalone MCP server (see "MCP Server" below) over the real MCP protocol instead of calling `app/ai/tools.py` directly in-process. The full-page assistant sends `true`; the floating widget leaves it `false` (in-process is faster — a genuine MCP round trip spawns a subprocess per tool call).

**Response also includes** `recommended_services: RecommendedService[] | null` — for customer replies, any active service whose title is mentioned in the assistant's reply text is included here (same shape as `/ai/recommend`'s service list), so the floating widget can render a clickable service card under the reply instead of the customer having to go find it themselves.

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

Two paths exist for a customer to end up with a booking from the assistant:

1. **Recommendation flow** (`/customer/ai-assistant` full page): the assistant guides the customer to a recommended service; the customer explicitly picks a date/time in the UI, which calls `POST /api/bookings` directly.
2. **Conversational flow** (chat / floating widget): the assistant calls the `create_booking` tool itself once the customer has confirmed in plain language (see above). Same underlying `BookingService.create_booking`, same validation (customer role, active service, provider notification) — just invoked from `app/ai/tools.py` instead of the router directly.

Either way, nothing is booked without an explicit customer confirmation somewhere in the flow.

## MCP Server

`backend/mcp_server/server.py` is a standalone MCP (Model Context Protocol) server, separate from the endpoints above — for external MCP clients (Claude Desktop, Claude Code, the `mcp` CLI inspector), not for the web app. Run it directly (`python mcp_server/server.py`, stdio transport) or configure it in an MCP client. Since it has no JWT session, booking/cancel tools take a `customer_email` instead of relying on auth.

Tools: `list_categories`, `search_services`, `get_provider_reviews`, `check_availability`, `create_booking`, `cancel_booking`. Shares its booking/availability logic with the in-app chat's tool-calling via `app/ai/tools.py` — one implementation of "what counts as an open slot" / "what makes a booking valid", not two.

Tested with a real MCP client session, not just direct function calls — see `qa/test_mcp_server.py`.

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

## Messages

Simple per-booking messaging between the customer and provider on a real booking — not open-ended messaging with arbitrary users. Every endpoint requires a bearer token; access is restricted to the booking's own `customer_id`/`provider_id` (`403` otherwise).

### GET `/messages/threads`

Returns one conversation entry per booking the signed-in user is a participant of (customer sees their bookings, provider sees theirs), each with the other party's name, the service name, the booking's current status, the last message preview (`null` if none yet), and an `unread_count`. Sorted by most recent activity (last message time, or booking creation time if no messages yet).

### GET `/messages/bookings/{booking_id}`

Returns the full message history for that booking, oldest first. As a side effect, marks every message not sent by the caller as read (so opening a thread clears its unread badge).

### POST `/messages/bookings/{booking_id}`

```json
{ "body": "Can you come at 9am instead of 9:30?" }
```

Creates a message from the signed-in user and notifies the other party (a real row in `notifications`, same mechanism as booking status changes). `body` is 1–2000 characters.

Common errors: `403` caller isn't the booking's customer or provider; `404` booking not found.

## Admin

All `/admin/*` routes require bearer token and `admin` role.

### GET `/admin/dashboard-stats`

Platform totals: `total_payments`, `total_reviews`, `total_users`, `total_bookings`, `total_services`, `avg_review_rating`, `total_revenue` (sum of `completed` payments).

### GET `/admin/revenue-timeseries`

Real completed-payment revenue and real booking counts, grouped by month, for the dashboard chart. Query param `months` (default 6, max 24). Returns `[{ "month": "Jul 2026", "revenue": 12500.0, "bookings": 9 }, ...]`. Was previously hardcoded fake data on the frontend — see `LESSONS_LEARNED.md`.

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
