# Development Hiccups & Solutions

## Recent Lesson: AI Output Must Not Directly Perform a Customer Booking
**The Hiccup:** Letting a chat response create a booking would allow an untrusted model response to make a business transaction without the customer selecting the date/time or confirming the request.

**The Fix:** The assistant only provides guidance and recommendations. Its Angular page displays a confirmation panel where the authenticated customer chooses a recommended service and a future date/time. It then calls the existing `POST /api/bookings` endpoint, retaining customer-role validation, active-service verification, provider ownership, and notification logic.

## Recent Lesson: Conversation History Needs Ownership, Ordering and a Parent Touch
**The Hiccup:** Saving messages alone is not enough for usable chat history. Without an owner filter, users could inspect another user's messages; without updating the conversation timestamp, the history list is ordered by creation time rather than recent activity.

**The Fix:** Every conversation query filters by authenticated `user_id`; a mismatched conversation returns `404`. The chat route stores both messages in one transaction and updates the parent conversation's `updated_at`. Static routes such as `/conversations/analysis` are registered before `/conversations/{conversation_id}` so FastAPI does not try to parse `analysis` as an integer id.

Here is a straightforward log of the technical problems we ran into while building this system and exactly how we fixed them:

## 1. The Endless Loading Spinner (The Change Detection Bug)
**The Hiccup:** When simulating a payment or loading dashboard statistics, the UI would show a spinning wheel forever. Even if the backend sent the data back perfectly, the spinner just wouldn't go away. 
**The Fix:** This happened because Angular's standalone components occasionally lose track of time when using `setTimeout()` functions (we used these to simulate network delays). Because Angular "lost track", it didn't know it needed to redraw the screen. We fixed this by importing `ChangeDetectorRef` and manually telling Angular "Hey, the data is here, update the screen now!" using `detectChanges()`. 

## 2. The Database Rejected Our Test Payments (Foreign Key Error)
**The Hiccup:** When we tried to submit a payment on the dummy payment page, the backend crashed and gave a "500 Internal Server Error".
**The Fix:** Our dummy payment page was hardcoded to pay for "Booking #1". But because we had just wiped our database to start fresh, Booking #1 didn't exist anymore! The PostgreSQL database was doing its job perfectly by rejecting a payment for a ghost booking (this is called a Foreign Key Violation). We fixed it by creating a dedicated "Data Seeder" that generates fake Users and Bookings (like Booking #301) and updating our payment page to use those exact IDs.

## 3. The Backend Server Failed to Restart (Address Already in Use)
**The Hiccup:** During development, the FastAPI backend server would occasionally refuse to start, claiming the port `8000` was already in use.
**The Fix:** This happened because previous AI agents or terminal tasks didn't cleanly shut down the old server process before starting a new one. We overcame this by making sure we explicitly killed the old background tasks before spinning up the newly updated one. 

## 4. The Angular Application Crashed on Boot (NullInjectorError)
**The Hiccup:** When navigating to the Admin Dashboard for the first time, the entire Angular app would crash and go completely blank. The console showed a `NullInjectorError` for `HttpClient`.
**The Fix:** In older versions of Angular, you used an `HttpClientModule`. In the modern Angular 17+ standalone architecture we are using, that module no longer exists. We fixed it by opening `app.config.ts` and explicitly providing the new `provideHttpClient()` function to the application's root providers.

## 5. Duplicate Data Crashing the Seeder
**The Hiccup:** When we clicked the "Populate Presentation Data" button twice, the backend threw a massive error and stopped halfway through.
**The Fix:** Our backend database has a strict rule that `transaction_id` must be 100% unique. When the seeder tried to insert `TXN-1001` a second time, the database threw a `UniqueViolation` and blocked it (which is a good thing!). We fixed the user experience by locking the UI button to say "✅ Database Populated" after the first click so the user wouldn't trigger the error.

## 6. FastAPI Route Prioritization Conflicts (Overlapping Path Parameters)
**The Hiccup:** When adding public list endpoints like `GET /api/reviews/` or `GET /api/payments/`, FastAPI would throw 422 Validation Errors, treating the static paths (like `/`) or segments as path parameters (like `{review_id}`) and trying to parse them as integers.
**The Fix:** FastAPI evaluates routes sequentially. We resolved this by reorganizing the route definitions so that static routes (e.g. `GET /api/reviews/`) are defined *before* dynamic routes with path parameters (e.g. `GET /api/reviews/{review_id}`).

## 7. Landing Page Styles Exceeded the Production Limit
**The Hiccup:** The first landing-page build exceeded Angular's 8 KB component-style error budget by 148 bytes.
**The Fix:** We removed nonessential backdrop filters and decorative declarations, keeping the responsive layout and design intact. The production build then passed without increasing the project's budget.

## 8. The "Endless Loading Spinner" Bug, Actually Explained
**The Hiccup:** Entry #1 above blamed this on Angular "losing track of time" with `setTimeout()`. That's not quite it, and the same bug kept reappearing in new components (`ProviderReviewListComponent`, `SubmitReviewFormComponent`) because the real cause was never pinned down.
**The Fix:** This project has no `zone.js` installed at all, and never explicitly opts into Angular's zoneless mode either — it just runs without the thing that normally auto-detects "the app did something, re-render." Signals, `@Input` changes, and clicks on Angular-bound elements still trigger a re-render fine. What doesn't: mutating a plain class field inside an `HttpClient.subscribe()` callback, since that's not a signal write and not a DOM event. Every place that does this needs `ChangeDetectorRef` injected and `.detectChanges()` called in both the success and error branches. We confirmed this precisely by reading live computed styles in a browser session rather than guessing — the "loading" text was genuinely still in the DOM well after the network tab showed the response had already come back.

## 9. A `<td>` Cannot Safely Be `display: flex`
**The Hiccup:** A user reported the last column of a table "looked a little off." The buttons/badges themselves looked fine — the actual issue was the horizontal row-divider lines, which were jagged and inconsistent, but only under some rows.
**The Fix:** Several tables had `display: flex` applied directly to the `<td>` holding row-action buttons, to right-align them. A table cell's height is normally locked to match the tallest cell in its row — but overriding `display: flex` on the `<td>` itself breaks that, and the cell instead sizes to its own content. An empty action cell (e.g. a cancelled booking with no buttons to show) collapsed to ~31px while its row was actually ~60px tall, so its bottom border landed a full row short of where it should've been. The fix: never put `display: flex` on the `<td>` itself — wrap the buttons in an inner `<div>` and put the flex styling there instead.

## 10. A Response Schema Missing a Field Is Invisible From the Frontend
**The Hiccup:** The admin payments table's date/time column stayed blank even though every payment row genuinely had a `created_at` timestamp in the database.
**The Fix:** The `AdminPaymentResponse` Pydantic schema in `admin.py` never listed `created_at`/`updated_at` as fields, so FastAPI silently dropped them from the JSON response before the frontend ever saw them. No frontend bug, no error anywhere — the data was just never sent. When a real DB value "isn't showing up" in a page fed by a REST API, check the response schema before touching any Angular code.

## 11. One Stale Test File Can Fail the Entire Test Build, Not Just Itself
**The Hiccup:** `ng test` was failing before any of our own tests even got a chance to run.
**The Fix:** Angular's unit-test builder compiles every spec file in the project as one program. Six pre-existing spec files imported a component under its old pre-rename name (e.g. `import { BookingMonitoring }` when the actual export was `BookingMonitoringComponent`) — a leftover from `ng generate` scaffolding that was never updated after the component was renamed. A single bad import anywhere in the suite blocks the whole build, so `ng test` gave a wall of TypeScript errors with no test results at all until every one of the six was fixed.

## 12. Provider Profile Verification Status Blank due to HTTP 404 Exception
**The Hiccup:** The Provider Profile page showed a blank empty box for the "VERIFICATION" status chip.
**The Fix:** When a newly registered provider accessed `/provider/profile`, `loadProviderProfile()` called `GET /api/users/provider-profile`. Because the provider did not have a `ProviderProfile` database row yet, `ProviderService.get_current_profile` threw an HTTP `404 Not Found` exception. This caused Angular's HTTP subscription to fail, leaving `providerProfile` as `null` (and displaying a blank verification status). We fixed this by updating `ProviderService.get_current_profile` (`provider_service.py`) to auto-create a default `ProviderProfile` with `verification_status = UNVERIFIED` on first access, ensuring `GET /api/users/provider-profile` always succeeds with valid status data.

## 13. Account Status Changes Not Syncing due to HTTP 401 Rejection in Dependencies
**The Hiccup:** When an Admin changed a user's status to `Deactivated` or `Suspended`, the Customer Profile still showed `ACTIVE`.
**The Fix:** `get_current_user` was raising HTTP 401 for non-active users, so `GET /api/auth/me` failed and the frontend fell back to stale cached data. Removed the status block from `get_current_user` so status can always be read. Actual enforcement is handled by a new `require_active_user` dependency applied to all action endpoints.

## 14. Suspended/Deactivated Users Could Still Perform Actions After Status Sync Fix
**The Hiccup:** After fixing status sync (Lesson 13), suspended/deactivated users could still create bookings, payments, reviews, and use AI — because `get_current_user` no longer blocked them.
**The Fix:** Added a new `require_active_user` dependency in `dependencies.py` that raises HTTP 403 with a clear message (`"Your account has been suspended."` / `"This account has been deactivated."`) for non-active users. Applied it to all write/action endpoints: bookings, payments, reviews, notifications, AI, and profile updates. `GET /api/auth/me` and `GET /api/users/me` keep using bare `get_current_user` so the frontend can always read the latest status. Login is blocked at `AuthService.login` (HTTP 403) separately. `require_roles` now chains through `require_active_user` so role-protected endpoints are also status-gated automatically.

## 15. TypeScript TS2353 Error — `password` Does Not Exist in `UserProfileUpdate`
**The Hiccup:** Adding a password reset form to the Customer Profile page caused an Angular compile error: `Object literal may only specify known properties, and 'password' does not exist in type 'UserProfileUpdate'`.
**The Fix:** The `UserProfileUpdate` TypeScript interface in `auth.models.ts` was missing the `password` field. Added `password?: string | null` as an optional field to the interface. The backend `UserUpdate` Pydantic schema in `user.py` also needed `password: str | None = Field(default=None, min_length=8)` and the `UserService.update_profile` needed to hash and apply it with `hash_password()`.

## 16. Admin Changes to Email Verification / Account Status Not Visible to Users
**The Hiccup:** When an Admin toggled a user's Email Verification status or Account Status in `/admin/users`, the Customer/Provider Profile and Dashboard pages still showed the old values even after page refresh.
**The Fix:** Two separate root causes:
1. **Backend**: `get_current_user` was blocking non-active users with HTTP 401, so `GET /api/auth/me` failed and Angular's error handler kept stale localStorage data. Fixed by removing the status check from `get_current_user`.
2. **Frontend**: Customer Profile's `ngOnInit` was using the cached `currentUser()` signal without force-refreshing from the server. Fixed by always calling `authService.loadCurrentUser()` in `ngOnInit` with `ChangeDetectorRef.detectChanges()` in the subscribe callback.
Additionally, Customer Dashboard's status chip and Account Verification stat card were hardcoded strings — updated to use `[ngClass]` bindings on `user?.status` and `user?.email_verified`.

## 12. The Zoneless Change-Detection Gap Keeps Coming Back
**The Hiccup:** After fixing it in `ProviderReviewListComponent` and `SubmitReviewFormComponent`, the exact same bug turned up twice more: toast messages never appeared anywhere in the app (not just on one action — every single toast, ever), and a wrong password on login just left the spinner running forever with no error shown.
**The Fix:** Same root cause every time — plain field mutation inside a raw RxJS subscription or `HttpClient` callback, no signal write, no DOM event, so this zoneless app never re-renders. `ToastComponent` pushed to its array inside a `Subject` subscription; `Login`'s error branch set `errorMessage`/`loading` correctly but never told Angular to repaint. Both fixed with `ChangeDetectorRef.detectChanges()`. Lesson: any *new* component built with plain fields (not signals) and an async callback needs this by default — don't wait for a bug report to check.

## 13. A Backend Restart Can Wedge Mid-Shutdown During a Real DB Blip
**The Hiccup:** Frontend tests that make real (unmocked) `HttpClient` calls to `/admin/*` suddenly all hung for the full 10s hook timeout, with no code changes to explain it.
**The Fix:** uvicorn's `--reload` watches the entire `backend/` directory by default. Adding new files there (in our case, a new `mcp_server/` folder) can trigger an unrelated restart. If that restart's "waiting for connections to close" phase overlaps with a real, transient upstream DB connectivity blip (Supabase), the server can get stuck alive-but-unresponsive — *including* to endpoints that don't touch the database at all, since the async event loop can back up behind a blocking DB call. Diagnosed by checking `curl /api/health` (no DB) vs `/api/health/database` (DB) separately with short timeouts, and by reading the backend log tail, which showed "Shutting down" / "Waiting for connections to close" with nothing after it. Fixed by force-killing and restarting the process; the frontend "failures" were 100% collateral, confirmed because the exact same test run passed in 1.25s once the backend was healthy again (vs. 50s of hanging before).

## 14. A Feature Can Be "Built" and Still Not Do the One Thing That Matters
**The Hiccup:** The AI assistant's chat replies never mentioned real services, prices, or providers — just vague category names — even though a separate "Recommend a service" button on the same page worked fine and showed real listings.
**The Fix:** Two different code paths, only one of them DB-backed. `/ai/recommend` queried the `Service` table properly; `/ai/chat`'s prompt context only ever had category *names* (`select(ServiceCategory.name)`), never actual listings. Same lesson as the admin dashboard chart (#`hardcoded fake data`, entry above) and the "Verified provider" badge (hardcoded `true` for every card despite a real, working verification workflow already existing in admin) — when something "isn't working right," check whether the code path actually touches the database at all before assuming the logic itself is wrong.

## 15. A Bad SCSS Edit Can Silently Re-Parent Sibling Rules
**The Hiccup:** While adding one new CSS rule to make a button more prominent, a find-and-replace-style edit that inserted a closing `}` in the wrong place accidentally nested three unrelated, already-existing rules (`.btn-sm`, `.btn-xs`, `.btn-decline`) inside the new selector instead of leaving them inside the original `.btn { }` block. Nothing errored — Sass happily compiled `.new-selector-sm { }` as its own valid (but now useless) rule.
**The Fix:** Always re-read the file after an SCSS edit that touches brace structure, and check that sibling rules after the edit point are still nested under the same parent they were before — a compiler that accepts the file isn't the same as the file meaning what you intended. Caught here only because the file was re-read immediately afterward and the nesting looked wrong on inspection, not because anything failed a build.

## 16. Stock/Placeholder Images Need to Be Looked At, Not Just Fetched
**The Hiccup:** The first pass of category stock photos technically "worked" (real URLs, real images, all resolved) but several were poor matches once actually viewed: a random tools-drawer photo for "Plumbing" instead of anything plumbing-specific, a generic person-typing-on-a-laptop photo for "Tech Support" instead of anything reading as repair, and a soap-bubbles-on-a-floor close-up for "Cleaning" that didn't read as a cleaning *service* at a glance.
**The Fix:** Fetching a URL that returns `200 image/jpeg` only proves the link isn't broken — it says nothing about whether the content is actually a good match. Every candidate image needs to be downloaded and viewed (not just curl'd) before it ships, and rejected/re-picked if a human glancing at it wouldn't immediately recognize the category. Also: prefer specific, individually-verified photo ids (`images.unsplash.com/photo-<id>`) over a randomizing placeholder service (`picsum.photos/seed/...`) when the ask is for content that should *mean* something, not just look like a photo.

## 17. Schema-Qualify Queries Against a Supabase Database
**The Hiccup:** A quick sanity-check query (`information_schema.columns WHERE table_name = 'messages'`) after adding a new `messages` table returned a confusing, seemingly-corrupted result — duplicate `id` columns with different types, and columns that were never defined anywhere in the codebase (`topic`, `payload`, `event`, `private`, `inserted_at`).
**The Fix:** Not corruption — Supabase's built-in Realtime feature has its own internal `realtime.messages` table, in a different Postgres schema, and an unqualified `information_schema.columns` query matches table name across *every* schema, not just `public`. Re-running with `AND table_schema = 'public'` showed the new table was exactly as defined. Any ad-hoc schema-inspection query against a Supabase-hosted DB should filter `table_schema = 'public'` from the start, since Supabase ships several non-app schemas (`auth`, `storage`, `realtime`, etc.) alongside the application's own tables.

