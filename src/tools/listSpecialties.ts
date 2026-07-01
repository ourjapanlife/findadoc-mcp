import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { listSpecialties } from '../core/taxonomy.js'

export function registerListSpecialties(server: McpServer): void {
    server.registerTool(
        'list_specialties',
        {
            description: 'List all medical specialties available in Find a Doc. Use this to discover valid values for the `specialties` filter on search_healthcare_professionals (e.g. "PEDIATRICS", "DENTISTRY", "INTERNAL_MEDICINE").'
        },
        async () => {
            try {
                const data = await listSpecialties()

                return {
                    content: [{ type: 'text', text: JSON.stringify(data, null, 2) }]
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error'

                return {
                    content: [{ type: 'text', text: `Failed to list specialties: ${message}` }],
                    isError: true
                }
            }
        }
    )
}
