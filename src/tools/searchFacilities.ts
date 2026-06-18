import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { searchFacilities } from '../core/facilities.js'

export function registerSearchFacilities(server: McpServer): void {
    server.registerTool(
        'search_facilities',
        {
            description: 'Search for healthcare facilities (clinics and hospitals) in Japan. Returns name, address, phone, website, and the IDs of healthcare professionals at each facility. Note: the upstream API only supports filtering by facility name or healthcare professional name; to find facilities by language or specialty, use search_healthcare_professionals and look up facilities by their facilityIds.',
            inputSchema: {
                limit: z.number().min(1).max(50).default(10).describe('Number of results to return (1-50)'),
                offset: z.number().min(0).default(0).describe('Number of results to skip for pagination'),
                nameEn: z.string().optional().describe('Filter by the English facility name (partial match)'),
                nameJa: z.string().optional().describe('Filter by the Japanese facility name (partial match)'),
                healthcareProfessionalName: z.string().optional().describe('Filter to facilities that have a healthcare professional matching this name')
            }
        },
        async params => {
            try {
                const data = await searchFacilities(params)

                return {
                    content: [{ type: 'text', text: JSON.stringify(data, null, 2) }]
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error'

                return {
                    content: [{ type: 'text', text: `Failed to search facilities: ${message}` }],
                    isError: true
                }
            }
        }
    )
}
