# Contributing to Find a Doc MCP Server

Thanks for helping connect people in Japan to multilingual healthcare. This guide takes you from a fresh clone to your first working MCP tool call.

## Prerequisites

- **Node.js >= 22.12.0**
- **Corepack** enabled (ships with Node, manages Yarn 4):
  ```bash
  corepack enable
  ```

## Local setup

```bash
git clone https://github.com/ourjapanlife/findadoc-mcp.git
cd findadoc-mcp
yarn install
cp .env.example .env
```

`.env` defaults to the **public** Find a Doc GraphQL API — no credentials required:

```
GRAPHQL_ENDPOINT=https://api.findadoc.jp
PORT=3000
```

## Running the server

The server speaks the Model Context Protocol over two transports:

| Command | Transport | Use for |
|---|---|---|
| `yarn dev` | STDIO | Local dev with Claude Desktop, Claude Code, MCP Inspector |
| `yarn dev:http` | Streamable HTTP (`http://localhost:3000/mcp`) | Remote access / testing the production transport |

> STDIO servers communicate over stdin/stdout, so `yarn dev` will look like it's "hanging" — it's waiting for a client to connect. That's expected. See [docs/testing.md](docs/testing.md) to drive it with MCP Inspector.

## Project layout

```
src/
  index.ts        STDIO entrypoint
  http.ts         Streamable HTTP entrypoint (mounts /mcp + REST routes)
  server.ts       Builds the McpServer and registers every tool
  graphql.ts      Shared graphql-request client
  core/           GraphQL query logic, shared by MCP tools and REST routes
  tools/          One file per MCP tool (thin adapter over core/)
  rest.ts         REST + OpenAPI routes (ChatGPT Actions), also over core/
tests/            Vitest tests (mirrors src/, uses InMemoryTransport)
```

The **GraphQL queries live in `src/core/`** and are called by both the MCP tools and the REST routes — never duplicate a query in a tool or route file.

## Adding a tool

1. **Core logic** — add (or reuse) a function in `src/core/` that takes plain params and returns plain data (or throws). Define the `gql` query and a typed response interface here.
2. **MCP tool** — create `src/tools/yourTool.ts` exporting `registerYourTool(server: McpServer)`:
   - Validate inputs with `zod` via `inputSchema`.
   - Call the core function.
   - **Return errors, don't throw** — wrap the call in `try/catch` and return `{ isError: true, content: [...] }` so the LLM can recover gracefully instead of dropping the connection.
   - Register it in `src/server.ts`.
   - Use an existing tool as the pattern: search (`searchHealthcareProfessionals.ts`), get-by-id (`getFacility.ts`), or enum/list (`listSpecialties.ts`).
3. **REST route** (optional, for ChatGPT parity) — add a route in `src/rest.ts` that calls the same core function. Update [`openapi.yaml`](openapi.yaml).
4. **Tests** — add `tests/tools/yourTool.test.ts` (mock `../../src/graphql.js`) and bump the tool-count assertion in `tests/server.test.ts`. REST routes are tested in `tests/rest.test.ts`.

## Before you open a PR

```bash
yarn test     # all tests must pass
yarn lint     # no lint errors
yarn build    # type-checks cleanly
```

- **Branch** off `main`; don't commit directly.
- **PR titles** must follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `chore:`, …) — this is enforced by CI.
- **Reference the issue** you're addressing (e.g. `Closes #7`).
- Keep PRs scoped to one tool / one concern where possible.

## Working with the GraphQL API

The Find a Doc schema is introspectable. To explore queries, types, and enums, POST GraphQL to `https://api.findadoc.jp` (note: the endpoint is the **root** — there is no `/graphql` path). Example:

```bash
curl -s -X POST https://api.findadoc.jp \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __schema { queryType { fields { name } } } }"}'
```

See [docs/testing.md](docs/testing.md) for the full testing workflow.
