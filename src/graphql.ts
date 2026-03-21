import { GraphQLClient } from 'graphql-request'

const GRAPHQL_ENDPOINT = process.env.GRAPHQL_ENDPOINT || 'https://api.findadoc.jp'

export const gqlClient = new GraphQLClient(GRAPHQL_ENDPOINT)
