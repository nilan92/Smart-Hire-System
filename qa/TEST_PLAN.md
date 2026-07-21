# Test Plan — Smart Hire Service Marketplace

## 1. Scope

This plan covers the full application: authentication, service
marketplace (categories/search/favourites), bookings, availability,
notifications, reviews, payments, the admin console, and the AI assistant.

## 2. Objectives

- Verify each role (customer, provider, admin) can complete its core
  workflows without error.
- Verify authorization boundaries hold: a user can only act on their own
  data, and role-gated endpoints reject the wrong role.
- Verify business-rule invariants: e.g. a booking must be `completed`
  before it can be paid or reviewed; a payment/review can't be duplicated
  for the same booking; a category can't be deleted while services still
  reference it.
- Catch integration breakage early — particularly schema drift between
  the SQLAlchemy models and the live database, which has caused real
  production incidents in this project (see `LESSONS_LEARNED.md` #10).

## 3. Test Levels

| Level | Tooling | Where |
|---|---|---|
| Unit / integration (backend) | pytest, FastAPI `TestClient`, isolated in-memory SQLite | `backend/app/tests/` |
| Unit / integration (frontend) | Vitest via Angular's `@angular/build:unit-test`, `HttpTestingController` | `*.spec.ts` next to each component |
| End-to-end smoke (live server) | Python script over real HTTP | `qa/smoke_test.py` |
| Manual / exploratory | Human tester, checklist | `qa/manual_test_checklist.md` |

Backend and frontend automated suites are fast (under 15s each) and run
against isolated/mocked data, so they're safe to run on every change.
The live smoke test and manual checklist are meant to run before a
demo or handoff, since they touch the real (Supabase) database and the
actual rendered UI.

## 4. What's Automated vs. Manual

**Automated (see `test_cases.md` for the full matrix):**
- Auth: registration, login, password/role validation, JWT-gated routes
- Services: CRUD, ownership enforcement, public search/filtering
- Users: profile access control, public provider data doesn't leak
  private fields
- Reviews: booking-ownership and completed-status enforcement, rating
  1–5 validation, provider rating recalculation, duplicate rejection
- Payments: auth + ownership + completed-status enforcement, amount
  validation, duplicate rejection, provider/admin-only endpoints
- Admin: role gate on every `/admin/*` route, category service-count
  accuracy, category deletion blocked while in use, service status
  transitions

**Manual only (not practical to automate given project time/scope):**
- Visual/layout correctness (spacing, alignment, responsive behavior)
- Cross-role navigation flows (e.g. does a notification click land on
  the right page for that role)
- AI assistant response quality/relevance (inherently non-deterministic)
- Full booking → payment → review UI journey end-to-end in a browser

## 5. Environments

| Environment | Database | Used by |
|---|---|---|
| Test | In-memory SQLite, created fresh per test run | `pytest`, `ng test` |
| Local dev | Supabase-hosted Postgres (shared team DB) | `qa/smoke_test.py`, manual testing |

`smoke_test.py` and manual testers must always clean up any accounts/data
they create in the shared dev database — see the cleanup pattern at the
bottom of `smoke_test.py`.

## 6. Known Gaps (tracked, not hidden)

- The Alembic migration chain has a pre-existing broken migration
  (inverted upgrade/downgrade — see `LESSONS_LEARNED.md`). The app works
  around this via `Base.metadata.create_all()` at startup, which creates
  missing tables but never alters existing ones. This means schema
  changes to *existing* tables require a manual patch against the live
  DB (as documented in `AGENT_HANDOFF.md`) — there is currently no
  automated check that models and the live DB schema agree.
- No automated frontend E2E/browser test runner (e.g. Playwright) is
  configured; UI journeys are covered by the manual checklist instead.
