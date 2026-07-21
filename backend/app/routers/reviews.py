from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.booking import Booking, BookingStatus
from app.models.provider_profile import ProviderProfile
from app.models.review import Review
from app.models.user import User, UserRole
from app.schemas.review import ReviewCreate, ReviewResponse

router = APIRouter(
    prefix="/api/reviews",
    tags=["Reviews"],
)


def _recalculate_provider_rating(db: Session, provider_id: int) -> None:
    avg_rating, total = (
        db.query(func.avg(Review.rating), func.count(Review.id))
        .filter(Review.provider_id == provider_id)
        .one()
    )
    profile = db.query(ProviderProfile).filter(ProviderProfile.user_id == provider_id).first()
    if profile is None:
        return
    profile.avg_rating = round(float(avg_rating or 0), 2)
    profile.total_reviews = total or 0
    db.commit()


@router.post("/", response_model=ReviewResponse)
def create_review(
    review: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.CUSTOMER:
        raise HTTPException(status_code=403, detail="Only customers can leave reviews")

    booking = db.query(Booking).filter(Booking.id == review.booking_id).first()
    if booking is None:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only review your own bookings")
    if booking.status != BookingStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="You can only review completed bookings")

    existing = db.query(Review).filter(Review.booking_id == review.booking_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Review already exists for this booking")

    db_review = Review(
        booking_id=booking.id,
        customer_id=current_user.id,
        provider_id=booking.provider_id,
        service_id=booking.service_id,
        rating=review.rating,
        comment=review.comment,
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)

    _recalculate_provider_rating(db, db_review.provider_id)
    return db_review


@router.get("/", response_model=List[ReviewResponse])
def list_reviews(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    """List all reviews. Public endpoint."""
    return db.query(Review).offset(skip).limit(limit).all()


@router.get("/provider/{provider_id}", response_model=List[ReviewResponse])
def get_provider_reviews(provider_id: int, db: Session = Depends(get_db)):
    return db.query(Review).filter(Review.provider_id == provider_id).all()


@router.get("/service/{service_id}", response_model=List[ReviewResponse])
def get_service_reviews(service_id: int, db: Session = Depends(get_db)):
    return db.query(Review).filter(Review.service_id == service_id).all()


@router.get("/customer/me", response_model=List[ReviewResponse])
def get_my_reviews(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Reviews the current customer has written."""
    return db.query(Review).filter(Review.customer_id == current_user.id).all()


@router.get("/{review_id}", response_model=ReviewResponse)
def get_review(review_id: int, db: Session = Depends(get_db)):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    return review