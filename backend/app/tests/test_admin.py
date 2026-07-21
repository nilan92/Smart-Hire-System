from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.service_category import ServiceCategory
from app.models.user import AccountStatus, User, UserRole
from app.tests.test_auth import register_payload
from app.tests.test_services import auth, login


def _admin_token(client: TestClient, db: Session) -> str:
    client.post("/api/auth/register", json=register_payload("admin@example.com", "customer"))
    user = db.query(User).filter(User.email == "admin@example.com").first()
    user.role = UserRole.ADMIN
    user.status = AccountStatus.ACTIVE
    db.commit()
    return login(client, "admin@example.com")


def test_category_management_requires_admin_and_tracks_service_counts(client: TestClient, db: Session):
    admin = _admin_token(client, db)
    client.post("/api/auth/register", json=register_payload("provider@example.com", "provider"))
    provider = login(client, "provider@example.com")

    # Non-admin blocked
    assert client.get("/api/admin/categories", headers=auth(provider)).status_code == 403

    created = client.post(
        "/api/admin/categories", headers=auth(admin), json={"name": "Gardening", "icon": "🌱"}
    )
    assert created.status_code == 201
    category_id = created.json()["id"]
    assert created.json()["service_count"] == 0

    client.post(
        "/api/services",
        headers=auth(provider),
        json={"category_id": category_id, "title": "Lawn mowing service", "description": "Weekly lawn mowing and edging", "price": 2000, "city": "Colombo", "status": "active"},
    )

    listed = client.get("/api/admin/categories", headers=auth(admin)).json()
    gardening = next(c for c in listed if c["id"] == category_id)
    assert gardening["service_count"] == 1

    # Cannot delete a category still in use
    assert client.delete(f"/api/admin/categories/{category_id}", headers=auth(admin)).status_code == 400


def test_service_moderation_lists_all_statuses_and_updates_status(client: TestClient, db: Session):
    admin = _admin_token(client, db)
    client.post("/api/auth/register", json=register_payload("provider2@example.com", "provider"))
    provider = login(client, "provider2@example.com")

    category = ServiceCategory(name="Repairs", description="Fixes", icon="🛠️")
    db.add(category); db.commit(); db.refresh(category)

    service = client.post(
        "/api/services",
        headers=auth(provider),
        json={"category_id": category.id, "title": "Appliance repair", "description": "Fix broken home appliances fast", "price": 1500, "city": "Colombo", "status": "draft"},
    ).json()

    services = client.get("/api/admin/services", headers=auth(admin)).json()
    assert any(s["id"] == service["id"] and s["status"] == "draft" for s in services)

    updated = client.put(
        f"/api/admin/services/{service['id']}/status", headers=auth(admin), json={"status": "active"}
    )
    assert updated.status_code == 200 and updated.json()["status"] == "active"

    assert client.put(
        f"/api/admin/services/{service['id']}/status", headers=auth(admin), json={"status": "not-a-status"}
    ).status_code == 400
