import os
from google.adk.tools.mcp_tool.mcp_toolset import MCPToolset, StdioServerParameters
from dotenv import load_dotenv

load_dotenv()

async def get_calendar_tools():
    """Connect to Google Calendar MCP server and return tools."""
    tools, exit_stack = await MCPToolset.from_server(
        connection_params=StdioServerParameters(
            command="npx",
            args=[
                "-y",
                "@modelcontextprotocol/server-google-calendar",
            ],
            env={
                "GOOGLE_CLIENT_ID": os.environ["GOOGLE_CLIENT_ID"],
                "GOOGLE_CLIENT_SECRET": os.environ["GOOGLE_CLIENT_SECRET"],
                "GOOGLE_REFRESH_TOKEN": os.environ["GOOGLE_REFRESH_TOKEN"],
            }
        )
    )
    return tools, exit_stack