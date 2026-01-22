// Run this in browser console to check and rebuild your knowledge graph from existing sessions

// Check if sessions exist
const sessions = JSON.parse(localStorage.getItem('explainr_sessions') || '[]');
console.log('Found sessions:', sessions.length);
console.log('Session topics:', sessions.map(s => s.topic));

// If sessions exist, rebuild knowledge graph from them
if (sessions.length > 0) {
    const nodes = [];

    sessions.forEach(session => {
        // Check if node already exists
        const existingNode = nodes.find(n => n.topic.toLowerCase() === session.topic.toLowerCase());

        if (existingNode) {
            // Update existing node
            existingNode.mastery = Math.min(100, existingNode.mastery + session.score / 10);
            existingNode.sessions += 1;
            existingNode.lastPracticed = session.startTime;
        } else {
            // Create new node
            nodes.push({
                id: `node_${session.startTime}`,
                topic: session.topic,
                mastery: session.score,
                sessions: 1,
                lastPracticed: session.startTime,
                connections: []
            });
        }
    });

    // Save nodes
    localStorage.setItem('explainr_knowledge', JSON.stringify(nodes));

    console.log('✅ Rebuilt knowledge graph with', nodes.length, 'nodes');
    console.log('Nodes:', nodes.map(n => n.topic));

    // Reload page to see the graph
    location.reload();
} else {
    console.log('❌ No sessions found! You need to complete sessions first.');
}
