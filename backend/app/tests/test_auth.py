from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.security import verify_password
from app.models.user import AccountStatus, User


def register_payload(email: str = "customer@example.com", role: str = "customer") -> dict:
    payload = {
        "email": email,
        "password": "Password123",
        "confirm_password": "Password123",
        "full_name": "Test User",
        "phone": "0771234567",
        "role": role,
    }
    if role == "provider":
        payload["provider_profile"] = {
            "bio": "Experienced service provider",
            "years_experience": 4,
        }
    return payload


def test_customer_registration_succeeds_and_hashes_password(client: TestClient, db: Session):
    response = client.post("/api/auth/register", json=register_payload())

    assert response.status_code == 201
    body = response.json()
    assert body["email"] == "customer@example.com"
    assert "password_hash" not in body

    user = db.query(User).filter(User.email == "customer@example.com").one()
    assert user.password_hash != "Password123"
    assert verify_password("Password123", user.password_hash)


def test_provider_registration_creates_profile(client: TestClient):
    response = client.post("/api/auth/register", json=register_payload("provider@example.com", "provider"))

    assert response.status_code == 201
    body = response.json()
    assert body["role"] == "provider"

    me = client.post(
        "/api/auth/login",
        json={"email": "provider@example.com", "password": "Password123"},
    ).json()
    profile = client.get(
        "/api/users/provider-profile",
        headers={"Authorization": f"Bearer {me['access_token']}"},
    )
    assert profile.status_code == 200
    assert profile.json()["years_experience"] == 4


def test_duplicate_email_is_rejected(client: TestClient):
    client.post("/api/auth/register", json=register_payload())
    response = client.post("/api/auth/register", json=register_payload())

    assert response.status_code == 409


def test_mismatched_passwords_are_rejected(client: TestClient):
    payload = register_payload()
    payload["confirm_password"] = "Different123"

    response = client.post("/api/auth/register", json=payload)

    assert response.status_code == 422


def test_admin_registration_is_rejected(client: TestClient):
    payload = register_payload()
    payload["role"] = "admin"

    response = client.post("/api/auth/register", json=payload)

    assert response.status_code == 422


def test_valid_login_returns_jwt(client: TestClient):
    client.post("/api/auth/register", json=register_payload())

    response = client.post(
        "/api/auth/login",
        json={"email": "customer@example.com", "password": "Password123"},
    )

    assert response.status_code == 200
    assert response.json()["access_token"]
    assert response.json()["token_type"] == "bearer"


def test_invalid_password_is_rejected(client: TestClient):
    client.post("/api/auth/register", json=register_payload())

    response = client.post(
        "/api/auth/login",
        json={"email": "customer@example.com", "password": "wrong-password"},
    )

    assert response.status_code == 401


def test_suspended_account_cannot_log_in(client: TestClient, db: Session):
    client.post("/api/auth/register", json=register_payload())
    user = db.query(User).filter(User.email == "customer@example.com").one()
    user.status = AccountStatus.SUSPENDED
    db.commit()

    response = client.post(
        "/api/auth/login",
        json={"email": "customer@example.com", "password": "Password123"},
    )

    assert response.status_code == 403


def test_deactivated_account_cannot_log_in(client: TestClient, db: Session):
    client.post("/api/auth/register", json=register_payload())
    user = db.query(User).filter(User.email == "customer@example.com").one()
    user.status = AccountStatus.DEACTIVATED
    db.commit()

    response = client.post(
        "/api/auth/login",
        json={"email": "customer@example.com", "password": "Password123"},
    )

    assert response.status_code == 403


def test_protected_endpoint_without_token_returns_401(client: TestClient):
    response = client.get("/api/auth/me")

    assert response.status_code == 401


def test_invalid_token_returns_401(client: TestClient):
    response = client.get("/api/auth/me", headers={"Authorization": "Bearer invalid"})

    assert response.status_code == 401
