from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_active_user
from app.models.user import User
from app.schemas.message import MessageCreate, MessageResponse, MessageThreadResponse
from app.services.message_service import MessageService

router = APIRouter(prefix="/api/messages", tags=["Messages"])


@router.get("/threads", response_model=list[MessageThreadResponse])
def list_threads(current_user: User = Depends(require_active_user), db: Session = Depends(get_db)):
    return MessageService(db).list_threads(current_user)


@router.get("/bookings/{booking_id}", response_model=list[MessageResponse])
def get_messages(booking_id: int, current_user: User = Depends(require_active_user), db: Session = Depends(get_db)):
    return MessageService(db).get_messages(booking_id, current_user)


@router.post("/bookings/{booking_id}", response_model=MessageResponse, status_code=201)
def send_message(
    booking_id: int,
    payload: MessageCreate,
    current_user: User = Depends(require_active_user),
    db: Session = Depends(get_db),
):
    return MessageService(db).send_message(booking_id, current_user, payload.body)
