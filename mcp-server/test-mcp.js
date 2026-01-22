/**
 * Simple test script to verify MCP server functionality
 * Run with: node test-mcp.js
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 Testing Feynman Mirror MCP Server\n');

// Start the MCP server
const serverPath = join(__dirname, 'dist', 'index.js');
const server = spawn('node', [serverPath]);

let output = '';

server.stdout.on('data', (data) => {
    output += data.toString();
    console.log('📥 Server output:', data.toString());
});

server.stderr.on('data', (data) => {
    console.log('📝 Server log:', data.toString());
});

// Send initialize request
setTimeout(() => {
    console.log('\n📤 Sending initialize request...\n');
    const initRequest = {
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
            protocolVersion: "2024-11-05",
            capabilities: {},
            clientInfo: {
                name: "test-client",
                version: "1.0.0"
            }
        }
    };

    server.stdin.write(JSON.stringify(initRequest) + '\n');
}, 1000);

// Send list resources request
setTimeout(() => {
    console.log('\n📤 Sending resources/list request...\n');
    const listResourcesRequest = {
        jsonrpc: "2.0",
        id: 2,
        method: "resources/list",
        params: {}
    };

    server.stdin.write(JSON.stringify(listResourcesRequest) + '\n');
}, 2000);

// Send list tools request
setTimeout(() => {
    console.log('\n📤 Sending tools/list request...\n');
    const listToolsRequest = {
        jsonrpc: "2.0",
        id: 3,
        method: "tools/list",
        params: {}
    };

    server.stdin.write(JSON.stringify(listToolsRequest) + '\n');
}, 3000);

// Call get_knowledge_summary tool
setTimeout(() => {
    console.log('\n📤 Calling get_knowledge_summary tool...\n');
    const toolCallRequest = {
        jsonrpc: "2.0",
        id: 4,
        method: "tools/call",
        params: {
            name: "get_knowledge_summary",
            arguments: {}
        }
    };

    server.stdin.write(JSON.stringify(toolCallRequest) + '\n');
}, 4000);

// Cleanup after 6 seconds
setTimeout(() => {
    console.log('\n\n✅ Test complete! Shutting down server...\n');
    server.kill();
    process.exit(0);
}, 6000);

server.on('error', (error) => {
    console.error('❌ Server error:', error);
    process.exit(1);
});
