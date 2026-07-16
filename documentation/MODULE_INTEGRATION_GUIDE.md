# Smart Hire Module Integration Guide

This guide explains how other members should integrate their pages with the shared authentication and dashboard foundation.

## Authentication Flow

1. Users register through `POST /api/auth/register` as `customer` or `provider`.
2. Users log in through `POST /api/auth/login`.
3. The frontend stores the returned JWT through `TokenService`.
4. Angular sends the JWT automatically for API requests under `http://127.0.0.1:8000/api`.
5. Protected backend routes read the current user from `get_current_user`.

## Protect A Backend Route

```python
from fastapi import APIRouter, Depends
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/example", tags=["Example"])

@router.get("/me")
def example(current_user: User = Depends(get_current_user)):
    return {"user_id": current_user.id}
```

## Require A Backend Role

```python
from fastapi import Depends
from app.core.dependencies import require_roles
from app.models.user import User, UserRole

@router.post("/provider-only")
def provider_only(current_user: User = Depends(require_roles(UserRole.PROVIDER))):
    return {"provider_id": current_user.id}
```

## Protect An Angular Route

```typescript
{
  path: 'provider/example',
  canActivate: [authGuard, roleGuard],
  data: { roles: ['provider'] },
  loadComponent: () => import('./features/provider/example/example').then((m) => m.Example),
}
```

## Current User In Angular

Use `AuthService.currentUser()` in components. Call `AuthService.loadCurrentUser()` when a fresh server copy is required.

## Authenticated API Calls

Use Angular `HttpClient`. Do not manually add `Authorization` headers; `authInterceptor` does that automatically.

## Customer Routes

Reserved route structure:

- `/customer/profile` - authentication module, implemented
- `/customer/services` - services module
- `/customer/favourites` - services module
- `/customer/bookings` - bookings module
- `/customer/notifications` - notifications module
- `/customer/reviews` - reviews module
- `/customer/ai-assistant` - AI module

## Provider Routes

Reserved route structure:

- `/provider/profile` - authentication module, implemented
- `/provider/services` - services module
- `/provider/service-areas` - services module
- `/provider/booking-requests` - bookings module
- `/provider/availability` - bookings module
- `/provider/notifications` - notifications module
- `/provider/reviews` - reviews module
- `/provider/payments` - payments module
- `/provider/ai-insights` - AI module

## Sidebar Links

Shared links live in:

- `frontend/src/app/shared/layouts/customer-layout/customer-layout.ts`
- `frontend/src/app/shared/layouts/provider-layout/provider-layout.ts`

Coordinate before changing auth internals, guards, interceptors, token storage, user models, or route constants.
