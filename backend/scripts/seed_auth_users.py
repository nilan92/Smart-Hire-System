import os
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.provider_profile import ProviderProfile
from app.models.user import AccountStatus, User, UserRole
from app.repositories.user_repository import UserRepository


def env(name: str, default: str) -> str:
    return os.getenv(name, default)


def ensure_user(email: str, password: str, full_name: str, role: UserRole) -> User:
    db = SessionLocal()
    try:
        users = UserRepository(db)
        existing = users.get_by_email(email)
        if existing:
            return existing

        user = User(
            email=email.lower(),
            password_hash=hash_password(password),
            full_name=full_name,
            phone=None,
            role=role,
            status=AccountStatus.ACTIVE,
        )
        users.create(user)
        if role == UserRole.PROVIDER:
            db.add(ProviderProfile(user_id=user.id, bio="Development provider account.", years_experience=3))
        db.commit()
        return user
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def main() -> None:
    ensure_user(env("SEED_CUSTOMER_EMAIL", "dev.customer@example.com"), env("SEED_CUSTOMER_PASSWORD", "Password123"), "Development Customer", UserRole.CUSTOMER)
    ensure_user(env("SEED_PROVIDER_EMAIL", "dev.provider@example.com"), env("SEED_PROVIDER_PASSWORD", "Password123"), "Development Provider", UserRole.PROVIDER)
    ensure_user(env("SEED_ADMIN_EMAIL", "dev.admin@example.com"), env("SEED_ADMIN_PASSWORD", "Password123"), "Development Admin", UserRole.ADMIN)
    print("Development auth users are ready.")


if __name__ == "__main__":
    main()
