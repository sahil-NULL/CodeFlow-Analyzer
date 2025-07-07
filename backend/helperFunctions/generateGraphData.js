
const generateGraphData = (allResults) => {
    const graph = {
        nodes: new Map(),
        edges: []
    };
      
    for (const [file, analysis] of Object.entries(allResults)) {
    graph.nodes.set(file, analysis.type);
    
    const addEdges = (deps, type) => {
        for (const dep of deps) {
        const target = dep.resolved || dep.module; // resolved for internal, module for external
        graph.nodes.set(target, type);
        graph.edges.push({ from: file, to: target });
        }
    };
    
    addEdges(analysis.imports.internal, 'internal');
    addEdges(analysis.imports.external, 'external');
    addEdges(analysis.requires.internal, 'internal');
    addEdges(analysis.requires.external, 'external');
    }
      
    const uiGraph = {
    nodes: Array.from(graph.nodes).map(([id, type]) => ({
        id,
        type
    })),
    edges: graph.edges.map(edge => ({
        source: edge.from,
        target: edge.to
    }))
    };

    return uiGraph;
}

export { generateGraphData };