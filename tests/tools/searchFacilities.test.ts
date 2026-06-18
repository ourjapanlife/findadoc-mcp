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

describe('search_facilities', () => {
    let client: Client

    beforeEach(async () => {
        vi.clearAllMocks()

        const server = createServer()
        const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()

        await server.connect(serverTransport)

        client = new Client({ name: 'test-client', version: '1.0.0' })
        await client.connect(clientTransport)
    })

    it('should return results with default filters', async () => {
        mockRequest.mockResolvedValueOnce({
            facilities: [
                {
                    id: 'f-1',
                    nameEn: 'A-ONE Dental Clinic',
                    nameJa: 'A-ONE 歯科',
                    contact: { phone: '03-0000-0000', website: null, address: {} },
                    healthcareProfessionalIds: ['hp-1']
                }
            ],
            facilitiesTotalCount: 1
        })

        const result = await client.callTool({ name: 'search_facilities', arguments: {} })
        const parsed = JSON.parse((result.content as Array<{ text: string }>)[0].text)

        expect(parsed.totalCount).toBe(1)
        expect(parsed.results).toHaveLength(1)
        expect(mockRequest).toHaveBeenCalledWith(expect.anything(), { filters: { limit: 10, offset: 0 } })
    })

    it('should pass optional filters to the query', async () => {
        mockRequest.mockResolvedValueOnce({ facilities: [], facilitiesTotalCount: 0 })

        await client.callTool({
            name: 'search_facilities',
            arguments: { limit: 5, offset: 10, nameEn: 'Dental', healthcareProfessionalName: 'Yamada' }
        })

        expect(mockRequest).toHaveBeenCalledWith(expect.anything(), {
            filters: { limit: 5, offset: 10, nameEn: 'Dental', healthcareProfessionalName: 'Yamada' }
        })
    })

    it('should return an error when the GraphQL request fails', async () => {
        mockRequest.mockRejectedValueOnce(new Error('Connection refused'))

        const result = await client.callTool({ name: 'search_facilities', arguments: {} })

        expect(result.isError).toBe(true)
        expect((result.content as Array<{ text: string }>)[0].text).toContain('Connection refused')
    })
})
