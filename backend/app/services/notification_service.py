from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.notification import Notification
from app.repositories.notification_repository import NotificationRepository

class NotificationService:
    def __init__(self, db: Session):
        self.db = db
        self.notifications = NotificationRepository(db)

    def create(
        self,
        user_id: int,
        title: str,
        message: str,
        booking_id: int | None = None,
    ) -> Notification:
        notification = Notification(
            user_id=user_id,
            title=title,
            message=message,
            booking_id=booking_id,
        )
        return self.notifications.create(notification)

    def list_for_user(self, user_id: int) -> list[Notification]:
        return self.notifications.list_by_user(user_id)

    def mark_read(self, notification_id: int, user_id: int) -> Notification:
        notification = self.notifications.get_by_id(notification_id)
        if notification is None or notification.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found",
            )
        notification.is_read = True
        self.notifications.save(notification)
        self.db.commit()
        self.db.refresh(notification)
        return notification
