import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { getHealthcareProfessional } from '../core/professionals.js'

export function registerGetHealthcareProfessional(server: McpServer): void {
    server.registerTool(
        'get_healthcare_professional',
        {
            description: 'Get full details for a single healthcare professional in Japan by their ID. Typically called after search_healthcare_professionals. Returns names, specialties, spoken languages, degrees, accepted insurance, associated facility IDs, and any additional info for patients.',
            inputSchema: {
                professionalId: z.string().describe('The unique ID of the healthcare professional (UUID)')
            }
        },
        async ({ professionalId }) => {
            try {
                const professional = await getHealthcareProfessional(professionalId)

                if (!professional) {
                    return {
                        content: [{ type: 'text', text: `No healthcare professional found with ID "${professionalId}".` }],
                        isError: true
                    }
                }

                return {
                    content: [{ type: 'text', text: JSON.stringify(professional, null, 2) }]
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error'

                return {
                    content: [{ type: 'text', text: `Failed to get healthcare professional: ${message}` }],
                    isError: true
                }
            }
        }
    )
}
