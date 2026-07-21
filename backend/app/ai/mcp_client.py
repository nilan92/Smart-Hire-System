"""
Bridges the chat tool-calling loop to the standalone MCP server
(mcp_server/server.py) over the real MCP protocol, instead of calling
app/ai/tools.py directly in-process. Used only when a caller opts in
(ChatRequest.use_mcp) -- the floating widget stays on the faster
in-process path (app.ai.tools.execute_tool), since a genuine MCP round
trip means spawning a fresh subprocess per tool call.
"""

import asyncio
import json
import sys
from pathlib import Path

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

SERVER_SCRIPT = Path(__file__).resolve().parents[2] / "mcp_server" / "server.py"

# Our OpenAI tool schema names don't all match the MCP server's tool names 1:1.
_TOOL_NAME_MAP = {
    "check_provider_availability": "check_availability",
    "create_booking": "create_booking",
    "cancel_booking": "cancel_booking",
}


async def _call_async(mcp_tool: str, arguments: dict) -> dict:
    params = StdioServerParameters(command=sys.executable, args=[str(SERVER_SCRIPT)])
    async with stdio_client(params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            result = await session.call_tool(mcp_tool, arguments)
            return json.loads(result.content[0].text)


def execute_tool_via_mcp(name: str, arguments: dict, customer_email: str) -> dict:
    mcp_tool = _TOOL_NAME_MAP.get(name)
    if mcp_tool is None:
        return {"error": f"Unknown tool: {name}"}
    call_args = dict(arguments)
    if mcp_tool in ("create_booking", "cancel_booking"):
        call_args["customer_email"] = customer_email
    return asyncio.run(_call_async(mcp_tool, call_args))
