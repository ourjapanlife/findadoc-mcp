# Find a Doc, Japan - MCP Server

MCP (Model Context Protocol) server for [Find a Doc, Japan](https://www.findadoc.jp) - connecting people in Japan to healthcare services.

## About

This is the MCP server for Find a Doc, providing AI-powered tools for interacting with our healthcare provider data. It exposes findadoc.jp healthcare professionals and facilities data to LLM clients such as Claude and ChatGPT.

## Tools

| Tool | Description |
|---|---|
| `search_healthcare_professionals` | Search professionals by spoken language, specialty, degree, or insurance |
| `search_facilities` | Search clinics and hospitals by name or affiliated professional |
| `get_facility` | Full details for a single facility by ID |
| `get_healthcare_professional` | Full details for a single professional by ID |
| `list_specialties` | All searchable medical specialties (valid `specialties` filter values) |
| `list_languages` | All supported spoken languages (valid `spokenLanguages` filter values) |
| `healthcheck` | Confirm the server is running |

See [CONTRIBUTING.md](CONTRIBUTING.md) to add a tool and [docs/testing.md](docs/testing.md) for example calls.

## Getting Started

### Prerequisites

- Node.js >= 22.12.0
- [Corepack](https://nodejs.org/api/corepack.html) enabled (for Yarn 4)

### Installation

1. Enable Corepack (if not already enabled):

```bash
corepack enable
```

2. Install dependencies:

```bash
yarn install
```

3. Copy the example environment file:

```bash
cp .env.example .env
```

4. Build the project:

```bash
yarn build
```

## Development

### STDIO (local development)

MCP servers communicate over stdio (standard input/output), so running the server directly will appear to "hang" — it's waiting for JSON-RPC messages from a client. To develop and test, connect it to an MCP client.

```bash
yarn dev
```

### HTTP (Streamable HTTP)

For remote access or testing the production transport locally:

```bash
yarn dev:http
```

The server listens on `http://localhost:3000/mcp` by default. Set `PORT` in your `.env` to change it.

### REST / OpenAPI (ChatGPT Actions)

The HTTP server also exposes the same tools as REST endpoints under `/api/*`, described by [`openapi.yaml`](openapi.yaml) (served at `/openapi.yaml`). This is for OpenAPI clients such as ChatGPT custom GPTs that use REST Actions rather than MCP. The REST routes are thin wrappers over the same core logic as the MCP tools — see [docs/chatgpt-setup.md](docs/chatgpt-setup.md).

```bash
curl 'http://localhost:3000/api/specialties'
```

### Connecting to an MCP Client

#### Claude Desktop

Add to your Claude Desktop config file:

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
    "mcpServers": {
        "findadoc": {
            "command": "node",
            "args": ["/absolute/path/to/findadoc-mcp/dist/index.js"]
        }
    }
}
```

Restart Claude Desktop after updating the config.

#### Claude Code

Add the server from the CLI:

```bash
claude mcp add findadoc node /absolute/path/to/findadoc-mcp/dist/index.js
```

#### MCP Inspector

Use the [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector) to interactively test and debug the server:

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

This opens a web UI where you can list tools, call them, and inspect the JSON-RPC messages.

## Testing

Tests use [Vitest](https://vitest.dev/) with the MCP SDK's `InMemoryTransport` to test the server without needing stdio or a running client.

```bash
yarn test
yarn test:watch
```

## Build

Compiles TypeScript to JavaScript in the `dist/` directory:

```bash
yarn build
```

## Linting

```bash
yarn lint
yarn lint:fix
```

## Adding a New Tool

Tools live in `src/tools/` as individual modules. Each tool exports a registration function that receives the `McpServer` instance. See `src/tools/healthcheck.ts` for the reference pattern.

1. Create `src/tools/your-tool.ts`
2. Export a `registerYourTool(server: McpServer)` function
3. Call it from `src/server.ts`
4. Add tests in `tests/tools/` (and update the tool-count assertion in `tests/server.test.ts`)

## Architecture Decisions

| Decision | Choice | Rationale |
|---|---|---|
| **Transport** | Streamable HTTP (primary), STDIO (local dev) | Streamable HTTP is the current MCP spec standard for remote servers. STDIO kept for local dev with Claude Code and MCP Inspector. |
| **Hosting** | DigitalOcean Droplet | Direct control over the server environment. |
| **Domain** | `mcp.findadoc.jp` | Dedicated subdomain for the MCP endpoint. |
| **GraphQL client** | `graphql-request` | Lightweight, minimal client for querying the Find a Doc GraphQL API. |
| **Test framework** | Vitest | Fast, native ESM support, compatible with the MCP SDK's `InMemoryTransport`. |
| **Package manager** | Yarn 4 (via Corepack) | Consistent dependency resolution across contributors. |
| **Error handling** | Return `isError: true` with descriptive messages | When upstream GraphQL calls fail, tools return MCP error responses with the failure reason rather than throwing. This lets the LLM client gracefully inform the user instead of the connection dropping. |
| **Staging** | None (production only for now) | Single environment to keep ops simple while the server is new. |

## License

BSD 3-Clause License - see [LICENSE](LICENSE) for details.
