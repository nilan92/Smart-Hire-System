from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.provider_profile import ProviderProfile
from app.models.user import User, UserRole
from app.repositories.provider_repository import ProviderRepository
from app.repositories.user_repository import UserRepository
from app.schemas.provider_profile import ProviderProfileUpdate


class ProviderService:
    def __init__(self, db: Session):
        self.db = db
        self.providers = ProviderRepository(db)
        self.users = UserRepository(db)

    def get_current_profile(self, user: User) -> ProviderProfile:
        profile = self.providers.get_by_user_id(user.id)
        if profile is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Provider profile not found",
            )
        return profile

    def update_current_profile(self, user: User, payload: ProviderProfileUpdate) -> ProviderProfile:
        profile = self.get_current_profile(user)
        if payload.bio is not None:
            profile.bio = payload.bio
        if payload.years_experience is not None:
            profile.years_experience = payload.years_experience
        self.providers.save(profile)
        self.db.commit()
        return self.get_current_profile(user)

    def get_public_provider(self, provider_id: int) -> User:
        user = self.users.get_by_id(provider_id)
        if user is None or user.role != UserRole.PROVIDER or user.provider_profile is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Provider not found",
            )
        return user
