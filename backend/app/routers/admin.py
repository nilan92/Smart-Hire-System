from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.payment import Payment
from app.models.review import Review
from app.models.user import User
from app.models.booking import Booking
from app.models.service import Service

router = APIRouter(
    prefix="/api/admin",
    tags=["Admin"],
)

@router.get("/dashboard-stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_payments = db.query(Payment).count()
    total_reviews = db.query(Review).count()
    total_users = db.query(User).count()
    total_bookings = db.query(Booking).count()
    total_services = db.query(Service).count()
    return {
        "total_payments": total_payments,
        "total_reviews": total_reviews,
        "total_users": total_users,
        "total_bookings": total_bookings,
        "total_services": total_services
    }

@router.post("/seed-test-data")
def seed_test_data(db: Session = Depends(get_db)):
    # Seed core dependencies
    db.merge(User(id=101, name="Alice Customer"))
    db.merge(User(id=102, name="Bob Provider"))
    db.merge(User(id=103, name="Charlie Client"))
    db.merge(User(id=104, name="Diana Pro"))
    db.merge(Service(id=201))
    db.merge(Service(id=202))
    db.merge(Booking(id=301))
    db.merge(Booking(id=302))
    db.merge(Booking(id=303))
    db.merge(Booking(id=304))
    db.commit()

    # Seed Payments
    db.add(Payment(booking_id=301, customer_id=101, amount=150.0, status="completed", payment_method="credit_card", transaction_id="TXN-1001"))
    db.add(Payment(booking_id=302, customer_id=101, amount=89.99, status="pending", payment_method="paypal", transaction_id="TXN-1002"))
    db.add(Payment(booking_id=303, customer_id=103, amount=250.0, status="completed", payment_method="stripe", transaction_id="TXN-1003"))
    db.add(Payment(booking_id=304, customer_id=103, amount=12.50, status="completed", payment_method="credit_card", transaction_id="TXN-1004"))
    
    # Seed Reviews
    db.add(Review(booking_id=301, customer_id=101, provider_id=102, service_id=201, rating=5, comment="Exceptional work, highly recommended!"))
    db.add(Review(booking_id=302, customer_id=101, provider_id=102, service_id=201, rating=4, comment="Great service but arrived slightly late."))
    db.add(Review(booking_id=303, customer_id=103, provider_id=104, service_id=202, rating=5, comment="Absolutely fantastic experience."))
    db.add(Review(booking_id=304, customer_id=103, provider_id=104, service_id=202, rating=2, comment="Not what I expected."))
    
    db.commit()
    return {"message": "Test database seeded successfully!"}