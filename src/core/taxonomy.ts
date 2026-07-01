import { gql } from 'graphql-request'
import { gqlClient } from '../graphql.js'

// Find a Doc has no dedicated query for the lists of specialties or languages —
// they are the `Specialty` and `Locale` GraphQL enums. We introspect the enums
// so the lists stay in sync with the upstream schema. See findadoc-server#1001.

const LIST_ENUM = gql`
    query ListEnum($name: String!) {
        __type(name: $name) {
            enumValues {
                name
            }
        }
    }
`

interface EnumResponse {
    __type: {
        enumValues: Array<{ name: string }>
    } | null
}

async function fetchEnumValues(name: string): Promise<string[]> {
    const data = await gqlClient.request<EnumResponse>(LIST_ENUM, { name })

    // eslint-disable-next-line no-underscore-dangle -- `__type` is the GraphQL introspection field
    return data.__type?.enumValues.map(v => v.name) ?? []
}

export interface SpecialtiesResult {
    count: number
    specialties: string[]
}

export interface Language {
    code: string
    label: string
}

export interface LanguagesResult {
    count: number
    languages: Language[]
}

// Map a Locale code (e.g. "en_US") to a human-readable label using the
// runtime's Intl data, falling back to the raw code if it can't be resolved.
function describeLocale(code: string): string {
    if (code === 'und') { return 'Undetermined' }

    const [language, region] = code.split('_')

    try {
        const languageName = new Intl.DisplayNames(['en'], { type: 'language' }).of(language)
        const regionName = region
            ? new Intl.DisplayNames(['en'], { type: 'region' }).of(region)
            : undefined

        if (languageName && regionName) { return `${languageName} (${regionName})` }

        return languageName ?? code
    } catch {
        return code
    }
}

export async function listSpecialties(): Promise<SpecialtiesResult> {
    const specialties = await fetchEnumValues('Specialty')

    return { count: specialties.length, specialties }
}

export async function listLanguages(): Promise<LanguagesResult> {
    const codes = await fetchEnumValues('Locale')
    const languages = codes.map(code => ({ code, label: describeLocale(code) }))

    return { count: languages.length, languages }
}
