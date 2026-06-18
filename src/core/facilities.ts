import { gql } from 'graphql-request'
import { gqlClient } from '../graphql.js'

// Shared GraphQL logic for facilities. Used by both the MCP tools and the REST
// routes so the queries are defined once.
//
// NOTE: the upstream `FacilitySearchFilters` does NOT support filtering by
// location, prefecture, spoken language, specialty, or "accepting new patients".
// See findadoc-server#999. Until that lands, search is limited to name and
// associated-professional filters.

const SEARCH_FACILITIES = gql`
    query SearchFacilities($filters: FacilitySearchFilters!) {
        facilities(filters: $filters) {
            id
            nameEn
            nameJa
            contact {
                phone
                website
                address {
                    postalCode
                    prefectureEn
                    cityEn
                    addressLine1En
                    addressLine2En
                }
            }
            healthcareProfessionalIds
        }
        facilitiesTotalCount(filters: $filters)
    }
`

const GET_FACILITY = gql`
    query GetFacility($id: ID!) {
        facility(id: $id) {
            id
            nameEn
            nameJa
            contact {
                phone
                email
                website
                googleMapsUrl
                address {
                    postalCode
                    prefectureEn
                    cityEn
                    addressLine1En
                    addressLine2En
                    prefectureJa
                    cityJa
                    addressLine1Ja
                    addressLine2Ja
                }
            }
            mapLatitude
            mapLongitude
            healthcareProfessionalIds
            paymentOptions {
                paymentType
                paymentBrands
            }
        }
    }
`

export interface FacilitySummary {
    id: string
    nameEn: string
    nameJa: string
    contact: {
        phone: string
        website: string | null
        address: Record<string, string | null>
    }
    healthcareProfessionalIds: string[]
}

export interface Facility {
    id: string
    nameEn: string
    nameJa: string
    contact: {
        phone: string
        email: string | null
        website: string | null
        googleMapsUrl: string
        address: Record<string, string | null>
    }
    mapLatitude: number
    mapLongitude: number
    healthcareProfessionalIds: string[]
    paymentOptions: Array<{
        paymentType: string
        paymentBrands: string[] | null
    }>
}

export interface SearchFacilitiesParams {
    limit?: number
    offset?: number
    nameEn?: string
    nameJa?: string
    healthcareProfessionalName?: string
}

export interface SearchFacilitiesResult {
    totalCount: number
    results: FacilitySummary[]
}

export async function searchFacilities(params: SearchFacilitiesParams): Promise<SearchFacilitiesResult> {
    const filters: Record<string, unknown> = {
        limit: params.limit ?? 10,
        offset: params.offset ?? 0
    }

    if (params.nameEn) { filters.nameEn = params.nameEn }
    if (params.nameJa) { filters.nameJa = params.nameJa }
    if (params.healthcareProfessionalName) { filters.healthcareProfessionalName = params.healthcareProfessionalName }

    const data = await gqlClient.request<{
        facilities: FacilitySummary[]
        facilitiesTotalCount: number
    }>(SEARCH_FACILITIES, { filters })

    return {
        totalCount: data.facilitiesTotalCount,
        results: data.facilities
    }
}

export async function getFacility(id: string): Promise<Facility | null> {
    const data = await gqlClient.request<{ facility: Facility | null }>(GET_FACILITY, { id })

    return data.facility
}
