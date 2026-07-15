from app.core.database import engine, Base
from app.models import User, Booking, Service, Payment, Review

print("Creating database tables...")
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)
print("Tables created successfully.")
