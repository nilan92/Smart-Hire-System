from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserProfileUpdate


class UserService:
    def __init__(self, db: Session):
        self.users = UserRepository(db)
        self.db = db

    def update_profile(self, user: User, payload: UserProfileUpdate) -> User:
        if payload.full_name is not None:
            user.full_name = payload.full_name.strip()
        if payload.phone is not None:
            user.phone = payload.phone
        self.users.save(user)
        self.db.commit()
        return self.users.get_by_id(user.id) or user
