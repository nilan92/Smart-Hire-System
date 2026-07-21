# Development Hiccups & Solutions

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
