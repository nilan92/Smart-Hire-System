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

## Status Codes

- `200` success
- `201` created
- `401` missing, invalid, or expired token
- `403` wrong role or inactive account
- `404` provider profile or public provider not found
- `409` duplicate email
- `422` validation error
