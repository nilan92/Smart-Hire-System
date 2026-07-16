from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.provider_profile import ProviderProfile


class ProviderRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_user_id(self, user_id: int) -> ProviderProfile | None:
        return self.db.scalar(
            select(ProviderProfile)
            .where(ProviderProfile.user_id == user_id)
            .options(selectinload(ProviderProfile.user))
        )

    def get_public_by_user_id(self, user_id: int) -> ProviderProfile | None:
        return self.get_by_user_id(user_id)

    def create(self, profile: ProviderProfile) -> ProviderProfile:
        self.db.add(profile)
        self.db.flush()
        self.db.refresh(profile)
        return profile

    def update(self, profile: ProviderProfile) -> ProviderProfile:
        self.db.add(profile)
        self.db.flush()
        self.db.refresh(profile)
        return profile

    def save(self, profile: ProviderProfile) -> ProviderProfile:
        return self.update(profile)
