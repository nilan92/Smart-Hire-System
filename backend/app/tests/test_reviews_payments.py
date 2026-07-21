from datetime import datetime, timedelta, timezone

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.provider_profile import ProviderProfile
from app.models.service_category import ServiceCategory
from app.models.user import User
from app.tests.test_auth import register_payload
from app.tests.test_services import auth, login


def _completed_booking(client: TestClient, db: Session):
    client.post("/api/auth/register", json=register_payload("provider@example.com", "provider"))
    client.post("/api/auth/register", json=register_payload("customer@example.com", "customer"))
    provider, customer = login(client, "provider@example.com"), login(client, "customer@example.com")

    category = ServiceCategory(name="Plumbing", description="Repairs", icon="💧")
    db.add(category)
    db.commit()
    db.refresh(category)

    service = client.post(
        "/api/services",
        headers=auth(provider),
        json={
            "category_id": category.id,
            "title": "Emergency plumbing",
            "description": "Fast repairs for leaks and blocked drains",
            "price": 3500,
            "city": "Colombo",
            "status": "active",
        },
    ).json()

    future = (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()
    booking = client.post(
        "/api/bookings",
        headers=auth(customer),
        json={"service_id": service["id"], "booking_date": future},
    ).json()

    client.put(f"/api/bookings/{booking['id']}/accept", headers=auth(provider))
    client.put(f"/api/bookings/{booking['id']}/complete", headers=auth(provider))

    return provider, customer, booking


def test_review_requires_completed_booking_owned_by_customer(client: TestClient, db: Session):
    client.post("/api/auth/register", json=register_payload("provider@example.com", "provider"))
    client.post("/api/auth/register", json=register_payload("customer@example.com", "customer"))
    provider, customer = login(client, "provider@example.com"), login(client, "customer@example.com")

    category = ServiceCategory(name="Plumbing", description="Repairs", icon="💧")
    db.add(category); db.commit(); db.refresh(category)
    service = client.post(
        "/api/services",
        headers=auth(provider),
        json={"category_id": category.id, "title": "Plumbing", "description": "Fast repairs for leaks", "price": 3500, "city": "Colombo", "status": "active"},
    ).json()
    future = (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()
    booking = client.post("/api/bookings", headers=auth(customer), json={"service_id": service["id"], "booking_date": future}).json()

    # Still pending, not completed -> rejected
    resp = client.post(
        "/api/reviews/",
        headers=auth(customer),
        json={"booking_id": booking["id"], "customer_id": 999, "provider_id": 999, "service_id": 999, "rating": 5},
    )
    assert resp.status_code == 400


def test_review_creation_updates_provider_rating_and_rejects_bad_rating(client: TestClient, db: Session):
    provider, customer, booking = _completed_booking(client, db)

    # Out-of-range rating rejected by schema validation
    assert client.post(
        "/api/reviews/",
        headers=auth(customer),
        json={"booking_id": booking["id"], "customer_id": 1, "provider_id": 1, "service_id": 1, "rating": 6},
    ).status_code == 422

    created = client.post(
        "/api/reviews/",
        headers=auth(customer),
        json={"booking_id": booking["id"], "customer_id": 999, "provider_id": 999, "service_id": 999, "rating": 4, "comment": "Great work"},
    )
    assert created.status_code == 200
    body = created.json()
    # server-side values win over spoofed client fields
    assert body["customer_id"] != 999

    provider_user = db.query(User).filter(User.email == "provider@example.com").first()
    profile = db.query(ProviderProfile).filter(ProviderProfile.user_id == provider_user.id).first()
    assert float(profile.avg_rating) == 4.0
    assert profile.total_reviews == 1

    # Duplicate review on same booking rejected
    assert client.post(
        "/api/reviews/",
        headers=auth(customer),
        json={"booking_id": booking["id"], "customer_id": 999, "provider_id": 999, "service_id": 999, "rating": 5},
    ).status_code == 400


def test_payment_requires_auth_and_ownership(client: TestClient, db: Session):
    provider, customer, booking = _completed_booking(client, db)

    # No auth at all
    assert client.post("/api/payments/", json={"booking_id": booking["id"], "customer_id": 1, "amount": 100}).status_code == 401

    # Negative/zero amount rejected
    assert client.post(
        "/api/payments/", headers=auth(customer), json={"booking_id": booking["id"], "customer_id": 1, "amount": 0}
    ).status_code == 422

    created = client.post(
        "/api/payments/",
        headers=auth(customer),
        json={"booking_id": booking["id"], "customer_id": 999, "amount": 150, "payment_method": "card"},
    )
    assert created.status_code == 200
    body = created.json()
    assert body["customer_id"] != 999  # spoofed id ignored
    assert body["status"] == "completed"  # simulated gateway settles immediately

    # Duplicate payment for the same booking rejected
    assert client.post(
        "/api/payments/", headers=auth(customer), json={"booking_id": booking["id"], "customer_id": 1, "amount": 150}
    ).status_code == 400

    # Customer can see it via their own payments list
    mine_customer = client.get("/api/payments/customer/me", headers=auth(customer))
    assert mine_customer.status_code == 200 and len(mine_customer.json()) == 1

    # Provider can see it via their own payments list
    mine = client.get("/api/payments/provider/me", headers=auth(provider))
    assert mine.status_code == 200 and len(mine.json()) == 1

    payment_id = created.json()["id"]

    # Non-admin cannot update payment status
    assert client.put(f"/api/payments/{payment_id}", headers=auth(customer), json={"status": "refunded"}).status_code == 403


def test_payment_requires_completed_booking(client: TestClient, db: Session):
    client.post("/api/auth/register", json=register_payload("provider@example.com", "provider"))
    client.post("/api/auth/register", json=register_payload("customer@example.com", "customer"))
    provider, customer = login(client, "provider@example.com"), login(client, "customer@example.com")

    category = ServiceCategory(name="Plumbing", description="Repairs", icon="💧")
    db.add(category); db.commit(); db.refresh(category)
    service = client.post(
        "/api/services",
        headers=auth(provider),
        json={"category_id": category.id, "title": "Plumbing", "description": "Fast repairs for leaks", "price": 3500, "city": "Colombo", "status": "active"},
    ).json()
    future = (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()
    booking = client.post("/api/bookings", headers=auth(customer), json={"service_id": service["id"], "booking_date": future}).json()

    # Booking still pending -> payment rejected
    assert client.post(
        "/api/payments/", headers=auth(customer), json={"booking_id": booking["id"], "customer_id": 1, "amount": 100}
    ).status_code == 400
