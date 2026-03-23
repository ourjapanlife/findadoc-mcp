import listLanguages from './tools/listLanguages';
import { Tool } from './types';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { createServer } from './server.js'

const tools: Tool[] = [
  listLanguages
];

async function main() {
    const server = createServer()
    const transport = new StdioServerTransport()

    await server.connect(transport)
    export default tools;
}

main()