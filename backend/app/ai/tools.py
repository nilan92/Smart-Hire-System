"""
Shared tool implementations for the AI assistant's booking/availability
actions. Used by two callers:

1. app/ai/service.py -- OpenAI function-calling from the in-app chat
   widget, authenticated via the customer's JWT (current_user is known).
2. mcp_server/server.py -- the standalone MCP server, which has no JWT
   session, so callers identify the customer by email instead.

Kept here, not duplicated in either caller, so "what counts as an open
slot" and "what makes a booking valid" only has one implementation.
"""

from datetime import date as date_cls, datetime, timezone

from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.orm import Session

from fastapi import HTTPException

from app.models.booking import Booking, BookingStatus
from app.models.provider_availability import ProviderAvailability
from app.models.service import Service, ServiceStatus
from app.models.user import User, UserRole
from app.schemas.booking import BookingCreate
from app.services.booking_service import BookingService

TOOL_DEFINITIONS = [
    {
        "type": "function",
        "function": {
            "name": "check_provider_availability",
            "description": (
                "Check a provider's open time windows on a given date, based on their weekly "
                "schedule and any bookings they already have that day. Always call this before "
                "create_booking if the customer hasn't already stated a specific free time."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "provider_id": {
                        "type": "integer",
                        "description": "The provider's user id, taken from the listings context.",
                    },
                    "date": {
                        "type": "string",
                        "description": "Date to check, format YYYY-MM-DD. Must be today or later.",
                    },
                },
                "required": ["provider_id", "date"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "create_booking",
            "description": (
                "Create a real booking request for the current customer. Only call this after "
                "the customer has explicitly confirmed the service, date, and time -- never guess "
                "or assume a time on their behalf."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "service_id": {
                        "type": "integer",
                        "description": "The service id, taken from the listings context.",
                    },
                    "date": {"type": "string", "description": "Booking date, format YYYY-MM-DD."},
                    "time": {"type": "string", "description": "Booking time, 24h format HH:MM."},
                    "notes": {
                        "type": "string",
                        "description": "Optional short note for the provider.",
                    },
                },
                "required": ["service_id", "date", "time"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "cancel_booking",
            "description": (
                "Cancel one of the current customer's own bookings. Only bookings still "
                "'pending' or 'accepted' can be cancelled. Confirm with the customer which "
                "booking they mean before calling this if it's not obvious."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "booking_id": {
                        "type": "integer",
                        "description": "The booking id to cancel.",
                    },
                },
                "required": ["booking_id"],
            },
        },
    },
]


def check_provider_availability(db: Session, provider_id: int, date_str: str) -> dict:
    try:
        target_date = date_cls.fromisoformat(date_str)
    except ValueError:
        return {"error": "Invalid date format, expected YYYY-MM-DD."}
    if target_date < date_cls.today():
        return {"error": "That date is in the past."}

    provider = db.get(User, provider_id)
    if provider is None or provider.role != UserRole.PROVIDER:
        return {"error": "No such provider."}

    # App convention: 0 = Sunday ... 6 = Saturday. Python's date.weekday() is Monday=0..Sunday=6.
    day_of_week = (target_date.weekday() + 1) % 7
    slots = db.scalars(
        select(ProviderAvailability)
        .where(
            ProviderAvailability.provider_id == provider_id,
            ProviderAvailability.day_of_week == day_of_week,
        )
        .order_by(ProviderAvailability.start_time)
    ).all()
    if not slots:
        return {
            "available": False,
            "message": f"{provider.full_name} hasn't set any availability for that day of the week.",
        }

    existing = db.scalars(
        select(Booking).where(
            Booking.provider_id == provider_id,
            Booking.status.in_([BookingStatus.PENDING, BookingStatus.ACCEPTED]),
        )
    ).all()
    taken_times = sorted(
        b.booking_date.strftime("%H:%M") for b in existing if b.booking_date.date() == target_date
    )

    return {
        "available": True,
        "provider_name": provider.full_name,
        "date": date_str,
        "open_windows": [f"{s.start_time.strftime('%H:%M')}-{s.end_time.strftime('%H:%M')}" for s in slots],
        "already_booked_times": taken_times,
    }


def create_booking_for_customer(db: Session, customer: User, service_id: int, date_str: str, time_str: str, notes: str = "") -> dict:
    try:
        naive_dt = datetime.fromisoformat(f"{date_str}T{time_str}")
    except ValueError:
        return {"error": "Invalid date/time format. Use date=YYYY-MM-DD and time=HH:MM."}

    booking_dt = naive_dt.replace(tzinfo=timezone.utc)

    service = db.get(Service, service_id)
    if service is None or service.status != ServiceStatus.ACTIVE:
        return {"error": "That service isn't available."}

    try:
        payload = BookingCreate(service_id=service_id, booking_date=booking_dt, notes=notes or None)
    except ValidationError as exc:
        return {"error": exc.errors()[0]["msg"] if exc.errors() else "Invalid booking details."}

    try:
        booking = BookingService(db).create_booking(customer, payload)
    except HTTPException as exc:
        return {"error": str(exc.detail)}

    return {
        "success": True,
        "booking_id": booking.id,
        "status": booking.status.value if hasattr(booking.status, "value") else booking.status,
        "service_name": booking.service_name,
        "provider_name": booking.provider_name,
        "booking_date": booking.booking_date.isoformat(),
        "message": (
            f"Booking request sent to {booking.provider_name} for \"{booking.service_name}\" "
            f"on {booking.booking_date.strftime('%b %d, %Y at %H:%M')}. Awaiting their confirmation."
        ),
    }


def cancel_booking_for_customer(db: Session, customer: User, booking_id: int) -> dict:
    try:
        booking = BookingService(db).cancel_booking(booking_id, customer)
    except HTTPException as exc:
        return {"error": str(exc.detail)}

    return {
        "success": True,
        "booking_id": booking.id,
        "status": booking.status.value if hasattr(booking.status, "value") else booking.status,
        "message": f"Cancelled your booking for \"{booking.service_name}\" with {booking.provider_name}.",
    }


def execute_tool(name: str, arguments: dict, db: Session, customer: User) -> dict:
    if name == "check_provider_availability":
        return check_provider_availability(db, int(arguments["provider_id"]), str(arguments["date"]))
    if name == "create_booking":
        return create_booking_for_customer(
            db,
            customer,
            int(arguments["service_id"]),
            str(arguments["date"]),
            str(arguments["time"]),
            str(arguments.get("notes") or ""),
        )
    if name == "cancel_booking":
        return cancel_booking_for_customer(db, customer, int(arguments["booking_id"]))
    return {"error": f"Unknown tool: {name}"}
