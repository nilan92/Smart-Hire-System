from datetime import datetime

from pydantic import BaseModel, Field, field_validator, ConfigDict

from app.models.booking import BookingStatus


class BookingCreate(BaseModel):
    service_id: int
    booking_date: datetime
    notes: str | None = Field(default=None, max_length=1000)

    @field_validator("booking_date")
    @classmethod
    def booking_date_must_be_in_the_future(cls, value: datetime) -> datetime:
        now = datetime.now(value.tzinfo) if value.tzinfo else datetime.utcnow()
        if value <= now:
            raise ValueError("booking_date must be in the future")
        return value

    @field_validator("notes")
    @classmethod
    def blank_notes_to_none(cls, value: str | None) -> str | None:
        if value is not None and not value.strip():
            return None
        return value


class BookingResponse(BaseModel):
    id: int
    customer_id: int
    customer_name: str
    provider_id: int
    provider_name: str
    service_id: int
    service_name: str
    booking_date: datetime
    status: BookingStatus
    notes: str | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
