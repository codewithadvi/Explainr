import { getKnowledgeSummary, getKnowledgeNodes, getDataDirectory } from './dist/storage.js';

console.log('📂 Data Directory:', getDataDirectory());
console.log('\n📊 Knowledge Nodes:', getKnowledgeNodes().length);
console.log('\n📈 Knowledge Summary:');
console.log(JSON.stringify(getKnowledgeSummary(), null, 2));
