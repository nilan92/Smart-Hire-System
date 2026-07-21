from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.provider_availability import ProviderAvailability


class AvailabilityRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, slot: ProviderAvailability) -> ProviderAvailability:
        self.db.add(slot)
        self.db.flush()
        self.db.refresh(slot)
        return slot

    def get_by_id(self, slot_id: int) -> ProviderAvailability | None:
        return self.db.get(ProviderAvailability, slot_id)

    def list_by_provider(self, provider_id: int) -> list[ProviderAvailability]:
        return list(
            self.db.scalars(
                select(ProviderAvailability)
                .where(ProviderAvailability.provider_id == provider_id)
                .order_by(ProviderAvailability.day_of_week, ProviderAvailability.start_time)
            )
        )

    def delete(self, slot: ProviderAvailability) -> None:
        self.db.delete(slot)
        self.db.flush()
