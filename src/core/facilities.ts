import { gql } from 'graphql-request'
import type {
    Contact,
    Facility as GqlFacility,
    PhysicalAddress
} from '../generated/gqlTypes.js'
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

// Shapes returned by the queries above: the subsets of the generated `Facility`
// type that each selection set actually requests. Field names and value types
// stay in sync with the schema via `yarn generate`.
export type FacilitySummary = Pick<GqlFacility, 'id' | 'nameEn' | 'nameJa' | 'healthcareProfessionalIds'> & {
    contact: Pick<Contact, 'phone' | 'website'> & {
        address: Pick<PhysicalAddress, 'postalCode' | 'prefectureEn' | 'cityEn' | 'addressLine1En' | 'addressLine2En'>
    }
}

export type Facility = Pick<
    GqlFacility,
    | 'id'
    | 'nameEn'
    | 'nameJa'
    | 'contact'
    | 'mapLatitude'
    | 'mapLongitude'
    | 'healthcareProfessionalIds'
    | 'paymentOptions'
>

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
