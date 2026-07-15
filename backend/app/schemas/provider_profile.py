from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.provider_profile import VerificationStatus


class ProviderProfileBase(BaseModel):
    bio: str | None = Field(default=None, max_length=2000)
    years_experience: int = Field(default=0, ge=0)


class ProviderProfileCreate(ProviderProfileBase):
    pass


class ProviderProfileUpdate(BaseModel):
    bio: str | None = Field(default=None, max_length=2000)
    years_experience: int | None = Field(default=None, ge=0)


class ProviderProfileResponse(ProviderProfileBase):
    user_id: int
    verification_status: VerificationStatus
    avg_rating: Decimal
    total_reviews: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
