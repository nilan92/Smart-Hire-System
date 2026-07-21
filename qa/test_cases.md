# Test Case Matrix

Status reflects the last full run of both automated suites (24/24 backend,
24/24 frontend) plus manual verification during development. Re-run
`README.md`'s commands to reproduce.

Legend: **Auto** = covered by an automated test · **Manual** = checklist item only

## Authentication

| ID | Case | Type | Reference | Status |
|---|---|---|---|---|
| AUTH-01 | Customer registration hashes password, never returns it | Auto | `test_auth.py::test_customer_registration_succeeds_and_hashes_password` | Pass |
| AUTH-02 | Provider registration also creates a provider profile | Auto | `test_auth.py::test_provider_registration_creates_profile` | Pass |
| AUTH-03 | Duplicate email is rejected (409) | Auto | `test_auth.py::test_duplicate_email_is_rejected` | Pass |
| AUTH-04 | Mismatched password/confirm_password rejected | Auto | `test_auth.py::test_mismatched_passwords_are_rejected` | Pass |
| AUTH-05 | Public registration cannot create an admin | Auto | `test_auth.py::test_admin_registration_is_rejected` | Pass |
| AUTH-06 | Valid login returns a usable JWT | Auto | `test_auth.py::test_valid_login_returns_jwt` | Pass |
| AUTH-07 | Wrong password rejected (401) | Auto | `test_auth.py::test_invalid_password_is_rejected` | Pass |
| AUTH-08 | Suspended account cannot log in | Auto | `test_auth.py::test_suspended_account_cannot_log_in` | Pass |
| AUTH-09 | Deactivated account cannot log in | Auto | `test_auth.py::test_deactivated_account_cannot_log_in` | Pass |
| AUTH-10 | Protected route without a token returns 401 | Auto | `test_auth.py::test_protected_endpoint_without_token_returns_401` | Pass |
| AUTH-11 | Malformed/invalid token returns 401 | Auto | `test_auth.py::test_invalid_token_returns_401` | Pass |
| AUTH-12 | `authGuard` redirects unauthenticated users to `/login` | Auto | `auth.guard.spec.ts` | Pass |
| AUTH-13 | `roleGuard` redirects a user with the wrong role | Auto | `role.guard.spec.ts` | Pass |
| AUTH-14 | JWT is attached automatically to outgoing requests | Auto | `auth.interceptor.spec.ts` | Pass |
| AUTH-15 | Login/register forms show field-level validation errors | Manual | `manual_test_checklist.md` | — |

## Services & Marketplace

| ID | Case | Type | Reference | Status |
|---|---|---|---|---|
| SVC-01 | Provider can create/update a service; public search finds it | Auto | `test_services.py::test_provider_crud_and_public_search` | Pass |
| SVC-02 | Customer favourites + provider service areas CRUD | Auto | `test_services.py::test_customer_favourites_and_provider_areas` | Pass |
| SVC-03 | Only the owning provider can edit/delete their service | Auto | `test_services.py::test_roles_and_ownership_are_enforced` | Pass |
| SVC-04 | Paused/draft services never appear in public search | Auto | `test_services.py::test_provider_crud_and_public_search` | Pass |
| SVC-05 | "View service" modal (browse + favourites) shows correct data | Manual | `manual_test_checklist.md` | — |

## Users & Profiles

| ID | Case | Type | Reference | Status |
|---|---|---|---|---|
| USR-01 | Customer cannot access the provider-profile endpoint | Auto | `test_users.py::test_customer_cannot_access_provider_profile_endpoint` | Pass |
| USR-02 | Provider can view/update their own provider profile | Auto | `test_users.py::test_provider_can_view_and_update_provider_profile` | Pass |
| USR-03 | User can update name/phone; other fields are ignored | Auto | `test_users.py::test_user_can_update_full_name_and_phone` | Pass |
| USR-04 | Public provider endpoint never leaks password hash/private fields | Auto | `test_users.py::test_public_provider_response_is_safe` | Pass |

## Reviews

| ID | Case | Type | Reference | Status |
|---|---|---|---|---|
| REV-01 | Cannot review a booking that isn't `completed` | Auto | `test_reviews_payments.py::test_review_requires_completed_booking_owned_by_customer` | Pass |
| REV-02 | Rating outside 1–5 is rejected (422) | Auto | `test_reviews_payments.py::test_review_creation_updates_provider_rating_and_rejects_bad_rating` | Pass |
| REV-03 | Review creation recalculates the provider's `avg_rating`/`total_reviews` | Auto | same as REV-02 | Pass |
| REV-04 | Duplicate review on the same booking is rejected | Auto | same as REV-02 | Pass |
| REV-05 | Client-supplied `customer_id`/`provider_id` cannot be spoofed | Auto | same as REV-02 | Pass |
| REV-06 | `customer/reviews` shows pending-review bookings and past reviews | Manual | `manual_test_checklist.md` | — |
| REV-07 | `provider/reviews` shows correct average rating and review list | Manual | `manual_test_checklist.md` | — |

## Payments

| ID | Case | Type | Reference | Status |
|---|---|---|---|---|
| PAY-01 | Cannot pay for a booking that isn't `completed` | Auto | `test_reviews_payments.py::test_payment_requires_completed_booking` | Pass |
| PAY-02 | Unauthenticated payment request is rejected (401) | Auto | `test_reviews_payments.py::test_payment_requires_auth_and_ownership` | Pass |
| PAY-03 | Amount ≤ 0 is rejected (422) | Auto | same as PAY-02 | Pass |
| PAY-04 | Duplicate payment on the same booking is rejected | Auto | same as PAY-02 | Pass |
| PAY-05 | Client-supplied `customer_id` cannot be spoofed | Auto | same as PAY-02 | Pass |
| PAY-06 | Payment settles as `completed` immediately with a real `transaction_id` | Auto | same as PAY-02 | Pass |
| PAY-07 | Provider sees the payment via `/payments/provider/me` | Auto | same as PAY-02 | Pass |
| PAY-08 | "Pay now" UI flow (bookings → payment modal → paid badge) | Manual | `manual_test_checklist.md` | — |

## Admin

| ID | Case | Type | Reference | Status |
|---|---|---|---|---|
| ADM-01 | Every `/admin/*` route rejects non-admin roles | Auto | `test_admin.py::test_category_management_requires_admin_and_tracks_service_counts` | Pass |
| ADM-02 | Category `service_count` reflects real linked services | Auto | same as ADM-01 | Pass |
| ADM-03 | Category deletion blocked while services still reference it | Auto | same as ADM-01 | Pass |
| ADM-04 | Service list includes every status (not just active) | Auto | `test_admin.py::test_service_moderation_lists_all_statuses_and_updates_status` | Pass |
| ADM-05 | Service status update rejects an invalid status value | Auto | same as ADM-04 | Pass |
| ADM-06 | Add-Category modal creates a real category end-to-end | Manual | `manual_test_checklist.md` | — |
| ADM-07 | Booking Monitoring "View Details" shows real booking data | Manual | `manual_test_checklist.md` | — |
| ADM-08 | Dashboard stat cards match actual DB counts | Manual | `manual_test_checklist.md` | — |

## Frontend Component Behavior

| ID | Case | Type | Reference | Status |
|---|---|---|---|---|
| FE-01 | Review list re-renders once its HTTP request resolves | Auto | `provider-review-list.spec.ts` | Pass |
| FE-02 | Submit-review form shows the success state after saving | Auto | `submit-review-form.spec.ts` | Pass |
| FE-03 | Star rating display renders the correct filled/empty stars | Auto | `rating-display.spec.ts` | Pass |
| FE-04 | Payment-status component reaches its completed state | Auto | `payment-status.spec.ts` | Pass |
| FE-05 | Admin dashboard/category/service/booking/user pages construct | Auto | respective `*.spec.ts` | Pass |
| FE-06 | Login/register pages construct without error | Auto | `login.spec.ts`, `register.spec.ts` | Pass |
