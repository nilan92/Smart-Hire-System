from typing import Literal

from pydantic import BaseModel, EmailStr, Field, model_validator

from app.models.user import UserRole
from app.schemas.provider_profile import ProviderProfileCreate
from app.schemas.user import UserResponse


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    confirm_password: str = Field(min_length=8)
    full_name: str = Field(min_length=2, max_length=150)
    phone: str | None = Field(default=None, max_length=20)
    role: Literal[UserRole.CUSTOMER, UserRole.PROVIDER] = UserRole.CUSTOMER
    provider_profile: ProviderProfileCreate | None = None

    @model_validator(mode="after")
    def validate_registration(self) -> "RegisterRequest":
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")
        if self.role == UserRole.PROVIDER and self.provider_profile is None:
            self.provider_profile = ProviderProfileCreate()
        if self.role == UserRole.CUSTOMER:
            self.provider_profile = None
        return self


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
