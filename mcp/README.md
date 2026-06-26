# WedPlanAI MCP Server

This is a Model Context Protocol (MCP) server that exposes tools to interact with the WedPlanAI REST API. It runs via stdio streams and communicates using JSON-RPC 2.0.

## Tools Exposed

The server exposes the following tools:

- **Wedding**: `get_wedding`, `update_wedding`
- **Guests**: `list_guests`, `create_guest`, `update_guest`, `delete_guest`
- **Tasks**: `list_tasks`, `create_task`, `update_task`, `delete_task`
- **Ceremonies**: `list_ceremonies`, `create_ceremony`, `update_ceremony`, `delete_ceremony`
- **Vendors**: `list_vendors`, `create_vendor`, `update_vendor`, `delete_vendor`

## Prerequisites

- Node.js (v18 or higher)
- A running instance of WedPlanAI
- A valid WedPlanAI API Key (generated from the Admin Panel under **API Keys**)

## Claude Desktop Configuration

To use this server with Claude Desktop, add it to your `claude_desktop_config.json` file.

### Config File Location
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

### Configuration Snippet
Add the following under the `mcpServers` block:

```json
{
  "mcpServers": {
    "wedplanai": {
      "command": "node",
      "args": [
        "c:/Users/AVASA/Downloads/OpenC/lvzday4/mcp/server.js"
      ],
      "env": {
        "WEDPLANAI_API_KEY": "your_api_key_here",
        "WEDPLANAI_BASE_URL": "http://localhost:3044"
      }
    }
  }
}
```

*Note: Make sure to replace the path in `args` with the absolute path to your `server.js` file, and set the correct `WEDPLANAI_API_KEY` in `env`.*

## Running Manually

You can test the MCP server manually in the console:

```bash
node mcp/server.js
```

Once running, send a JSON-RPC initialize request to stdin:

```json
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test-client","version":"1.0.0"}}}
```

The server will output the JSON-RPC initialization response to stdout.
