from fastapi import APIRouter

router = APIRouter(
    prefix="/api/services",
    tags=["Services"],
)