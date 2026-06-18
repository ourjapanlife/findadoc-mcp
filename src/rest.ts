import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import type { FastifyInstance, FastifyReply } from 'fastify'
import { searchHealthcareProfessionals, getHealthcareProfessional } from './core/professionals.js'
import { searchFacilities, getFacility } from './core/facilities.js'
import { listSpecialties, listLanguages } from './core/taxonomy.js'

// REST + OpenAPI layer for clients that use REST Actions rather than MCP
// (e.g. ChatGPT custom GPTs). These routes are thin wrappers over the same
// core functions the MCP tools use — the GraphQL queries are not duplicated.

// Normalize a query-string value into a string array. Repeated params arrive as
// an array; a single param arrives as a string (optionally comma-separated).
function toArray(value: unknown): string[] | undefined {
    if (value === undefined) { return undefined }
    if (Array.isArray(value)) { return value.map(String) }

    return String(value).split(',').map(s => s.trim()).filter(Boolean)
}

function toInt(value: unknown): number | undefined {
    if (value === undefined) { return undefined }

    const n = Number(value)

    return Number.isFinite(n) ? n : undefined
}

function toStr(value: unknown): string | undefined {
    return value === undefined ? undefined : String(value)
}

function fail(reply: FastifyReply, status: number, error: unknown): { error: string } {
    const message = error instanceof Error ? error.message : 'Unknown error'

    reply.code(status)

    return { error: message }
}

export async function registerRestRoutes(app: FastifyInstance): Promise<void> {
    app.get('/api/healthcare-professionals', async (req, reply) => {
        const q = req.query as Record<string, unknown>

        try {
            return await searchHealthcareProfessionals({
                limit: toInt(q.limit),
                offset: toInt(q.offset),
                spokenLanguages: toArray(q.spokenLanguages),
                specialties: toArray(q.specialties),
                degrees: toArray(q.degrees),
                acceptedInsurance: toArray(q.acceptedInsurance)
            })
        } catch (error) {
            return fail(reply, 502, error)
        }
    })

    app.get('/api/healthcare-professionals/:id', async (req, reply) => {
        const { id } = req.params as { id: string }

        try {
            const professional = await getHealthcareProfessional(id)

            if (!professional) { return fail(reply, 404, new Error(`No healthcare professional found with ID "${id}".`)) }

            return professional
        } catch (error) {
            return fail(reply, 502, error)
        }
    })

    app.get('/api/facilities', async (req, reply) => {
        const q = req.query as Record<string, unknown>

        try {
            return await searchFacilities({
                limit: toInt(q.limit),
                offset: toInt(q.offset),
                nameEn: toStr(q.nameEn),
                nameJa: toStr(q.nameJa),
                healthcareProfessionalName: toStr(q.healthcareProfessionalName)
            })
        } catch (error) {
            return fail(reply, 502, error)
        }
    })

    app.get('/api/facilities/:id', async (req, reply) => {
        const { id } = req.params as { id: string }

        try {
            const facility = await getFacility(id)

            if (!facility) { return fail(reply, 404, new Error(`No facility found with ID "${id}".`)) }

            return facility
        } catch (error) {
            return fail(reply, 502, error)
        }
    })

    app.get('/api/specialties', async (req, reply) => {
        try {
            return await listSpecialties()
        } catch (error) {
            return fail(reply, 502, error)
        }
    })

    app.get('/api/languages', async (req, reply) => {
        try {
            return await listLanguages()
        } catch (error) {
            return fail(reply, 502, error)
        }
    })

    // Serve the OpenAPI manifest so ChatGPT (and other OpenAPI clients) can
    // import it directly from the running server.
    const openapiPath = fileURLToPath(new URL('../openapi.yaml', import.meta.url))

    app.get('/openapi.yaml', async (req, reply) => {
        try {
            const yaml = await readFile(openapiPath, 'utf8')

            reply.header('Content-Type', 'application/yaml')

            return yaml
        } catch (error) {
            return fail(reply, 500, error)
        }
    })
}
