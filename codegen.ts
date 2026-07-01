import type { CodegenConfig } from '@graphql-codegen/cli'

// Generates TypeScript types from the live Find a Doc GraphQL schema so the
// core modules never hand-maintain the schema shape. Mirrors the codegen setup
// in findadoc-web. Run with `yarn generate`; a weekly GitHub Action
// (.github/workflows/generate-gql-types.yml) reruns it and opens a PR on drift.
const endpoint = process.env.GRAPHQL_ENDPOINT || 'https://api.findadoc.jp'

const config: CodegenConfig = {
    overwrite: true,
    schema: endpoint,
    generates: {
        './src/generated/gqlTypes.ts': {
            plugins: ['typescript'],
            config: {
                useTypeImports: true
            }
        }
    }
}

export default config
