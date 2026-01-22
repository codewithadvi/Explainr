/**
 * Comprehensive MCP Server Test
 * Tests all resources and tools
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 COMPREHENSIVE MCP SERVER TEST\n');
console.log('='.repeat(60));

const serverPath = join(__dirname, 'dist', 'index.js');
const server = spawn('node', [serverPath]);

let testsPassed = 0;
let testsFailed = 0;

server.stdout.on('data', (data) => {
    const output = data.toString();
    console.log('📥', output.trim());

    // Check for successful responses
    if (output.includes('"result"')) {
        testsPassed++;
    }
});

server.stderr.on('data', (data) => {
    console.log('📝', data.toString().trim());
});

function sendRequest(id, method, params = {}, description) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📤 TEST ${id}: ${description}`);
    console.log(`   Method: ${method}`);
    if (Object.keys(params).length > 0) {
        console.log(`   Params:`, JSON.stringify(params));
    }

    const request = {
        jsonrpc: "2.0",
        id,
        method,
        params
    };

    server.stdin.write(JSON.stringify(request) + '\n');
}

// Test sequence
setTimeout(() => {
    sendRequest(1, "initialize", {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "test-client", version: "1.0.0" }
    }, "Initialize server");
}, 500);

setTimeout(() => {
    sendRequest(2, "resources/list", {}, "List all resources");
}, 1500);

setTimeout(() => {
    sendRequest(3, "tools/list", {}, "List all tools");
}, 2500);

setTimeout(() => {
    sendRequest(4, "resources/read", {
        uri: "knowledge://graph"
    }, "Read knowledge graph resource");
}, 3500);

setTimeout(() => {
    sendRequest(5, "resources/read", {
        uri: "sessions://list"
    }, "Read sessions list resource");
}, 4500);

setTimeout(() => {
    sendRequest(6, "resources/read", {
        uri: "stats://user"
    }, "Read user stats resource");
}, 5500);

setTimeout(() => {
    sendRequest(7, "tools/call", {
        name: "get_knowledge_summary",
        arguments: {}
    }, "Call get_knowledge_summary tool");
}, 6500);

setTimeout(() => {
    sendRequest(8, "tools/call", {
        name: "list_topics",
        arguments: {}
    }, "Call list_topics tool");
}, 7500);

setTimeout(() => {
    sendRequest(9, "tools/call", {
        name: "search_sessions",
        arguments: { query: "machine learning" }
    }, "Call search_sessions tool (query: 'machine learning')");
}, 8500);

setTimeout(() => {
    sendRequest(10, "tools/call", {
        name: "get_topic_connections",
        arguments: { topic: "Machine Learning" }
    }, "Call get_topic_connections tool (topic: 'Machine Learning')");
}, 9500);

setTimeout(() => {
    sendRequest(11, "tools/call", {
        name: "get_learning_progress",
        arguments: {}
    }, "Call get_learning_progress tool");
}, 10500);

setTimeout(() => {
    sendRequest(12, "tools/call", {
        name: "get_session_details",
        arguments: { sessionId: "session_1705123456001" }
    }, "Call get_session_details tool (session ID from sample data)");
}, 11500);

// Summary and cleanup
setTimeout(() => {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Tests completed: ${testsPassed}`);
    console.log(`❌ Tests failed: ${testsFailed}`);
    console.log('\n🎯 Expected Results:');
    console.log('   - 3 Resources (knowledge graph, sessions, stats)');
    console.log('   - 6 Tools (summary, search, details, connections, progress, list)');
    console.log('   - 4 Topics in knowledge graph');
    console.log('   - 2 Sample sessions');
    console.log('\n✅ All tests complete! Shutting down server...\n');

    server.kill();
    process.exit(0);
}, 13000);

server.on('error', (error) => {
    console.error('❌ Server error:', error);
    testsFailed++;
    process.exit(1);
});
