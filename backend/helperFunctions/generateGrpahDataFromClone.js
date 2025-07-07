import { getSourceFiles } from './getSourceFiles.js';
import { parseFiles } from './parseFiles.js';
import { analyzeFiles } from './analyzeFiles.js';
import { generateGraphData } from './generateGraphData.js';

const generateGraphDataFromClone = async (cloneDir) => {
    
    const fileList = await getSourceFiles(cloneDir);
    const parsedTrees = parseFiles(fileList);
    const allResults = analyzeFiles(parsedTrees);
    const graph = generateGraphData(allResults);
    return graph
}

export { generateGraphDataFromClone };