from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.user import User, UserRole
from app.schemas.availability import AvailabilitySlotCreate, AvailabilitySlotResponse
from app.services.availability_service import AvailabilityService


router = APIRouter(
    prefix="/api/providers/availability",
    tags=["Provider Availability"],
)


@router.post("", response_model=AvailabilitySlotResponse, status_code=201)
def add_availability_slot(
    payload: AvailabilitySlotCreate,
    current_user: User = Depends(require_roles(UserRole.PROVIDER)),
    db: Session = Depends(get_db),
):
    return AvailabilityService(db).add_slot(current_user.id, payload)


@router.get("/me", response_model=list[AvailabilitySlotResponse])
def list_my_availability(
    current_user: User = Depends(require_roles(UserRole.PROVIDER)),
    db: Session = Depends(get_db),
):
    return AvailabilityService(db).list_for_provider(current_user.id)


@router.get("/provider/{provider_id}", response_model=list[AvailabilitySlotResponse])
def list_provider_availability(provider_id: int, db: Session = Depends(get_db)):
    return AvailabilityService(db).list_for_provider(provider_id)


@router.delete("/{slot_id}", status_code=204)
def remove_availability_slot(
    slot_id: int,
    current_user: User = Depends(require_roles(UserRole.PROVIDER)),
    db: Session = Depends(get_db),
):
    AvailabilityService(db).remove_slot(slot_id, current_user.id)
