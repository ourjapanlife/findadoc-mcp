import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { searchHealthcareProfessionals } from '../core/professionals.js'

export function registerSearchHealthcareProfessionals(server: McpServer): void {
    server.registerTool(
        'search_healthcare_professionals',
        {
            description: 'Search for healthcare professionals in Japan. Returns names, specialties, spoken languages, degrees, accepted insurance, and associated facility IDs.',
            inputSchema: {
                limit: z.number().min(1).max(50).default(10).describe('Number of results to return (1-50)'),
                offset: z.number().min(0).default(0).describe('Number of results to skip for pagination'),
                spokenLanguages: z.array(z.string()).optional().describe('Filter by spoken languages (BCP 47 format, e.g. "en_US", "ja_JP")'),
                specialties: z.array(z.string()).optional().describe('Filter by medical specialties (e.g. "GENERAL_PRACTICE", "PEDIATRICS", "INTERNAL_MEDICINE")'),
                degrees: z.array(z.string()).optional().describe('Filter by degrees (e.g. "MD", "DO", "PhD")'),
                acceptedInsurance: z.array(z.string()).optional().describe('Filter by accepted insurance types (e.g. "JAPANESE_HEALTH_INSURANCE", "INTERNATIONAL_HEALTH_INSURANCE")')
            }
        },
        async params => {
            try {
                const data = await searchHealthcareProfessionals(params)

                return {
                    content: [{ type: 'text', text: JSON.stringify(data, null, 2) }]
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error'

                return {
                    content: [{ type: 'text', text: `Failed to search healthcare professionals: ${message}` }],
                    isError: true
                }
            }
        }
    )
}
