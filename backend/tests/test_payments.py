from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_dashboard_stats():
    response = client.get("/api/admin/dashboard-stats")
    assert response.status_code == 200
    data = response.json()
    assert "total_users" in data
    assert "active_bookings" in data
    assert "total_revenue" in data

def test_create_payment_missing_fields():
    data = {
        "booking_id": 100,
        "amount": 50.0
    }
    response = client.post("/api/payments/", json=data)
    assert response.status_code == 422
