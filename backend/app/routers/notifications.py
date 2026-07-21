from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_active_user
from app.schemas.notification import NotificationResponse
from app.models.user import User
from app.services.notification_service import NotificationService

router = APIRouter(
    prefix="/api/notifications",
    tags=["Notifications"],
)

@router.get("", response_model=list[NotificationResponse])
def list_my_notifications(
    current_user: User = Depends(require_active_user),
    db: Session = Depends(get_db),
):
    return NotificationService(db).list_for_user(current_user.id)


@router.put("/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_read(
    notification_id: int,
    current_user: User = Depends(require_active_user),
    db: Session = Depends(get_db),
):
    return NotificationService(db).mark_read(notification_id, current_user.id)
