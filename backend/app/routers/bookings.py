from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_active_user, require_roles
from app.models.user import User, UserRole
from app.schemas.booking import BookingCreate, BookingResponse
from app.services.booking_service import BookingService


router = APIRouter(
    prefix="/api/bookings",
    tags=["Bookings"],
)

@router.post("", response_model=BookingResponse, status_code=201)
def create_booking(
    payload: BookingCreate,
    current_user: User = Depends(require_roles(UserRole.CUSTOMER)),
    db: Session = Depends(get_db),
):
    return BookingService(db).create_booking(current_user, payload)


@router.get("/customer", response_model=list[BookingResponse])
def list_my_bookings(
    current_user: User = Depends(require_roles(UserRole.CUSTOMER)),
    db: Session = Depends(get_db),
):
    return BookingService(db).list_for_customer(current_user.id)


@router.get("/provider", response_model=list[BookingResponse])
def list_provider_requests(
    current_user: User = Depends(require_roles(UserRole.PROVIDER)),
    db: Session = Depends(get_db),
):
    return BookingService(db).list_for_provider(current_user.id)


@router.get("/{booking_id}", response_model=BookingResponse)
def get_booking(
    booking_id: int,
    current_user: User = Depends(require_active_user),
    db: Session = Depends(get_db),
):
    return BookingService(db).get_booking_for_user(booking_id, current_user)


@router.put("/{booking_id}/accept", response_model=BookingResponse)
def accept_booking(
    booking_id: int,
    current_user: User = Depends(require_roles(UserRole.PROVIDER)),
    db: Session = Depends(get_db),
):
    return BookingService(db).accept_booking(booking_id, current_user)


@router.put("/{booking_id}/reject", response_model=BookingResponse)
def reject_booking(
    booking_id: int,
    current_user: User = Depends(require_roles(UserRole.PROVIDER)),
    db: Session = Depends(get_db),
):
    return BookingService(db).reject_booking(booking_id, current_user)


@router.put("/{booking_id}/cancel", response_model=BookingResponse)
def cancel_booking(
    booking_id: int,
    current_user: User = Depends(require_roles(UserRole.CUSTOMER)),
    db: Session = Depends(get_db),
):
    return BookingService(db).cancel_booking(booking_id, current_user)


@router.put("/{booking_id}/complete", response_model=BookingResponse)
def complete_booking(
    booking_id: int,
    current_user: User = Depends(require_roles(UserRole.PROVIDER)),
    db: Session = Depends(get_db),
):
    return BookingService(db).complete_booking(booking_id, current_user)
