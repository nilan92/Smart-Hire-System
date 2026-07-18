from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.service_category import ServiceCategory
from app.tests.test_auth import register_payload

def login(client: TestClient, email: str) -> str:
    return client.post("/api/auth/login", json={"email": email, "password": "Password123"}).json()["access_token"]

def auth(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}

def setup_users_and_category(client: TestClient, db: Session):
    client.post("/api/auth/register", json=register_payload("provider@example.com", "provider"))
    client.post("/api/auth/register", json=register_payload("customer@example.com", "customer"))
    category = ServiceCategory(name="Plumbing", description="Repairs", icon="💧")
    db.add(category); db.commit(); db.refresh(category)
    return login(client, "provider@example.com"), login(client, "customer@example.com"), category

def test_provider_crud_and_public_search(client: TestClient, db: Session):
    provider, _, category = setup_users_and_category(client, db)
    created = client.post("/api/services", headers=auth(provider), json={"category_id":category.id,"title":"Emergency plumbing","description":"Fast repairs for leaks and blocked drains","price":3500,"city":"Colombo","duration":"1 hour","status":"active"})
    assert created.status_code == 201
    service_id = created.json()["id"]
    search = client.get("/api/services?q=plumbing&city=Colombo")
    assert search.status_code == 200 and search.json()[0]["id"] == service_id
    updated = client.put(f"/api/services/{service_id}", headers=auth(provider), json={"price":4000,"status":"paused"})
    assert updated.status_code == 200 and updated.json()["price"] == "4000.00"
    assert client.get("/api/services").json() == []

def test_customer_favourites_and_provider_areas(client: TestClient, db: Session):
    provider, customer, category = setup_users_and_category(client, db)
    service = client.post("/api/services", headers=auth(provider), json={"category_id":category.id,"title":"Home plumbing help","description":"Professional plumbing service at your home","price":2500,"city":"Colombo","status":"active"}).json()
    assert client.post(f"/api/services/{service['id']}/favourite", headers=auth(customer)).status_code == 201
    assert len(client.get("/api/services/favourites/me", headers=auth(customer)).json()) == 1
    assert client.delete(f"/api/services/{service['id']}/favourite", headers=auth(customer)).status_code == 204
    area = client.post("/api/services/areas", headers=auth(provider), json={"district":"Colombo","city":"Nugegoda","radius_km":12})
    assert area.status_code == 201
    assert client.get("/api/services/areas/mine", headers=auth(provider)).json()[0]["city"] == "Nugegoda"

def test_roles_and_ownership_are_enforced(client: TestClient, db: Session):
    provider, customer, category = setup_users_and_category(client, db)
    response = client.post("/api/services", headers=auth(customer), json={"category_id":category.id,"title":"Invalid service","description":"Customer cannot publish this service","price":10,"city":"Kandy"})
    assert response.status_code == 403
    response = client.post("/api/services/areas", headers=auth(customer), json={"district":"Kandy","city":"Kandy","radius_km":5})
    assert response.status_code == 403
