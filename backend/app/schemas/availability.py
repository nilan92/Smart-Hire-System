from datetime import time

from pydantic import BaseModel, ConfigDict, Field, field_validator


class AvailabilitySlotCreate(BaseModel):
    day_of_week: int = Field(ge=0, le=6, description="0 = Sunday ... 6 = Saturday")
    start_time: time
    end_time: time

    @field_validator("end_time")
    @classmethod
    def end_time_after_start_time(cls, value: time, info) -> time:
        start_time = info.data.get("start_time")
        if start_time is not None and value <= start_time:
            raise ValueError("end_time must be after start_time")
        return value


class AvailabilitySlotResponse(BaseModel):
    id: int
    provider_id: int
    day_of_week: int
    start_time: time
    end_time: time

    model_config = ConfigDict(from_attributes=True)
