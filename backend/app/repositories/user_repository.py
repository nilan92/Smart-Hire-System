from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.user import User


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: int) -> User | None:
        return self.db.scalar(
            select(User)
            .where(User.id == user_id)
            .options(selectinload(User.provider_profile))
        )

    def get_by_email(self, email: str) -> User | None:
        return self.db.scalar(
            select(User)
            .where(User.email == email.lower())
            .options(selectinload(User.provider_profile))
        )

    def create(self, user: User) -> User:
        self.db.add(user)
        self.db.flush()
        self.db.refresh(user)
        return user

    def save(self, user: User) -> User:
        self.db.add(user)
        self.db.flush()
        self.db.refresh(user)
        return user
