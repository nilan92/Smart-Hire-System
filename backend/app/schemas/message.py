from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class MessageCreate(BaseModel):
    body: str = Field(min_length=1, max_length=2000)


class MessageResponse(BaseModel):
    id: int
    booking_id: int
    sender_id: int
    sender_name: str
    body: str
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MessageThreadResponse(BaseModel):
    booking_id: int
    service_name: str
    other_party_id: int
    other_party_name: str
    booking_status: str
    last_message: str | None
    last_message_at: datetime | None
    unread_count: int
