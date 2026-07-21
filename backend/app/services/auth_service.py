from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.models.provider_profile import ProviderProfile
from app.models.user import AccountStatus, User, UserRole
from app.repositories.provider_repository import ProviderRepository
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginRequest, RegisterRequest


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.users = UserRepository(db)
        self.providers = ProviderRepository(db)

    def register(self, payload: RegisterRequest) -> User:
        if self.users.get_by_email(payload.email):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email is already registered",
            )

        user = User(
            email=payload.email.lower(),
            password_hash=hash_password(payload.password),
            full_name=payload.full_name.strip(),
            phone=payload.phone,
            role=payload.role,
            status=AccountStatus.ACTIVE,
        )

        try:
            self.users.create(user)
            if payload.role == UserRole.PROVIDER:
                profile_payload = payload.provider_profile
                profile = ProviderProfile(
                    user_id=user.id,
                    bio=profile_payload.bio if profile_payload else None,
                    years_experience=profile_payload.years_experience if profile_payload else 0,
                )
                self.providers.create(profile)
            self.db.commit()
            return self.users.get_by_id(user.id) or user
        except IntegrityError:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email is already registered",
            ) from None
        except Exception:
            self.db.rollback()
            raise

    def login(self, payload: LoginRequest) -> tuple[str, User]:
        user = self.users.get_by_email(payload.email)
        if user is None or not verify_password(payload.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )
        if user.status == AccountStatus.SUSPENDED:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account suspended",
            )
        if user.status == AccountStatus.DEACTIVATED:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account deactivated",
            )
        token = create_access_token(subject=user.id, role=user.role.value)
        return token, user
