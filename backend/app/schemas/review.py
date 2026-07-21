from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime

class ReviewBase(BaseModel):
    booking_id: int
    customer_id: int
    provider_id: int
    service_id: int
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = None

class ReviewCreate(ReviewBase):
    pass

class ReviewResponse(ReviewBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
