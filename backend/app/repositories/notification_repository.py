from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.notification import Notification


class NotificationRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, notification: Notification) -> Notification:
        self.db.add(notification)
        self.db.flush()
        self.db.refresh(notification)
        return notification

    def save(self, notification: Notification) -> Notification:
        self.db.add(notification)
        self.db.flush()
        self.db.refresh(notification)
        return notification

    def get_by_id(self, notification_id: int) -> Notification | None:
        return self.db.get(Notification, notification_id)

    def list_by_user(self, user_id: int) -> list[Notification]:
        return list(
            self.db.scalars(
                select(Notification)
                .where(Notification.user_id == user_id)
                .order_by(Notification.created_at.desc())
            )
        )
