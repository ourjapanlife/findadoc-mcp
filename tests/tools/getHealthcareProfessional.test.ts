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

describe('get_healthcare_professional', () => {
    let client: Client

    beforeEach(async () => {
        vi.clearAllMocks()

        const server = createServer()
        const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()

        await server.connect(serverTransport)

        client = new Client({ name: 'test-client', version: '1.0.0' })
        await client.connect(clientTransport)
    })

    it('should return professional details for a valid ID', async () => {
        mockRequest.mockResolvedValueOnce({
            healthcareProfessional: {
                id: 'hp-1',
                names: [{ firstName: 'Taro', middleName: '', lastName: 'Yamada', locale: 'ja_JP' }],
                spokenLanguages: ['ja_JP', 'en_US'],
                degrees: ['MD'],
                specialties: ['DENTISTRY'],
                acceptedInsurance: ['JAPANESE_HEALTH_INSURANCE'],
                facilityIds: ['facility-1'],
                additionalInfoForPatients: null
            }
        })

        const result = await client.callTool({ name: 'get_healthcare_professional', arguments: { professionalId: 'hp-1' } })
        const parsed = JSON.parse((result.content as Array<{ text: string }>)[0].text)

        expect(parsed.names[0].lastName).toBe('Yamada')
        expect(mockRequest).toHaveBeenCalledWith(expect.anything(), { id: 'hp-1' })
    })

    it('should return an error when the professional is not found', async () => {
        mockRequest.mockResolvedValueOnce({ healthcareProfessional: null })

        const result = await client.callTool({ name: 'get_healthcare_professional', arguments: { professionalId: 'missing' } })

        expect(result.isError).toBe(true)
        expect((result.content as Array<{ text: string }>)[0].text).toContain('No healthcare professional found')
    })

    it('should return an error when the GraphQL request fails', async () => {
        mockRequest.mockRejectedValueOnce(new Error('Validation Failed'))

        const result = await client.callTool({ name: 'get_healthcare_professional', arguments: { professionalId: 'bad-id' } })

        expect(result.isError).toBe(true)
        expect((result.content as Array<{ text: string }>)[0].text).toContain('Validation Failed')
    })
})
