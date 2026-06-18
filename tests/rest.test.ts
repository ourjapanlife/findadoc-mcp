import { describe, it, expect, beforeEach, vi } from 'vitest'
import Fastify, { type FastifyInstance } from 'fastify'

vi.mock('../src/graphql.js', () => ({
    gqlClient: {
        request: vi.fn()
    }
}))

import { gqlClient } from '../src/graphql.js'
import { registerRestRoutes } from '../src/rest.js'

const mockRequest = vi.mocked(gqlClient.request)

describe('REST routes', () => {
    let app: FastifyInstance

    beforeEach(async () => {
        vi.clearAllMocks()
        app = Fastify()
        await registerRestRoutes(app)
    })

    it('GET /api/healthcare-professionals returns results and forwards array filters', async () => {
        mockRequest.mockResolvedValueOnce({
            healthcareProfessionals: [{ id: 'hp-1' }],
            healthcareProfessionalsTotalCount: 1
        })

        const res = await app.inject({
            method: 'GET',
            url: '/api/healthcare-professionals?limit=5&spokenLanguages=en_US&specialties=DENTISTRY,PEDIATRICS'
        })

        expect(res.statusCode).toBe(200)
        expect(res.json().totalCount).toBe(1)
        expect(mockRequest).toHaveBeenCalledWith(expect.anything(), {
            filters: { limit: 5, offset: 0, spokenLanguages: ['en_US'], specialties: ['DENTISTRY', 'PEDIATRICS'] }
        })
    })

    it('GET /api/facilities/:id returns 404 when not found', async () => {
        mockRequest.mockResolvedValueOnce({ facility: null })

        const res = await app.inject({ method: 'GET', url: '/api/facilities/missing' })

        expect(res.statusCode).toBe(404)
        expect(res.json().error).toContain('No facility found')
    })

    it('GET /api/facilities/:id returns the facility when found', async () => {
        mockRequest.mockResolvedValueOnce({ facility: { id: 'f-1', nameEn: 'A-ONE Dental Clinic' } })

        const res = await app.inject({ method: 'GET', url: '/api/facilities/f-1' })

        expect(res.statusCode).toBe(200)
        expect(res.json().nameEn).toBe('A-ONE Dental Clinic')
    })

    it('GET /api/specialties returns the enum list', async () => {
        mockRequest.mockResolvedValueOnce({ __type: { enumValues: [{ name: 'DENTISTRY' }] } })

        const res = await app.inject({ method: 'GET', url: '/api/specialties' })

        expect(res.statusCode).toBe(200)
        expect(res.json()).toEqual({ count: 1, specialties: ['DENTISTRY'] })
    })

    it('returns 502 when the upstream GraphQL call fails', async () => {
        mockRequest.mockRejectedValueOnce(new Error('Connection refused'))

        const res = await app.inject({ method: 'GET', url: '/api/languages' })

        expect(res.statusCode).toBe(502)
        expect(res.json().error).toContain('Connection refused')
    })

    it('serves the OpenAPI manifest', async () => {
        const res = await app.inject({ method: 'GET', url: '/openapi.yaml' })

        expect(res.statusCode).toBe(200)
        expect(res.headers['content-type']).toContain('yaml')
        expect(res.body).toContain('openapi: 3.1.0')
    })
})
