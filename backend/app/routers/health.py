from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.database import get_db

router = APIRouter(
    prefix="/api/health",
    tags=["Health"],
)


@router.get("")
def health_check():
    return {
        "status": "success",
        "message": "Smart Hire API is running",
    }


@router.get("/database")
def database_health_check(
    db: Session = Depends(get_db),
):
    try:
        result = db.execute(text("SELECT 1"))
        value = result.scalar_one()

        return {
            "status": "success",
            "message": "Connected to Supabase PostgreSQL",
            "result": value,
        }

    except Exception as error:
        print("\nDATABASE CONNECTION ERROR")
        print(type(error).__name__)
        print()

        raise HTTPException(
            status_code=500,
            detail="Database health check failed",
        )
