import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import { createServer } from '../../src/server.js'

vi.mock('../../src/graphql.js', () => ({
    gqlClient: {
        request: vi.fn()
    }
}))

import { gqlClient } from '../../src/graphql.js'

const mockRequest = vi.mocked(gqlClient.request)

describe('list_specialties', () => {
    let client: Client

    beforeEach(async () => {
        vi.clearAllMocks()

        const server = createServer()
        const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()

        await server.connect(serverTransport)

        client = new Client({ name: 'test-client', version: '1.0.0' })
        await client.connect(clientTransport)
    })

    it('should return the list of specialties from the enum', async () => {
        mockRequest.mockResolvedValueOnce({
            __type: { enumValues: [{ name: 'DENTISTRY' }, { name: 'PEDIATRICS' }] }
        })

        const result = await client.callTool({ name: 'list_specialties', arguments: {} })
        const parsed = JSON.parse((result.content as Array<{ text: string }>)[0].text)

        expect(parsed.count).toBe(2)
        expect(parsed.specialties).toEqual(['DENTISTRY', 'PEDIATRICS'])
    })

    it('should return an error when the GraphQL request fails', async () => {
        mockRequest.mockRejectedValueOnce(new Error('Connection refused'))

        const result = await client.callTool({ name: 'list_specialties', arguments: {} })

        expect(result.isError).toBe(true)
        expect((result.content as Array<{ text: string }>)[0].text).toContain('Connection refused')
    })
})
