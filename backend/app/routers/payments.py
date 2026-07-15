from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.payment import Payment
from app.schemas.payment import PaymentCreate, PaymentResponse, PaymentUpdate

router = APIRouter(
    prefix="/api/payments",
    tags=["Payments"],
)

@router.post("/", response_model=PaymentResponse)
def create_payment(payment: PaymentCreate, db: Session = Depends(get_db)):
    db_payment = Payment(**payment.model_dump())
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment

@router.get("/{payment_id}", response_model=PaymentResponse)
def get_payment(payment_id: int, db: Session = Depends(get_db)):
    db_payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not db_payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return db_payment

@router.get("/booking/{booking_id}", response_model=List[PaymentResponse])
def get_payments_by_booking(booking_id: int, db: Session = Depends(get_db)):
    return db.query(Payment).filter(Payment.booking_id == booking_id).all()

@router.put("/{payment_id}", response_model=PaymentResponse)
def update_payment(payment_id: int, payment_update: PaymentUpdate, db: Session = Depends(get_db)):
    db_payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not db_payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    update_data = payment_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_payment, key, value)
        
    db.commit()
    db.refresh(db_payment)
    return db_payment
