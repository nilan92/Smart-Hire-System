from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.provider_availability import ProviderAvailability
from app.repositories.availability_repository import AvailabilityRepository
from app.schemas.availability import AvailabilitySlotCreate


class AvailabilityService:
    def __init__(self, db: Session):
        self.db = db
        self.slots = AvailabilityRepository(db)

    def add_slot(self, provider_id: int, payload: AvailabilitySlotCreate) -> ProviderAvailability:
        slot = ProviderAvailability(
            provider_id=provider_id,
            day_of_week=payload.day_of_week,
            start_time=payload.start_time,
            end_time=payload.end_time,
        )
        slot = self.slots.create(slot)
        self.db.commit()
        self.db.refresh(slot)
        return slot

    def list_for_provider(self, provider_id: int) -> list[ProviderAvailability]:
        return self.slots.list_by_provider(provider_id)

    def remove_slot(self, slot_id: int, provider_id: int) -> None:
        slot = self.slots.get_by_id(slot_id)
        if slot is None or slot.provider_id != provider_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Availability slot not found",
            )
        self.slots.delete(slot)
        self.db.commit()
