import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { registerHealthcheck } from './tools/healthcheck.js'
import { registerSearchHealthcareProfessionals } from './tools/searchHealthcareProfessionals.js'
import { registerSearchFacilities } from './tools/searchFacilities.js'
import { registerGetFacility } from './tools/getFacility.js'
import { registerGetHealthcareProfessional } from './tools/getHealthcareProfessional.js'
import { registerListSpecialties } from './tools/listSpecialties.js'
import { registerListLanguages } from './tools/listLanguages.js'

export function createServer(): McpServer {
    const server = new McpServer({
        name: 'findadoc-mcp',
        version: '0.1.0'
    })

    registerHealthcheck(server)
    registerSearchHealthcareProfessionals(server)
    registerSearchFacilities(server)
    registerGetFacility(server)
    registerGetHealthcareProfessional(server)
    registerListSpecialties(server)
    registerListLanguages(server)

    return server
}
