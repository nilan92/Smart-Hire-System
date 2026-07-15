from fastapi.testclient import TestClient

from app.tests.test_auth import register_payload


def login(client: TestClient, email: str, password: str = "Password123") -> str:
    response = client.post("/api/auth/login", json={"email": email, "password": password})
    return response.json()["access_token"]


def test_customer_cannot_access_provider_profile_endpoint(client: TestClient):
    client.post("/api/auth/register", json=register_payload())
    token = login(client, "customer@example.com")

    response = client.get(
        "/api/users/provider-profile",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 403


def test_provider_can_view_and_update_provider_profile(client: TestClient):
    client.post("/api/auth/register", json=register_payload("provider@example.com", "provider"))
    token = login(client, "provider@example.com")

    response = client.put(
        "/api/users/provider-profile",
        headers={"Authorization": f"Bearer {token}"},
        json={"bio": "Updated bio", "years_experience": 7, "avg_rating": 5},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["bio"] == "Updated bio"
    assert body["years_experience"] == 7
    assert body["avg_rating"] == "0.00"


def test_user_can_update_full_name_and_phone(client: TestClient):
    client.post("/api/auth/register", json=register_payload())
    token = login(client, "customer@example.com")

    response = client.put(
        "/api/users/me",
        headers={"Authorization": f"Bearer {token}"},
        json={"full_name": "Updated User", "phone": "0711111111", "role": "admin"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["full_name"] == "Updated User"
    assert body["phone"] == "0711111111"
    assert body["role"] == "customer"
    assert "password_hash" not in body


def test_public_provider_response_is_safe(client: TestClient):
    register = client.post("/api/auth/register", json=register_payload("provider@example.com", "provider"))
    provider_id = register.json()["id"]

    response = client.get(f"/api/users/providers/{provider_id}")

    assert response.status_code == 200
    body = response.json()
    assert body["id"] == provider_id
    assert "password_hash" not in body
    assert body["provider_profile"]["verification_status"] == "unverified"
