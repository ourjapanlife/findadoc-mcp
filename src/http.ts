import Fastify from 'fastify'
import rateLimit from '@fastify/rate-limit'
import { randomUUID } from 'node:crypto'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { createServer } from './server.js'

const app = Fastify()

await app.register(rateLimit, {
    max: 100,
    timeWindow: '15 minutes',
    errorResponseBuilder: () => ({ error: 'Too many requests, please try again later' })
})

const transports: Map<string, StreamableHTTPServerTransport> = new Map()

app.post('/mcp', async (req, res) => {
    const sessionId = req.headers['mcp-session-id'] as string | undefined

    if (sessionId && transports.has(sessionId)) {
        const transport = transports.get(sessionId)!

        await transport.handleRequest(req.raw, res.raw, req.body)
        return res.hijack()
    }

    const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID()
    })

    transport.onclose = () => {
        if (transport.sessionId) {
            transports.delete(transport.sessionId)
        }
    }

    const server = createServer()

    await server.connect(transport)

    if (transport.sessionId) {
        transports.set(transport.sessionId, transport)
    }

    await transport.handleRequest(req.raw, res.raw, req.body)
    return res.hijack()
})

app.get('/mcp', async (req, res) => {
    const sessionId = req.headers['mcp-session-id'] as string | undefined

    if (!sessionId || !transports.has(sessionId)) {
        return res.status(400).send({ error: 'Invalid or missing session ID' })
    }

    const transport = transports.get(sessionId)!

    await transport.handleRequest(req.raw, res.raw)
    return res.hijack()
})

app.delete('/mcp', async (req, res) => {
    const sessionId = req.headers['mcp-session-id'] as string | undefined

    if (!sessionId || !transports.has(sessionId)) {
        return res.status(400).send({ error: 'Invalid or missing session ID' })
    }

    const transport = transports.get(sessionId)!

    await transport.close()
    transports.delete(sessionId)
    return res.status(200).send()
})

const PORT = parseInt(process.env.PORT || '3000', 10)

app.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
    if (err) {
        app.log.error(err)
        process.exit(1)
    }

    // eslint-disable-next-line no-console
    console.log(`Find a Doc MCP server listening on ${address}/mcp`)
})
