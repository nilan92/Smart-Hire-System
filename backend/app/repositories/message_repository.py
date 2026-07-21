from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models.message import Message

_EAGER_LOAD = (selectinload(Message.sender),)


class MessageRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, message: Message) -> Message:
        self.db.add(message)
        self.db.flush()
        self.db.refresh(message)
        return message

    def list_by_booking(self, booking_id: int) -> list[Message]:
        return list(
            self.db.scalars(
                select(Message)
                .where(Message.booking_id == booking_id)
                .options(*_EAGER_LOAD)
                .order_by(Message.created_at.asc())
            )
        )

    def last_message(self, booking_id: int) -> Message | None:
        return self.db.scalar(
            select(Message)
            .where(Message.booking_id == booking_id)
            .order_by(Message.created_at.desc())
            .limit(1)
        )

    def unread_count(self, booking_id: int, reader_id: int) -> int:
        return self.db.scalar(
            select(func.count(Message.id)).where(
                Message.booking_id == booking_id,
                Message.sender_id != reader_id,
                Message.is_read.is_(False),
            )
        ) or 0

    def mark_all_read(self, booking_id: int, reader_id: int) -> None:
        self.db.query(Message).filter(
            Message.booking_id == booking_id,
            Message.sender_id != reader_id,
            Message.is_read.is_(False),
        ).update({"is_read": True})
