import { gql } from 'graphql-request'
import type { HealthcareProfessional as GqlHealthcareProfessional } from '../generated/gqlTypes.js'
import { gqlClient } from '../graphql.js'

// Shared GraphQL logic for healthcare professionals. Both the MCP tools
// (src/tools/*) and the REST routes (src/rest.ts) call these functions so the
// queries live in exactly one place.

const PROFESSIONAL_FIELDS = gql`
    fragment ProfessionalFields on HealthcareProfessional {
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
        additionalInfoForPatients
    }
`

const SEARCH_HEALTHCARE_PROFESSIONALS = gql`
    query SearchHealthcareProfessionals($filters: HealthcareProfessionalSearchFilters!) {
        healthcareProfessionals(filters: $filters) {
            ...ProfessionalFields
        }
        healthcareProfessionalsTotalCount(filters: $filters)
    }
    ${PROFESSIONAL_FIELDS}
`

const GET_HEALTHCARE_PROFESSIONAL = gql`
    query GetHealthcareProfessional($id: ID!) {
        healthcareProfessional(id: $id) {
            ...ProfessionalFields
        }
    }
    ${PROFESSIONAL_FIELDS}
`

// Shape returned by the queries above: the subset of the generated
// `HealthcareProfessional` type that our selection set actually requests.
export type HealthcareProfessional = Pick<
    GqlHealthcareProfessional,
    | 'id'
    | 'names'
    | 'spokenLanguages'
    | 'degrees'
    | 'specialties'
    | 'acceptedInsurance'
    | 'facilityIds'
    | 'additionalInfoForPatients'
>

export interface SearchProfessionalsParams {
    limit?: number
    offset?: number
    spokenLanguages?: string[]
    specialties?: string[]
    degrees?: string[]
    acceptedInsurance?: string[]
}

export interface SearchProfessionalsResult {
    totalCount: number
    results: HealthcareProfessional[]
}

export async function searchHealthcareProfessionals(
    params: SearchProfessionalsParams
): Promise<SearchProfessionalsResult> {
    const filters: Record<string, unknown> = {
        limit: params.limit ?? 10,
        offset: params.offset ?? 0
    }

    if (params.spokenLanguages?.length) { filters.spokenLanguages = params.spokenLanguages }
    if (params.specialties?.length) { filters.specialties = params.specialties }
    if (params.degrees?.length) { filters.degrees = params.degrees }
    if (params.acceptedInsurance?.length) { filters.acceptedInsurance = params.acceptedInsurance }

    const data = await gqlClient.request<{
        healthcareProfessionals: HealthcareProfessional[]
        healthcareProfessionalsTotalCount: number
    }>(SEARCH_HEALTHCARE_PROFESSIONALS, { filters })

    return {
        totalCount: data.healthcareProfessionalsTotalCount,
        results: data.healthcareProfessionals
    }
}

export async function getHealthcareProfessional(id: string): Promise<HealthcareProfessional | null> {
    const data = await gqlClient.request<{ healthcareProfessional: HealthcareProfessional | null }>(
        GET_HEALTHCARE_PROFESSIONAL,
        { id }
    )

    return data.healthcareProfessional
}
