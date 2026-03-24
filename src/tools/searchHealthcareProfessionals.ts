import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { gql } from 'graphql-request'
import { gqlClient } from '../graphql.js'

const SEARCH_HEALTHCARE_PROFESSIONALS = gql`
    query SearchHealthcareProfessionals($filters: HealthcareProfessionalSearchFilters!) {
        healthcareProfessionals(filters: $filters) {
            id
            names {
                firstName
                middleName
                lastName
                locale
            }
            spokenLanguages
            degrees
            specialties
            acceptedInsurance
            facilityIds
        }
        healthcareProfessionalsTotalCount(filters: $filters)
    }
`

interface HealthcareProfessionalsResponse {
    healthcareProfessionals: Array<{
        id: string
        names: Array<{
            firstName: string
            middleName: string
            lastName: string
            locale: string
        }>
        spokenLanguages: string[]
        degrees: string[]
        specialties: string[]
        acceptedInsurance: string[]
        facilityIds: string[]
    }>
    healthcareProfessionalsTotalCount: number
}

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
        async ({ limit, offset, spokenLanguages, specialties, degrees, acceptedInsurance }) => {
            try {
                const filters: Record<string, unknown> = {
                    limit,
                    offset
                }

                if (spokenLanguages?.length) { filters.spokenLanguages = spokenLanguages }
                if (specialties?.length) { filters.specialties = specialties }
                if (degrees?.length) { filters.degrees = degrees }
                if (acceptedInsurance?.length) { filters.acceptedInsurance = acceptedInsurance }

                const data = await gqlClient.request<HealthcareProfessionalsResponse>(
                    SEARCH_HEALTHCARE_PROFESSIONALS,
                    { filters }
                )

                return {
                    content: [{
                        type: 'text',
                        text: JSON.stringify({
                            totalCount: data.healthcareProfessionalsTotalCount,
                            results: data.healthcareProfessionals
                        }, null, 2)
                    }]
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
