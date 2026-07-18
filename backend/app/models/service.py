import enum
from datetime import datetime, timezone
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.favorite import Favorite
    from app.models.service_area import ServiceArea
    from app.models.service_category import ServiceCategory
    from app.models.service_image import ServiceImage
    from app.models.user import User


class ServiceStatus(str, enum.Enum):
    ACTIVE = "active"
    PAUSED = "paused"
    DRAFT = "draft"


class Service(Base):
    __tablename__ = "services"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    provider_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    category_id: Mapped[int] = mapped_column(ForeignKey("service_categories.id"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(160), nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    duration: Mapped[str] = mapped_column(String(60), nullable=False, default="1–2 hours")
    status: Mapped[ServiceStatus] = mapped_column(Enum(ServiceStatus, name="service_status", values_callable=lambda e: [i.value for i in e]), nullable=False, default=ServiceStatus.DRAFT)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    provider: Mapped["User"] = relationship("User", back_populates="services")
    category: Mapped["ServiceCategory"] = relationship("ServiceCategory", back_populates="services")
    images: Mapped[list["ServiceImage"]] = relationship("ServiceImage", back_populates="service", cascade="all, delete-orphan")
    favorites: Mapped[list["Favorite"]] = relationship("Favorite", back_populates="service", cascade="all, delete-orphan")
    areas: Mapped[list["ServiceArea"]] = relationship("ServiceArea", back_populates="service")
