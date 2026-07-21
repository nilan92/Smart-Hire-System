from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import Base, engine
from app.routers.health import router as health_router
from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.services import router as services_router
from app.routers.bookings import router as bookings_router
from app.routers.reviews import router as reviews_router
from app.routers.payments import router as payments_router
from app.routers.notifications import router as notifications_router
from app.routers.admin import router as admin_router
from app.routers.ai import router as ai_base_router
from app.routers.availability import router as availability_router
from app.ai.router import router as ai_feature_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.app_name, version="1.0.0", description="Backend API for the Smart Hire service marketplace")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "http://127.0.0.1:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(services_router)
app.include_router(bookings_router)
app.include_router(reviews_router)
app.include_router(payments_router)
app.include_router(notifications_router)
app.include_router(admin_router)
app.include_router(ai_base_router)
app.include_router(availability_router)
app.include_router(ai_feature_router, prefix="/api/ai", tags=["AI"])


@app.get("/")
def root():
    return {"message": "Welcome to Smart Hire API"}
