from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.user import AccountStatus, UserRole
from app.schemas.provider_profile import ProviderProfileResponse


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    phone: str | None
    role: UserRole
    status: AccountStatus
    email_verified: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CurrentUserResponse(UserResponse):
    provider_profile: ProviderProfileResponse | None = None


class UserUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=150)
    phone: str | None = Field(default=None, max_length=20)


UserProfileUpdate = UserUpdate


class PublicProviderResponse(BaseModel):
    id: int
    full_name: str
    role: UserRole
    provider_profile: ProviderProfileResponse

    model_config = ConfigDict(from_attributes=True)
