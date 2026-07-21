from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.booking import Booking
from app.models.message import Message
from app.models.user import User, UserRole
from app.repositories.message_repository import MessageRepository
from app.schemas.message import MessageThreadResponse
from app.services.booking_service import BookingService
from app.services.notification_service import NotificationService


class MessageService:
    def __init__(self, db: Session):
        self.db = db
        self.messages = MessageRepository(db)
        self.bookings = BookingService(db)
        self.notifications = NotificationService(db)

    def list_threads(self, user: User) -> list[MessageThreadResponse]:
        bookings = (
            self.bookings.list_for_customer(user.id)
            if user.role == UserRole.CUSTOMER
            else self.bookings.list_for_provider(user.id)
        )

        rows: list[tuple] = []
        for booking in bookings:
            is_customer = user.role == UserRole.CUSTOMER
            other_id = booking.provider_id if is_customer else booking.customer_id
            other_name = booking.provider_name if is_customer else booking.customer_name
            last = self.messages.last_message(booking.id)
            sort_key = last.created_at if last else booking.created_at
            rows.append((
                sort_key,
                MessageThreadResponse(
                    booking_id=booking.id,
                    service_name=booking.service_name,
                    other_party_id=other_id,
                    other_party_name=other_name,
                    booking_status=booking.status.value,
                    last_message=last.body if last else None,
                    last_message_at=last.created_at if last else None,
                    unread_count=self.messages.unread_count(booking.id, user.id),
                ),
            ))

        rows.sort(key=lambda row: row[0], reverse=True)
        return [thread for _, thread in rows]

    def get_messages(self, booking_id: int, user: User) -> list[Message]:
        booking = self.bookings.get_booking_for_user(booking_id, user)
        messages = self.messages.list_by_booking(booking.id)
        self.messages.mark_all_read(booking.id, user.id)
        self.db.commit()
        return messages

    def send_message(self, booking_id: int, user: User, body: str) -> Message:
        booking = self._require_participant(booking_id, user)

        message = self.messages.create(Message(booking_id=booking.id, sender_id=user.id, body=body))

        recipient_id = booking.provider_id if user.id == booking.customer_id else booking.customer_id
        preview = body if len(body) <= 80 else f"{body[:77]}..."
        self.notifications.create(
            user_id=recipient_id,
            title="New message",
            message=f"{user.full_name}: {preview}",
            booking_id=booking.id,
        )

        self.db.commit()
        self.db.refresh(message)
        return message

    def _require_participant(self, booking_id: int, user: User) -> Booking:
        booking = self.bookings.get_booking_for_user(booking_id, user)
        if user.id not in (booking.customer_id, booking.provider_id):
            # get_booking_for_user also allows admins to view; admins can't send messages.
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the customer or provider on this booking can send messages")
        return booking
