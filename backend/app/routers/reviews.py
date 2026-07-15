from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.review import Review
from app.schemas.review import ReviewCreate, ReviewResponse

router = APIRouter(
    prefix="/api/reviews",
    tags=["Reviews"],
)

@router.post("/", response_model=ReviewResponse)
def create_review(review: ReviewCreate, db: Session = Depends(get_db)):
    existing = db.query(Review).filter(Review.booking_id == review.booking_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Review already exists for this booking")

    db_review = Review(**review.model_dump())
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review

@router.get("/provider/{provider_id}", response_model=List[ReviewResponse])
def get_provider_reviews(provider_id: int, db: Session = Depends(get_db)):
    return db.query(Review).filter(Review.provider_id == provider_id).all()

@router.get("/service/{service_id}", response_model=List[ReviewResponse])
def get_service_reviews(service_id: int, db: Session = Depends(get_db)):
    return db.query(Review).filter(Review.service_id == service_id).all()