from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_reviews_for_provider():
    response = client.get("/api/reviews/provider/2")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_submit_review_invalid_rating():
    data = {
        "booking_id": 999,
        "customer_id": 1,
        "provider_id": 2,
        "service_id": 1,
        "rating": 6,
        "comment": "Too high!"
    }
    response = client.post("/api/reviews/", json=data)
    assert response.status_code == 422
