from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_roles
from app.models.booking import Booking
from app.models.payment import Payment
from app.models.user import User, UserRole
from app.schemas.payment import PaymentCreate, PaymentResponse, PaymentUpdate

router = APIRouter(
    prefix="/api/payments",
    tags=["Payments"],
)


def _assert_can_view_payment(payment: Payment, booking: Booking | None, current_user: User) -> None:
    if current_user.role == UserRole.ADMIN:
        return
    if current_user.id == payment.customer_id:
        return
    if booking is not None and current_user.id == booking.provider_id:
        return
    raise HTTPException(status_code=403, detail="Not authorized to view this payment")


@router.post("/", response_model=PaymentResponse)
def create_payment(
    payment: PaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.CUSTOMER:
        raise HTTPException(status_code=403, detail="Only customers can make payments")

    booking = db.query(Booking).filter(Booking.id == payment.booking_id).first()
    if booking is None:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only pay for your own bookings")

    db_payment = Payment(
        booking_id=booking.id,
        customer_id=current_user.id,
        amount=payment.amount,
        payment_method=payment.payment_method,
    )
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment


@router.get(
    "/",
    response_model=List[PaymentResponse],
    dependencies=[Depends(require_roles(UserRole.ADMIN))],
)
def list_payments(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    """List all payments. Admin only."""
    return db.query(Payment).offset(skip).limit(limit).all()


@router.get("/booking/{booking_id}", response_model=List[PaymentResponse])
def get_payments_by_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if booking is None:
        raise HTTPException(status_code=404, detail="Booking not found")
    if current_user.role != UserRole.ADMIN and current_user.id not in (booking.customer_id, booking.provider_id):
        raise HTTPException(status_code=403, detail="Not authorized to view these payments")
    return db.query(Payment).filter(Payment.booking_id == booking_id).all()


@router.get("/provider/me", response_model=List[PaymentResponse])
def get_my_provider_payments(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.PROVIDER)),
):
    """Payments received for the current provider's bookings."""
    return (
        db.query(Payment)
        .join(Booking, Payment.booking_id == Booking.id)
        .filter(Booking.provider_id == current_user.id)
        .order_by(Payment.created_at.desc())
        .all()
    )


@router.get("/{payment_id}", response_model=PaymentResponse)
def get_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not db_payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    booking = db.query(Booking).filter(Booking.id == db_payment.booking_id).first()
    _assert_can_view_payment(db_payment, booking, current_user)
    return db_payment


@router.put(
    "/{payment_id}",
    response_model=PaymentResponse,
    dependencies=[Depends(require_roles(UserRole.ADMIN))],
)
def update_payment(payment_id: int, payment_update: PaymentUpdate, db: Session = Depends(get_db)):
    """Update payment status/transaction id. Admin only."""
    db_payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not db_payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    update_data = payment_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_payment, key, value)
    db.commit()
    db.refresh(db_payment)
    return db_payment
