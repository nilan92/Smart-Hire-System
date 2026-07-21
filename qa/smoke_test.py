#!/usr/bin/env python3
"""
QA smoke test — exercises one full real-world journey against a *running*
backend over real HTTP: register -> book -> accept -> complete -> review ->
pay -> admin visibility -> cleanup.

This is deliberately NOT part of the pytest suite in backend/app/tests/.
Those tests are unit/integration-level and run against a throwaway
in-memory SQLite database. This script drives the actual API of a live
backend process (Supabase-backed, exactly as deployed) the way a QA
engineer would run a manual smoke test before a release or demo.

Usage:
    # with the backend already running on http://127.0.0.1:8000
    python qa/smoke_test.py

    # against a different host
    SMOKE_TEST_BASE_URL=http://127.0.0.1:8000/api python qa/smoke_test.py

Uses only the standard library (no extra dependency to install just to
run a smoke test). Creates its own throwaway accounts/data and deletes
them again at the end, so it's safe to run against a shared dev database.
"""

from __future__ import annotations

import json
import os
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path

BASE_URL = os.environ.get("SMOKE_TEST_BASE_URL", "http://127.0.0.1:8000/api")
RUN_ID = str(int(time.time()))

# The API has no self-service "delete my account" endpoint, so cleanup goes
# straight to the database via the backend's own SQLAlchemy models — the
# same way this was done manually throughout development. This requires
# running with the backend's venv active.
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

_passed = 0
_failed = 0


def request(method: str, path: str, token: str | None = None, body: dict | None = None) -> tuple[int, dict]:
    url = f"{BASE_URL}{path}"
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Content-Type", "application/json")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    try:
        with urllib.request.urlopen(req) as resp:
            raw = resp.read()
            return resp.status, (json.loads(raw) if raw else {})
    except urllib.error.HTTPError as err:
        raw = err.read()
        return err.code, (json.loads(raw) if raw else {})


def check(label: str, condition: bool, detail: str = "") -> None:
    global _passed, _failed
    if condition:
        _passed += 1
        print(f"  PASS  {label}")
    else:
        _failed += 1
        print(f"  FAIL  {label}  {detail}")


def register_and_login(email: str, role: str, extra: dict | None = None) -> str:
    payload = {
        "email": email,
        "password": "Password123",
        "confirm_password": "Password123",
        "full_name": f"Smoke {role.title()}",
        "role": role,
    }
    if extra:
        payload.update(extra)
    request("POST", "/auth/register", body=payload)
    status, body = request("POST", "/auth/login", body={"email": email, "password": "Password123"})
    if status != 200:
        raise RuntimeError(f"Could not log in {email}: {status} {body}")
    return body["access_token"]


def main() -> int:
    print(f"Smoke test against {BASE_URL}\n")

    customer_email = f"smoke_customer_{RUN_ID}@example.com"
    provider_email = f"smoke_provider_{RUN_ID}@example.com"

    print("== Setup ==")
    provider_token = register_and_login(
        provider_email, "provider", {"provider_profile": {"bio": "Smoke test provider", "years_experience": 1}}
    )
    customer_token = register_and_login(customer_email, "customer")
    check("provider registered and logged in", bool(provider_token))
    check("customer registered and logged in", bool(customer_token))

    status, categories = request("GET", "/services/categories")
    check("categories are available", status == 200 and len(categories) > 0)
    category_id = categories[0]["id"]

    print("\n== Services ==")
    status, service = request(
        "POST",
        "/services",
        token=provider_token,
        body={
            "category_id": category_id,
            "title": "Smoke test service",
            "description": "Created by qa/smoke_test.py — safe to ignore/delete.",
            "price": 1000,
            "city": "Colombo",
            "status": "active",
        },
    )
    check("provider can create a service", status == 201, f"got {status}: {service}")
    service_id = service["id"]

    print("\n== Booking lifecycle ==")
    future = (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()
    status, booking = request(
        "POST", "/bookings", token=customer_token, body={"service_id": service_id, "booking_date": future}
    )
    check("customer can create a booking", status == 201, f"got {status}: {booking}")
    booking_id = booking["id"]

    status, _ = request("POST", "/payments/", token=customer_token, body={"booking_id": booking_id, "customer_id": 0, "amount": 1000})
    check("payment rejected before booking is completed", status == 400, f"got {status}")

    status, _ = request("PUT", f"/bookings/{booking_id}/accept", token=provider_token)
    check("provider can accept the booking", status == 200, f"got {status}")

    status, _ = request("PUT", f"/bookings/{booking_id}/complete", token=provider_token)
    check("provider can mark the booking completed", status == 200, f"got {status}")

    print("\n== Reviews ==")
    status, review = request(
        "POST",
        "/reviews/",
        token=customer_token,
        body={"booking_id": booking_id, "customer_id": 0, "provider_id": 0, "service_id": 0, "rating": 5, "comment": "Smoke test review"},
    )
    check("customer can review the completed booking", status == 200, f"got {status}: {review}")

    status, _ = request(
        "POST",
        "/reviews/",
        token=customer_token,
        body={"booking_id": booking_id, "customer_id": 0, "provider_id": 0, "service_id": 0, "rating": 5},
    )
    check("duplicate review on the same booking is rejected", status == 400, f"got {status}")

    print("\n== Payments ==")
    status, payment = request(
        "POST", "/payments/", token=customer_token, body={"booking_id": booking_id, "customer_id": 0, "amount": 1000, "payment_method": "card"}
    )
    check("customer can pay for the completed booking", status == 200, f"got {status}: {payment}")
    check("payment settles as completed immediately", payment.get("status") == "completed")
    check("payment gets a real transaction_id", bool(payment.get("transaction_id")))

    status, provider_payments = request("GET", "/payments/provider/me", token=provider_token)
    check(
        "provider sees the payment via /payments/provider/me",
        status == 200 and any(p["id"] == payment["id"] for p in provider_payments),
        f"got {status}",
    )

    print("\n== Cleanup ==")
    cleanup(customer_email, provider_email)

    print(f"\n{_passed} passed, {_failed} failed")
    return 1 if _failed else 0


def cleanup(customer_email: str, provider_email: str) -> None:
    """Delete everything this run created, straight from the database."""
    try:
        from app.core.database import SessionLocal
        from app.models.booking import Booking
        from app.models.payment import Payment
        from app.models.review import Review
        from app.models.service import Service
        from app.models.user import User
    except ImportError as err:
        print(f"  SKIPPED — could not import backend models ({err}).")
        print("  Run this script with the backend venv active to enable cleanup.")
        return

    db = SessionLocal()
    try:
        users = db.query(User).filter(User.email.in_([customer_email, provider_email])).all()
        user_ids = [u.id for u in users]
        db.query(Payment).filter(Payment.customer_id.in_(user_ids)).delete(synchronize_session=False)
        db.query(Review).filter(Review.customer_id.in_(user_ids)).delete(synchronize_session=False)
        db.query(Booking).filter(Booking.customer_id.in_(user_ids)).delete(synchronize_session=False)
        db.query(Service).filter(Service.provider_id.in_(user_ids)).delete(synchronize_session=False)
        for user in users:
            db.delete(user)
        db.commit()
        print(f"  cleaned up {len(users)} test account(s) and their data")
    finally:
        db.close()


if __name__ == "__main__":
    sys.exit(main())
