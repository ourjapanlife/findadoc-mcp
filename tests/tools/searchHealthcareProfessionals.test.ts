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

describe('search_healthcare_professionals', () => {
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
            healthcareProfessionals: [
                {
                    id: '123',
                    names: [{ firstName: 'Taro', middleName: '', lastName: 'Yamada', locale: 'ja_JP' }],
                    spokenLanguages: ['ja_JP', 'en_US'],
                    degrees: ['MD'],
                    specialties: ['GENERAL_PRACTICE'],
                    acceptedInsurance: ['JAPANESE_HEALTH_INSURANCE'],
                    facilityIds: ['facility-1']
                }
            ],
            healthcareProfessionalsTotalCount: 1
        })

        const result = await client.callTool({ name: 'search_healthcare_professionals', arguments: {} })
        const parsed = JSON.parse((result.content as Array<{ text: string }>)[0].text)

        expect(parsed.totalCount).toBe(1)
        expect(parsed.results).toHaveLength(1)
        expect(parsed.results[0].names[0].lastName).toBe('Yamada')

        expect(mockRequest).toHaveBeenCalledOnce()
        expect(mockRequest).toHaveBeenCalledWith(
            expect.anything(),
            {
                filters: {
                    limit: 10,
                    offset: 0
                }
            }
        )
    })

    it('should pass optional filters to the query', async () => {
        mockRequest.mockResolvedValueOnce({
            healthcareProfessionals: [],
            healthcareProfessionalsTotalCount: 0
        })

        await client.callTool({
            name: 'search_healthcare_professionals',
            arguments: {
                limit: 5,
                offset: 10,
                spokenLanguages: ['en_US'],
                specialties: ['PEDIATRICS'],
                degrees: ['MD'],
                acceptedInsurance: ['INTERNATIONAL_HEALTH_INSURANCE']
            }
        })

        expect(mockRequest).toHaveBeenCalledWith(
            expect.anything(),
            {
                filters: {
                    limit: 5,
                    offset: 10,
                    spokenLanguages: ['en_US'],
                    specialties: ['PEDIATRICS'],
                    degrees: ['MD'],
                    acceptedInsurance: ['INTERNATIONAL_HEALTH_INSURANCE']
                }
            }
        )
    })

    it('should return an error when the GraphQL request fails', async () => {
        mockRequest.mockRejectedValueOnce(new Error('Connection refused'))

        const result = await client.callTool({ name: 'search_healthcare_professionals', arguments: {} })

        expect(result.isError).toBe(true)
        expect((result.content as Array<{ text: string }>)[0].text).toContain('Connection refused')
    })
})
