import express from 'express'
import { randomUUID } from 'node:crypto'
import rateLimit from 'express-rate-limit'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { createServer } from './server.js'

const app = express()

app.use(express.json())

const limiter = rateLimit({
    windowMs: 900000, // 15 mins
    limit: 100,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later' }
})

app.use('/mcp', limiter)

const transports: Map<string, StreamableHTTPServerTransport> = new Map()

app.post('/mcp', async (req, res) => {
    const sessionId = req.headers['mcp-session-id'] as string | undefined

    if (sessionId && transports.has(sessionId)) {
        const transport = transports.get(sessionId)!

        await transport.handleRequest(req, res, req.body)
        return
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

    await transport.handleRequest(req, res, req.body)
})

app.get('/mcp', async (req, res) => {
    const sessionId = req.headers['mcp-session-id'] as string | undefined

    if (!sessionId || !transports.has(sessionId)) {
        res.status(400).json({ error: 'Invalid or missing session ID' })
        return
    }

    const transport = transports.get(sessionId)!

    await transport.handleRequest(req, res)
})

app.delete('/mcp', async (req, res) => {
    const sessionId = req.headers['mcp-session-id'] as string | undefined

    if (!sessionId || !transports.has(sessionId)) {
        res.status(400).json({ error: 'Invalid or missing session ID' })
        return
    }

    const transport = transports.get(sessionId)!

    await transport.close()
    transports.delete(sessionId)
    res.status(200).end()
})

const PORT = parseInt(process.env.PORT || '3000', 10)

app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Find a Doc MCP server listening on http://localhost:${PORT}/mcp`)
})
