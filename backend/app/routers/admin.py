from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, ConfigDict
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.booking import Booking
from app.models.payment import Payment
from app.models.review import Review
from app.models.service import Service, ServiceStatus
from app.models.service_category import ServiceCategory
from app.schemas.booking import BookingResponse
from app.models.user import AccountStatus, User, UserRole

# ---------------------------------------------------------------------------
# Inline response schemas
# ---------------------------------------------------------------------------

class AdminUserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    phone: Optional[str] = None
    role: str
    status: str
    email_verified: bool
    created_at: Optional[datetime] = None
    verification_status: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class AdminPaymentResponse(BaseModel):
    id: int
    booking_id: int
    customer_id: int
    customer_email: Optional[str] = None
    amount: float
    status: str
    payment_method: Optional[str] = None
    transaction_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AdminCategoryResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    icon: str
    service_count: int


class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None
    icon: str = "🛠️"


class AdminServiceResponse(BaseModel):
    id: int
    provider_id: int
    provider_name: str
    category_id: int
    title: str
    description: str
    price: float
    city: str
    duration: str
    status: ServiceStatus
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ServiceStatusUpdate(BaseModel):
    status: str


class AdminReviewResponse(BaseModel):
    id: int
    booking_id: int
    customer_id: int
    provider_id: int
    service_id: int
    rating: int
    comment: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class UserStatusUpdate(BaseModel):
    status: str


class PaymentStatusUpdate(BaseModel):
    status: str


# ---------------------------------------------------------------------------
# Router
# ---------------------------------------------------------------------------

router = APIRouter(
    prefix="/api/admin",
    tags=["Admin"],
)

_admin_dep = Depends(require_roles(UserRole.ADMIN))


# ---------------------------------------------------------------------------
# Dashboard Stats
# ---------------------------------------------------------------------------

@router.get("/dashboard-stats", dependencies=[_admin_dep])
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_payments = db.query(Payment).count()
    total_reviews = db.query(Review).count()
    total_users = db.query(User).count()
    total_bookings = db.query(Booking).count()
    total_services = db.query(Service).count()

    avg_rating_result = db.query(func.avg(Review.rating)).scalar()
    avg_review_rating = round(float(avg_rating_result), 2) if avg_rating_result else 0.0

    total_revenue_result = (
        db.query(func.sum(Payment.amount))
        .filter(Payment.status == "completed")
        .scalar()
    )
    total_revenue = round(float(total_revenue_result), 2) if total_revenue_result else 0.0

    return {
        "total_payments": total_payments,
        "total_reviews": total_reviews,
        "total_users": total_users,
        "total_bookings": total_bookings,
        "total_services": total_services,
        "avg_review_rating": avg_review_rating,
        "total_revenue": total_revenue,
    }


# ---------------------------------------------------------------------------
# Seed Test Data (fixed)
# ---------------------------------------------------------------------------

@router.post("/seed-test-data", dependencies=[_admin_dep])
def seed_test_data(db: Session = Depends(get_db)):
    db.merge(User(
        id=101, full_name="Alice Customer", email="alice@example.com",
        password_hash="hashed", role=UserRole.CUSTOMER, status=AccountStatus.ACTIVE,
    ))
    db.merge(User(
        id=102, full_name="Bob Provider", email="bob@example.com",
        password_hash="hashed", role=UserRole.PROVIDER, status=AccountStatus.ACTIVE,
    ))
    db.merge(User(
        id=103, full_name="Charlie Client", email="charlie@example.com",
        password_hash="hashed", role=UserRole.CUSTOMER, status=AccountStatus.ACTIVE,
    ))
    db.merge(User(
        id=104, full_name="Diana Pro", email="diana@example.com",
        password_hash="hashed", role=UserRole.PROVIDER, status=AccountStatus.ACTIVE,
    ))

    db.merge(Service(id=201))
    db.merge(Service(id=202))
    db.merge(Booking(id=301))
    db.merge(Booking(id=302))
    db.merge(Booking(id=303))
    db.merge(Booking(id=304))
    db.commit()

    # Payments — skip duplicates by transaction_id
    existing_txns = {
        r[0] for r in db.query(Payment.transaction_id).all() if r[0] is not None
    }
    new_payments = [
        Payment(booking_id=301, customer_id=101, amount=150.0, status="completed",
                payment_method="credit_card", transaction_id="TXN-1001"),
        Payment(booking_id=302, customer_id=101, amount=89.99, status="pending",
                payment_method="paypal", transaction_id="TXN-1002"),
        Payment(booking_id=303, customer_id=103, amount=250.0, status="completed",
                payment_method="stripe", transaction_id="TXN-1003"),
        Payment(booking_id=304, customer_id=103, amount=12.50, status="completed",
                payment_method="credit_card", transaction_id="TXN-1004"),
    ]
    for p in new_payments:
        if p.transaction_id not in existing_txns:
            db.add(p)

    # Reviews — skip duplicates by booking_id (unique constraint)
    existing_booking_reviews = {r[0] for r in db.query(Review.booking_id).all()}
    new_reviews = [
        Review(booking_id=301, customer_id=101, provider_id=102, service_id=201,
               rating=5, comment="Exceptional work, highly recommended!"),
        Review(booking_id=302, customer_id=101, provider_id=102, service_id=201,
               rating=4, comment="Great service but arrived slightly late."),
        Review(booking_id=303, customer_id=103, provider_id=104, service_id=202,
               rating=5, comment="Absolutely fantastic experience."),
        Review(booking_id=304, customer_id=103, provider_id=104, service_id=202,
               rating=2, comment="Not what I expected."),
    ]
    for r in new_reviews:
        if r.booking_id not in existing_booking_reviews:
            db.add(r)

    db.commit()
    return {"message": "Test database seeded successfully!"}


class VerificationStatusUpdate(BaseModel):
    verification_status: str


# ---------------------------------------------------------------------------
# User Management
# ---------------------------------------------------------------------------

@router.get("/users", response_model=List[AdminUserResponse], dependencies=[_admin_dep])
def list_users(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    users = db.query(User).offset(skip).limit(limit).all()
    results = []
    for u in users:
        ver_status = None
        if u.provider_profile:
            ver_status = (
                u.provider_profile.verification_status.value
                if hasattr(u.provider_profile.verification_status, 'value')
                else str(u.provider_profile.verification_status)
            )
        results.append(
            AdminUserResponse(
                id=u.id,
                email=u.email,
                full_name=u.full_name,
                phone=u.phone,
                role=u.role.value if hasattr(u.role, 'value') else str(u.role),
                status=u.status.value if hasattr(u.status, 'value') else str(u.status),
                email_verified=u.email_verified,
                created_at=u.created_at,
                verification_status=ver_status,
            )
        )
    return results


@router.put("/users/{user_id}/status", response_model=AdminUserResponse, dependencies=[_admin_dep])
def update_user_status(
    user_id: int,
    body: UserStatusUpdate,
    db: Session = Depends(get_db),
):
    allowed = {s.value for s in AccountStatus}
    if body.status not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of: {', '.join(sorted(allowed))}",
        )
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.status = AccountStatus(body.status)
    db.commit()
    db.refresh(user)
    ver_status = user.provider_profile.verification_status if user.provider_profile else None
    return AdminUserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        phone=user.phone,
        role=user.role.value if hasattr(user.role, 'value') else str(user.role),
        status=user.status.value if hasattr(user.status, 'value') else str(user.status),
        email_verified=user.email_verified,
        created_at=user.created_at,
        verification_status=ver_status,
    )


@router.put("/users/{user_id}/email-verification", response_model=AdminUserResponse, dependencies=[_admin_dep])
def toggle_user_email_verification(
    user_id: int,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.email_verified = not user.email_verified
    db.commit()
    db.refresh(user)
    ver_status = user.provider_profile.verification_status if user.provider_profile else None
    return AdminUserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        phone=user.phone,
        role=user.role.value if hasattr(user.role, 'value') else str(user.role),
        status=user.status.value if hasattr(user.status, 'value') else str(user.status),
        email_verified=user.email_verified,
        created_at=user.created_at,
        verification_status=ver_status,
    )


@router.put("/users/{user_id}/provider-verification", response_model=AdminUserResponse, dependencies=[_admin_dep])
def update_provider_verification(
    user_id: int,
    body: VerificationStatusUpdate,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.provider_profile:
        raise HTTPException(status_code=400, detail="User does not have a provider profile")

    user.provider_profile.verification_status = body.verification_status
    db.commit()
    db.refresh(user)

    return AdminUserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        phone=user.phone,
        role=user.role.value if hasattr(user.role, 'value') else str(user.role),
        status=user.status.value if hasattr(user.status, 'value') else str(user.status),
        email_verified=user.email_verified,
        created_at=user.created_at,
        verification_status=user.provider_profile.verification_status,
    )


# ---------------------------------------------------------------------------
# Payment Management
# ---------------------------------------------------------------------------

@router.get("/payments", response_model=List[AdminPaymentResponse], dependencies=[_admin_dep])
def list_admin_payments(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(Payment, User.email)
        .outerjoin(User, User.id == Payment.customer_id)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [
        AdminPaymentResponse(
            id=p.id, booking_id=p.booking_id, customer_id=p.customer_id,
            customer_email=email, amount=p.amount, status=p.status,
            payment_method=p.payment_method, transaction_id=p.transaction_id,
            created_at=p.created_at, updated_at=p.updated_at,
        )
        for p, email in rows
    ]


@router.put("/payments/{payment_id}/status", response_model=AdminPaymentResponse, dependencies=[_admin_dep])
def update_admin_payment_status(
    payment_id: int,
    body: PaymentStatusUpdate,
    db: Session = Depends(get_db),
):
    allowed = {"pending", "completed", "failed", "refunded"}
    if body.status not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of: {', '.join(sorted(allowed))}",
        )
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    payment.status = body.status
    db.commit()
    db.refresh(payment)
    customer_email = db.query(User.email).filter(User.id == payment.customer_id).scalar()
    return AdminPaymentResponse(
        id=payment.id, booking_id=payment.booking_id, customer_id=payment.customer_id,
        customer_email=customer_email, amount=payment.amount, status=payment.status,
        payment_method=payment.payment_method, transaction_id=payment.transaction_id,
        created_at=payment.created_at, updated_at=payment.updated_at,
    )


# ---------------------------------------------------------------------------
# Booking Monitoring
# ---------------------------------------------------------------------------

@router.get("/bookings", response_model=List[BookingResponse], dependencies=[_admin_dep])
def list_admin_bookings(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=200),
    db: Session = Depends(get_db),
):
    return db.query(Booking).order_by(Booking.created_at.desc()).offset(skip).limit(limit).all()


# ---------------------------------------------------------------------------
# Review Management
# ---------------------------------------------------------------------------

@router.get("/reviews", response_model=List[AdminReviewResponse], dependencies=[_admin_dep])
def list_admin_reviews(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    return db.query(Review).offset(skip).limit(limit).all()


@router.delete("/reviews/{review_id}", dependencies=[_admin_dep])
def delete_review(review_id: int, db: Session = Depends(get_db)):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    db.delete(review)
    db.commit()
    return {"message": f"Review {review_id} deleted successfully"}


# ---------------------------------------------------------------------------
# Category Management
# ---------------------------------------------------------------------------

@router.get("/categories", response_model=List[AdminCategoryResponse], dependencies=[_admin_dep])
def list_admin_categories(db: Session = Depends(get_db)):
    rows = (
        db.query(ServiceCategory, func.count(Service.id))
        .outerjoin(Service, Service.category_id == ServiceCategory.id)
        .group_by(ServiceCategory.id)
        .order_by(ServiceCategory.id)
        .all()
    )
    return [
        AdminCategoryResponse(
            id=category.id, name=category.name, description=category.description,
            icon=category.icon, service_count=count,
        )
        for category, count in rows
    ]


@router.post("/categories", response_model=AdminCategoryResponse, status_code=201, dependencies=[_admin_dep])
def create_admin_category(body: CategoryCreate, db: Session = Depends(get_db)):
    if db.query(ServiceCategory).filter(ServiceCategory.name == body.name).first():
        raise HTTPException(status_code=400, detail="A category with this name already exists")
    category = ServiceCategory(name=body.name, description=body.description, icon=body.icon)
    db.add(category)
    db.commit()
    db.refresh(category)
    return AdminCategoryResponse(
        id=category.id, name=category.name, description=category.description,
        icon=category.icon, service_count=0,
    )


@router.delete("/categories/{category_id}", dependencies=[_admin_dep])
def delete_admin_category(category_id: int, db: Session = Depends(get_db)):
    category = db.query(ServiceCategory).filter(ServiceCategory.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    services_in_use = db.query(Service).filter(Service.category_id == category_id).count()
    if services_in_use:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete: {services_in_use} service(s) still use this category",
        )
    db.delete(category)
    db.commit()
    return {"message": f"Category {category_id} deleted successfully"}


# ---------------------------------------------------------------------------
# Service Moderation
# ---------------------------------------------------------------------------

@router.get("/services", response_model=List[AdminServiceResponse], dependencies=[_admin_dep])
def list_admin_services(db: Session = Depends(get_db)):
    rows = (
        db.query(Service, User.full_name)
        .join(User, User.id == Service.provider_id)
        .order_by(Service.created_at.desc())
        .all()
    )
    return [
        AdminServiceResponse(
            id=service.id, provider_id=service.provider_id, provider_name=provider_name,
            category_id=service.category_id, title=service.title, description=service.description,
            price=float(service.price), city=service.city, duration=service.duration,
            status=service.status, created_at=service.created_at,
        )
        for service, provider_name in rows
    ]


@router.put("/services/{service_id}/status", response_model=AdminServiceResponse, dependencies=[_admin_dep])
def update_admin_service_status(service_id: int, body: ServiceStatusUpdate, db: Session = Depends(get_db)):
    allowed = {s.value for s in ServiceStatus}
    if body.status not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of: {', '.join(sorted(allowed))}",
        )
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    service.status = ServiceStatus(body.status)
    db.commit()
    db.refresh(service)
    provider_name = db.query(User.full_name).filter(User.id == service.provider_id).scalar()
    return AdminServiceResponse(
        id=service.id, provider_id=service.provider_id, provider_name=provider_name,
        category_id=service.category_id, title=service.title, description=service.description,
        price=float(service.price), city=service.city, duration=service.duration,
        status=service.status, created_at=service.created_at,
    )