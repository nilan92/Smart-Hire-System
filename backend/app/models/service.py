from sqlalchemy import Column, Integer
from app.core.database import Base

class Service(Base):
    __tablename__ = "services"
    id = Column(Integer, primary_key=True, index=True)
