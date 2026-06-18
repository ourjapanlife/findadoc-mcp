import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { getFacility } from '../core/facilities.js'

export function registerGetFacility(server: McpServer): void {
    server.registerTool(
        'get_facility',
        {
            description: 'Get full details for a single healthcare facility (clinic or hospital) in Japan by its ID. Typically called after search_facilities. Returns name, address, contact details, location, payment options, and the IDs of healthcare professionals at the facility.',
            inputSchema: {
                facilityId: z.string().describe('The unique ID of the facility (UUID)')
            }
        },
        async ({ facilityId }) => {
            try {
                const facility = await getFacility(facilityId)

                if (!facility) {
                    return {
                        content: [{ type: 'text', text: `No facility found with ID "${facilityId}".` }],
                        isError: true
                    }
                }

                return {
                    content: [{ type: 'text', text: JSON.stringify(facility, null, 2) }]
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error'

                return {
                    content: [{ type: 'text', text: `Failed to get facility: ${message}` }],
                    isError: true
                }
            }
        }
    )
}
