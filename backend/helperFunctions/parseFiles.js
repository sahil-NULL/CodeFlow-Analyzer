import fsExtra from 'fs-extra';
import Parser from 'tree-sitter';
import JavaScript  from 'tree-sitter-javascript';

const parseFiles = (fileList) => {
    const parser = new Parser();
    parser.setLanguage(JavaScript);
    const parsedTrees = {};

    for(const file of fileList) {
        try {
            const sourceCode = fsExtra.readFileSync(file, 'utf8');
        
            if (!sourceCode || typeof sourceCode !== 'string') continue;
        
            const tree = parser.parse(sourceCode);
            parsedTrees[file] = tree;
        } catch (err) {
            console.error(`Error parsing ${file}:`, err.message);
        }
    }

    return parsedTrees;
}

export { parseFiles };