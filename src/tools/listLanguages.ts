import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { listLanguages } from '../core/taxonomy.js'

export function registerListLanguages(server: McpServer): void {
    server.registerTool(
        'list_languages',
        {
            description: 'List all spoken languages available in Find a Doc. Use this to discover valid values for the `spokenLanguages` filter on search_healthcare_professionals. Each entry has a `code` (e.g. "en_US") to pass to the filter and a human-readable `label`.'
        },
        async () => {
            try {
                const data = await listLanguages()

                return {
                    content: [{ type: 'text', text: JSON.stringify(data, null, 2) }]
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error'

                return {
                    content: [{ type: 'text', text: `Failed to list languages: ${message}` }],
                    isError: true
                }
            }
        }
    )
}
