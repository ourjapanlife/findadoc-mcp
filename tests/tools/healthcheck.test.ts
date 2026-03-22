import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import { createServer } from '../../src/server.js'

vi.mock('../../src/graphql.js', () => ({
    gqlClient: {
        request: vi.fn()
    }
}))

describe('healthcheck', () => {
    let client: Client

    beforeEach(async () => {
        const server = createServer()
        const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()

        await server.connect(serverTransport)

        client = new Client({ name: 'test-client', version: '1.0.0' })
        await client.connect(clientTransport)
    })

    it('should return server status', async () => {
        const result = await client.callTool({ name: 'healthcheck' })

        expect(result.content).toEqual([
            { type: 'text', text: 'Find a Doc MCP server is running' }
        ])
    })
})
