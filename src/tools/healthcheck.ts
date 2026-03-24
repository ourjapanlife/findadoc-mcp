import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'

export function registerHealthcheck(server: McpServer): void {
    server.registerTool(
        'healthcheck',
        {
            description: 'Check if the Find a Doc MCP server is running'
        },
        () => ({
            content: [{ type: 'text', text: 'Find a Doc MCP server is running' }]
        })
    )
}
