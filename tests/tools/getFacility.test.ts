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

describe('get_facility', () => {
    let client: Client

    beforeEach(async () => {
        vi.clearAllMocks()

        const server = createServer()
        const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()

        await server.connect(serverTransport)

        client = new Client({ name: 'test-client', version: '1.0.0' })
        await client.connect(clientTransport)
    })

    it('should return facility details for a valid ID', async () => {
        mockRequest.mockResolvedValueOnce({
            facility: {
                id: 'abc',
                nameEn: 'A-ONE Dental Clinic',
                nameJa: 'A-ONE 歯科',
                contact: { phone: '03-0000-0000', email: null, website: null, googleMapsUrl: 'https://maps', address: {} },
                mapLatitude: 35,
                mapLongitude: 139,
                healthcareProfessionalIds: ['hp-1'],
                paymentOptions: []
            }
        })

        const result = await client.callTool({ name: 'get_facility', arguments: { facilityId: 'abc' } })
        const parsed = JSON.parse((result.content as Array<{ text: string }>)[0].text)

        expect(parsed.nameEn).toBe('A-ONE Dental Clinic')
        expect(mockRequest).toHaveBeenCalledWith(expect.anything(), { id: 'abc' })
    })

    it('should return an error when the facility is not found', async () => {
        mockRequest.mockResolvedValueOnce({ facility: null })

        const result = await client.callTool({ name: 'get_facility', arguments: { facilityId: 'missing' } })

        expect(result.isError).toBe(true)
        expect((result.content as Array<{ text: string }>)[0].text).toContain('No facility found')
    })

    it('should return an error when the GraphQL request fails', async () => {
        mockRequest.mockRejectedValueOnce(new Error('Validation Failed'))

        const result = await client.callTool({ name: 'get_facility', arguments: { facilityId: 'bad-id' } })

        expect(result.isError).toBe(true)
        expect((result.content as Array<{ text: string }>)[0].text).toContain('Validation Failed')
    })
})
