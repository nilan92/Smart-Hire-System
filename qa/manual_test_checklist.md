# Manual / Exploratory QA Checklist

Run through this before a demo, handoff, or release. Check the box, or note
the issue with a file/line reference if something's off. Reset test data you
create as you go (or use throwaway accounts like `qa/smoke_test.py` does).

## Setup

- [ ] Backend running (`uvicorn app.main:app --reload`) and `/api/health` returns 200
- [ ] Frontend running (`ng serve`) and loads at `localhost:4200`
- [ ] `backend/.env` has a real `OPENAI_API_KEY` if testing the AI assistant

## Customer journey

- [ ] Register a new customer account, then log in
- [ ] Browse services: search, filter by category/city, sort by price/rating
- [ ] Click "View service" on a card — modal shows correct title, price,
      provider, rating, description (browse-services **and** favourites tab)
- [ ] Favourite a service, confirm it appears on the Favourites tab, un-favourite it
- [ ] Create a booking for a future date/time
- [ ] Cancel a pending booking
- [ ] Log in as the provider for that booking, accept it, mark it completed
- [ ] Back as the customer: booking now shows "Completed" and a "Pay now" button
- [ ] Complete the pay-now flow (method selection → processing → success/confetti)
- [ ] Booking row now shows a "Paid" badge instead of "Pay now"
- [ ] Leave a review from `customer/reviews` for the completed booking
- [ ] Review appears under "Reviews you've written"
- [ ] Click a notification — confirm it navigates to the right page
      (bookings, or reviews for a "Booking completed" notification)

## Provider journey

- [ ] Log in as a provider
- [ ] Create/edit a service; "Average rating" stat reflects real reviews,
      not a hardcoded number
- [ ] Accept/reject a pending booking request
- [ ] Mark an accepted booking as completed
- [ ] `provider/reviews` shows the real average rating and review list
- [ ] `provider/payments` shows real payment history and correct totals
- [ ] Click a notification — confirms it navigates to Booking Requests

## Admin journey

- [ ] Log in as admin (`admin@gmail.com`)
- [ ] Dashboard stat cards match real counts (spot-check one, e.g. Total Reviews)
- [ ] Users: search/filter works, status dropdown updates a user
- [ ] Categories: "+ Add Category" opens a modal (not a browser prompt),
      icon picker works, new category appears in the table
- [ ] Categories: deleting a category still in use is blocked with a clear message
- [ ] Services: "View" opens a detail modal with real data; Approve/Pause
      actually change status
- [ ] Bookings: table shows real bookings; "View Details" opens a modal
      (not a browser alert)
- [ ] Reviews: table loads without error, delete works
- [ ] Payments: date/time column is populated (not blank), transaction ID
      is a real generated value for new payments

## Cross-cutting / regression watchlist

These are specific bugs found and fixed during development — worth a quick
re-check since they're easy to reintroduce:

- [ ] Any new table with a right-aligned action column: check the row
      divider borders are straight, not jagged (regression = `display: flex`
      applied directly to a `<td>` instead of an inner `<div>`)
- [ ] Any new component that fetches data via `HttpClient.subscribe()` and
      isn't signal-based: confirm the UI actually updates when the response
      arrives, not just that the network call succeeds (regression = missing
      `ChangeDetectorRef.detectChanges()` — this app has no zone.js)
- [ ] After any backend model change: confirm the live DB schema actually
      has the new/changed column (regression = `Base.metadata.create_all()`
      never alters existing tables, only creates missing ones)

## AI Assistant (if `OPENAI_API_KEY` is configured)

- [ ] Ask the customer AI assistant a service-related question, get a
      relevant response referencing real categories
- [ ] Assistant does not fabricate a booking — it guides to a
      recommendation and requires explicit date/time selection
- [ ] Provider AI Insights: generate a review summary for a service with
      existing reviews
