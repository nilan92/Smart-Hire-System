from sqlalchemy import select
from sqlalchemy.orm import selectinload, Session

from app.models.booking import Booking

_EAGER_LOAD = (
    selectinload(Booking.customer),
    selectinload(Booking.provider),
    selectinload(Booking.service),
)

class BookingRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, booking: Booking) -> Booking:
        self.db.add(booking)
        self.db.flush()
        self.db.refresh(booking)
        return booking

    def save(self, booking: Booking) -> Booking:
        self.db.add(booking)
        self.db.flush()
        self.db.refresh(booking)
        return booking

    def get_by_id(self, booking_id: int) -> Booking | None:
        return self.db.scalar(
            select(Booking).where(Booking.id == booking_id).options(*_EAGER_LOAD)
        )

    def list_by_customer(self, customer_id: int) -> list[Booking]:
        return list(
            self.db.scalars(
                select(Booking)
                .where(Booking.customer_id == customer_id)
                .options(*_EAGER_LOAD)
                .order_by(Booking.created_at.desc())
            )
        )

    def list_by_provider(self, provider_id: int) -> list[Booking]:
        return list(
            self.db.scalars(
                select(Booking)
                .where(Booking.provider_id == provider_id)
                .options(*_EAGER_LOAD)
                .order_by(Booking.created_at.desc())
            )
        )
