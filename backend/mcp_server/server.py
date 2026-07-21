#!/usr/bin/env python3
"""
Smart Hire MCP server.

Exposes the marketplace's read/write operations (search listings, check a
provider's real availability, create a booking) as MCP tools, so any MCP
client (Claude Desktop, Claude Code, the `mcp` CLI inspector, etc.) can
browse and act on the same data the web app uses -- same database, same
booking/availability rules, nothing mocked.

This is separate from the in-app chat widget's tool-calling (see
app/ai/service.py): that path is authenticated via the customer's JWT
inside our own FastAPI backend and talks to OpenAI directly. This server
speaks the MCP protocol instead, for external MCP clients. Both call the
same shared logic in app/ai/tools.py, so "what counts as an open slot" and
"what makes a booking valid" isn't duplicated.

Run directly (stdio transport, the standard for local MCP clients):
    cd backend && source venv/bin/activate && python mcp_server/server.py

Claude Desktop / Claude Code config (claude_desktop_config.json or similar):
    {
      "mcpServers": {
        "smart-hire": {
          "command": "/absolute/path/to/backend/venv/bin/python",
          "args": ["/absolute/path/to/backend/mcp_server/server.py"]
        }
      }
    }
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mcp.server.fastmcp import FastMCP
from sqlalchemy import select
from sqlalchemy.orm import joinedload

from app.ai.tools import cancel_booking_for_customer, check_provider_availability, create_booking_for_customer
from app.core.database import SessionLocal
from app.models.review import Review
from app.models.service import Service, ServiceStatus
from app.models.service_category import ServiceCategory
from app.models.user import User, UserRole

mcp = FastMCP("smart-hire")


@mcp.tool()
def list_categories() -> list[dict]:
    """List every service category on Smart Hire."""
    db = SessionLocal()
    try:
        categories = db.scalars(select(ServiceCategory).order_by(ServiceCategory.name)).all()
        return [{"id": c.id, "name": c.name, "icon": c.icon, "description": c.description} for c in categories]
    finally:
        db.close()


@mcp.tool()
def search_services(query: str = "", category: str = "", city: str = "") -> list[dict]:
    """
    Search active Smart Hire service listings. All filters are optional and
    combine with AND. `query` matches against the title/description.
    """
    db = SessionLocal()
    try:
        stmt = (
            select(Service)
            .options(joinedload(Service.provider), joinedload(Service.category))
            .where(Service.status == ServiceStatus.ACTIVE)
        )
        if query:
            like = f"%{query}%"
            stmt = stmt.where((Service.title.ilike(like)) | (Service.description.ilike(like)))
        if category:
            stmt = stmt.join(ServiceCategory).where(ServiceCategory.name.ilike(f"%{category}%"))
        if city:
            stmt = stmt.where(Service.city.ilike(f"%{city}%"))

        services = db.scalars(stmt.order_by(Service.created_at.desc()).limit(30)).unique().all()
        return [
            {
                "service_id": s.id,
                "title": s.title,
                "description": s.description,
                "price_lkr": float(s.price),
                "city": s.city,
                "duration": s.duration,
                "category": s.category.name if s.category else None,
                "provider_id": s.provider_id,
                "provider_name": s.provider.full_name,
                "provider_verified": (
                    s.provider.provider_profile.verification_status.value == "verified"
                    if s.provider.provider_profile
                    else False
                ),
            }
            for s in services
        ]
    finally:
        db.close()


@mcp.tool()
def get_provider_reviews(provider_id: int) -> list[dict]:
    """Get all written reviews for a given provider."""
    db = SessionLocal()
    try:
        reviews = db.scalars(select(Review).where(Review.provider_id == provider_id)).all()
        return [{"rating": r.rating, "comment": r.comment, "created_at": r.created_at.isoformat()} for r in reviews]
    finally:
        db.close()


@mcp.tool()
def check_availability(provider_id: int, date: str) -> dict:
    """
    Check a provider's open time windows on a given date (YYYY-MM-DD),
    based on their weekly schedule minus any bookings they already have.
    """
    db = SessionLocal()
    try:
        return check_provider_availability(db, provider_id, date)
    finally:
        db.close()


@mcp.tool()
def create_booking(customer_email: str, service_id: int, date: str, time: str, notes: str = "") -> dict:
    """
    Create a real booking request on behalf of a customer, identified by
    email (this server has no web session, so email stands in for auth).
    date is YYYY-MM-DD, time is 24h HH:MM. Fails if the slot conflicts with
    an existing booking's business rules (handled the same way the web app
    enforces them).
    """
    db = SessionLocal()
    try:
        customer = db.scalar(select(User).where(User.email == customer_email, User.role == UserRole.CUSTOMER))
        if customer is None:
            return {"error": f"No customer account found for {customer_email}."}
        result = create_booking_for_customer(db, customer, service_id, date, time, notes)
        db.commit()
        return result
    finally:
        db.close()


@mcp.tool()
def cancel_booking(customer_email: str, booking_id: int) -> dict:
    """Cancel a customer's own booking (must still be pending or accepted)."""
    db = SessionLocal()
    try:
        customer = db.scalar(select(User).where(User.email == customer_email, User.role == UserRole.CUSTOMER))
        if customer is None:
            return {"error": f"No customer account found for {customer_email}."}
        result = cancel_booking_for_customer(db, customer, booking_id)
        db.commit()
        return result
    finally:
        db.close()


if __name__ == "__main__":
    mcp.run(transport="stdio")
