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
