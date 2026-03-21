import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { registerHealthcheck } from './tools/healthcheck.js'
import { registerSearchHealthcareProfessionals } from './tools/searchHealthcareProfessionals.js'

export function createServer(): McpServer {
    const server = new McpServer({
        name: 'findadoc-mcp',
        version: '0.1.0'
    })

    registerHealthcheck(server)
    registerSearchHealthcareProfessionals(server)

    return server
}
