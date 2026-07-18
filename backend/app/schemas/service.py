from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field
from app.models.service import ServiceStatus

class CategoryResponse(BaseModel):
    id: int
    name: str
    description: str | None = None
    icon: str
    model_config = ConfigDict(from_attributes=True)

class ServiceCreate(BaseModel):
    category_id: int
    title: str = Field(min_length=4, max_length=160)
    description: str = Field(min_length=10)
    price: Decimal = Field(ge=0)
    city: str = Field(min_length=2, max_length=100)
    duration: str = Field(default="1–2 hours", max_length=60)
    status: ServiceStatus = ServiceStatus.ACTIVE

class ServiceUpdate(BaseModel):
    category_id: int | None = None
    title: str | None = Field(default=None, min_length=4, max_length=160)
    description: str | None = Field(default=None, min_length=10)
    price: Decimal | None = Field(default=None, ge=0)
    city: str | None = Field(default=None, min_length=2, max_length=100)
    duration: str | None = Field(default=None, max_length=60)
    status: ServiceStatus | None = None

class ServiceResponse(BaseModel):
    id: int
    provider_id: int
    provider_name: str
    category_id: int
    title: str
    description: str
    price: Decimal
    city: str
    duration: str
    status: ServiceStatus
    rating: float = 0
    review_count: int = 0
    image_urls: list[str] = Field(default_factory=list)
    created_at: datetime

class AreaCreate(BaseModel):
    district: str = Field(min_length=2, max_length=100)
    city: str = Field(min_length=2, max_length=100)
    radius_km: int = Field(default=10, ge=1, le=50)
    service_id: int | None = None

class AreaResponse(AreaCreate):
    id: int
    provider_id: int
    model_config = ConfigDict(from_attributes=True)
