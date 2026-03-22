import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import { createServer } from '../src/server.js'

vi.mock('../src/graphql.js', () => ({
    gqlClient: {
        request: vi.fn()
    }
}))

describe('findadoc-mcp server', () => {
    let client: Client

    beforeEach(async () => {
        vi.clearAllMocks()

        const server = createServer()
        const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()

        await server.connect(serverTransport)

        client = new Client({ name: 'test-client', version: '1.0.0' })
        await client.connect(clientTransport)
    })

    it('should list available tools', async () => {
        const result = await client.listTools()

        expect(result.tools).toHaveLength(2)

        const toolNames = result.tools.map((t: { name: string }) => t.name)

        expect(toolNames).toContain('healthcheck')
        expect(toolNames).toContain('search_healthcare_professionals')
    })
})
