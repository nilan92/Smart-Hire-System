from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_active_user, require_roles
from app.models.user import User, UserRole
from app.schemas.provider_profile import ProviderProfileResponse, ProviderProfileUpdate
from app.schemas.user import CurrentUserResponse, PublicProviderResponse, UserProfileUpdate
from app.services.provider_service import ProviderService
from app.services.user_service import UserService

router = APIRouter(
    prefix="/api/users",
    tags=["Users"],
)


@router.get("/me", response_model=CurrentUserResponse)
def get_my_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=CurrentUserResponse)
def update_my_profile(
    payload: UserProfileUpdate,
    current_user: User = Depends(require_active_user),
    db: Session = Depends(get_db),
):
    return UserService(db).update_profile(current_user, payload)


@router.get("/provider-profile", response_model=ProviderProfileResponse)
def get_provider_profile(
    current_user: User = Depends(require_roles(UserRole.PROVIDER)),
    db: Session = Depends(get_db),
):
    return ProviderService(db).get_current_profile(current_user)


@router.put("/provider-profile", response_model=ProviderProfileResponse)
def update_provider_profile(
    payload: ProviderProfileUpdate,
    current_user: User = Depends(require_roles(UserRole.PROVIDER)),
    db: Session = Depends(get_db),
):
    return ProviderService(db).update_current_profile(current_user, payload)


@router.get("/providers/{provider_id}", response_model=PublicProviderResponse)
def get_public_provider(provider_id: int, db: Session = Depends(get_db)):
    return ProviderService(db).get_public_provider(provider_id)
