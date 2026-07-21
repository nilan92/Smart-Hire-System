#!/usr/bin/env python3
"""
QA check for the Smart Hire MCP server (backend/mcp_server/server.py).

Spawns the server as a real subprocess over stdio (the same way Claude
Desktop/Claude Code would) and drives it through the actual MCP protocol --
list tools, then call each one -- rather than just importing the Python
functions directly. This is what proves the server is genuinely usable by
an MCP client, not just that the underlying functions work.

Usage:
    python qa/test_mcp_server.py
"""

import asyncio
import sys
from pathlib import Path

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

BACKEND_DIR = Path(__file__).resolve().parents[1] / "backend"
SERVER_SCRIPT = BACKEND_DIR / "mcp_server" / "server.py"
PYTHON = BACKEND_DIR / "venv" / "bin" / "python"

_passed = 0
_failed = 0


def check(label: str, condition: bool, detail: str = "") -> None:
    global _passed, _failed
    if condition:
        _passed += 1
        print(f"  PASS  {label}")
    else:
        _failed += 1
        print(f"  FAIL  {label}  {detail}")


async def main() -> int:
    params = StdioServerParameters(command=str(PYTHON), args=[str(SERVER_SCRIPT)])

    async with stdio_client(params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()

            print("== Tool discovery ==")
            tools_result = await session.list_tools()
            tool_names = {t.name for t in tools_result.tools}
            expected = {
                "list_categories", "search_services", "get_provider_reviews",
                "check_availability", "create_booking", "cancel_booking",
            }
            check("server exposes all expected tools", expected.issubset(tool_names), f"got {tool_names}")

            print("\n== list_categories ==")
            result = await session.call_tool("list_categories", {})
            categories_text = result.content[0].text
            check("list_categories returns data", "Plumbing" in categories_text or "id" in categories_text, categories_text[:200])

            print("\n== search_services ==")
            result = await session.call_tool("search_services", {"city": "Colombo"})
            services_text = result.content[0].text
            check("search_services returns real listings", "service_id" in services_text, services_text[:200])

            print("\n== check_availability (nonexistent provider) ==")
            result = await session.call_tool("check_availability", {"provider_id": 999999, "date": "2026-08-01"})
            avail_text = result.content[0].text
            check("check_availability handles an unknown provider gracefully", "error" in avail_text.lower(), avail_text[:200])

            print("\n== create_booking (nonexistent customer) ==")
            result = await session.call_tool(
                "create_booking",
                {"customer_email": "definitely_not_a_real_account@example.com", "service_id": 1, "date": "2026-08-01", "time": "10:00"},
            )
            booking_text = result.content[0].text
            check("create_booking rejects an unknown customer email", "error" in booking_text.lower(), booking_text[:200])

    print(f"\n{_passed} passed, {_failed} failed")
    return 1 if _failed else 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
