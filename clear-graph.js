// Clear all fake knowledge graph data and start fresh
if (typeof window !== 'undefined') {
    // Clear knowledge graph
    localStorage.removeItem('explainr_knowledge');
    localStorage.removeItem('explainr_knowledge_relationships');

    console.log('✅ Cleared fake knowledge graph data');
    console.log('Now complete a real session to populate the graph with YOUR topics only!');
}
