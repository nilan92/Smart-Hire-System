from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.booking import Booking, BookingStatus
from app.models.service import Service, ServiceStatus
from app.models.user import User
from app.repositories.booking_repository import BookingRepository
from app.schemas.booking import BookingCreate
from app.services.notification_service import NotificationService

class BookingService:
    def __init__(self, db: Session):
        self.db = db
        self.bookings = BookingRepository(db)
        self.notifications = NotificationService(db)

    def create_booking(self, customer: User, payload: BookingCreate) -> Booking:
        service = self.db.get(Service, payload.service_id)
        if service is None or service.status != ServiceStatus.ACTIVE:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Service not found",
            )
        if service.provider_id == customer.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot book your own service",
            )

        booking = Booking(
            customer_id=customer.id,
            provider_id=service.provider_id,
            service_id=service.id,
            booking_date=payload.booking_date,
            status=BookingStatus.PENDING,
            notes=payload.notes,
        )
        booking = self.bookings.create(booking)

        self.notifications.create(
            user_id=service.provider_id,
            title="New booking request",
            message=f'{customer.full_name} requested "{service.name}".',
            booking_id=booking.id,
        )

        self.db.commit()
        return self.bookings.get_by_id(booking.id)

    def list_for_customer(self, customer_id: int) -> list[Booking]:
        return self.bookings.list_by_customer(customer_id)

    def list_for_provider(self, provider_id: int) -> list[Booking]:
        return self.bookings.list_by_provider(provider_id)

    def get_booking_for_user(self, booking_id: int, user: User) -> Booking:
        booking = self._get_or_404(booking_id)
        if user.role.value != "admin" and user.id not in (booking.customer_id, booking.provider_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this booking",
            )
        return booking

    def accept_booking(self, booking_id: int, provider: User) -> Booking:
        booking = self._get_owned_by_provider(booking_id, provider)
        self._require_status(booking, BookingStatus.PENDING, "accepted")
        booking.status = BookingStatus.ACCEPTED
        self.bookings.save(booking)

        self.notifications.create(
            user_id=booking.customer_id,
            title="Booking accepted",
            message=f'{provider.full_name} accepted your booking for "{booking.service_name}".',
            booking_id=booking.id,
        )

        self.db.commit()
        return self.bookings.get_by_id(booking.id)

    def reject_booking(self, booking_id: int, provider: User) -> Booking:
        booking = self._get_owned_by_provider(booking_id, provider)
        self._require_status(booking, BookingStatus.PENDING, "rejected")
        booking.status = BookingStatus.REJECTED
        self.bookings.save(booking)

        self.notifications.create(
            user_id=booking.customer_id,
            title="Booking rejected",
            message=f'{provider.full_name} could not accept your booking for "{booking.service_name}".',
            booking_id=booking.id,
        )

        self.db.commit()
        return self.bookings.get_by_id(booking.id)

    def cancel_booking(self, booking_id: int, customer: User) -> Booking:
        booking = self._get_owned_by_customer(booking_id, customer)
        if booking.status not in (BookingStatus.PENDING, BookingStatus.ACCEPTED):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only pending or accepted bookings can be cancelled",
            )
        booking.status = BookingStatus.CANCELLED
        self.bookings.save(booking)

        self.notifications.create(
            user_id=booking.provider_id,
            title="Booking cancelled",
            message=f'{customer.full_name} cancelled the booking for "{booking.service_name}".',
            booking_id=booking.id,
        )

        self.db.commit()
        return self.bookings.get_by_id(booking.id)

    def complete_booking(self, booking_id: int, provider: User) -> Booking:
        booking = self._get_owned_by_provider(booking_id, provider)
        self._require_status(booking, BookingStatus.ACCEPTED, "completed")
        booking.status = BookingStatus.COMPLETED
        self.bookings.save(booking)

        self.notifications.create(
            user_id=booking.customer_id,
            title="Booking completed",
            message=f'Your booking for "{booking.service_name}" is marked complete. Leave a review!',
            booking_id=booking.id,
        )

        self.db.commit()
        return self.bookings.get_by_id(booking.id)

    def _get_or_404(self, booking_id: int) -> Booking:
        booking = self.bookings.get_by_id(booking_id)
        if booking is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found",
            )
        return booking

    def _get_owned_by_provider(self, booking_id: int, provider: User) -> Booking:
        booking = self._get_or_404(booking_id)
        if booking.provider_id != provider.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to act on this booking",
            )
        return booking

    def _get_owned_by_customer(self, booking_id: int, customer: User) -> Booking:
        booking = self._get_or_404(booking_id)
        if booking.customer_id != customer.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to act on this booking",
            )
        return booking

    @staticmethod
    def _require_status(booking: Booking, required: BookingStatus, action: str) -> None:
        if booking.status != required:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Only {required.value} bookings can be {action}",
            )
