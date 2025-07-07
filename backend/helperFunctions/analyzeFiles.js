import path from 'path';
import { resolveImportPath } from './resolveImportPath.js';

const isInternal = (mod) => mod.startsWith('.') || mod.startsWith('/');

const analyzeFile = (file, tree) => {
    const root = tree.rootNode;
    const type = path.isAbsolute(file)? 'internal' : 'external';
    //console.log(type)
    const results = {
      type: type,
      imports: {
        internal: [],
        external: [],
      },
      requires: {
        internal: [],
        external: [],
      },
      exports: [],
    };
  
    // -- Imports --
    const importNodes = root.descendantsOfType('import_statement');
    for (const node of importNodes) {
      const sourceNode = node.namedChildren.find((n) => n.type === 'string');
      const raw = sourceNode?.text.replace(/['"]/g, '');
      if (!raw) continue;
  
      const resolved = isInternal(raw) ? resolveImportPath(file, raw) : null;
      const target = isInternal(raw) ? results.imports.internal : results.imports.external;
  
      //console.log(`Resolving "${raw}" from "${file}" → ${resolved}`);
  
      target.push({
        module: raw,
        resolved: resolved,
        location: node.startPosition
      });
    }
  
    // -- Requires --
    const callExpressions = root.descendantsOfType('call_expression');
    for (const node of callExpressions) {
      const callee = node.child(0); // should be 'require'
      const argsNode = node.child(1); // arguments node (can have multiple children)
    
      if (
        callee?.type === 'identifier' &&
        callee.text === 'require' &&
        argsNode?.type === 'arguments' &&
        argsNode.namedChildCount === 1
      ) {
        const arg = argsNode.namedChild(0); // typically a string literal
    
        if (arg?.type === 'string') {
          const raw = arg.text.replace(/['"]/g, '');
          const resolved = isInternal(raw) ? resolveImportPath(file, raw) : null;
  
          const target = isInternal(raw) ? results.requires.internal : results.requires.external;
          target.push({
            module: raw,
            resolved: resolved,
            location: node.startPosition
          });
        }
      }
    }
  
    // -- Exports --
    const exportNodes = root.descendantsOfType([
      'export_statement',
      'export_clause',
      'export_default_declaration',
      'export_named_declaration'
    ]);
    for (const node of exportNodes) {
      results.exports.push({
        code: node.text,
        location: node.startPosition
      });
    }
  
    const assignmentNodes = root.descendantsOfType('assignment_expression');
    for (const node of assignmentNodes) {
      const left = node.child(0); // left-hand side of the assignment
  
      if (
        left.type === 'member_expression' &&
        (left.text.startsWith('exports.') || left.text === 'module.exports')
      ) {
        results.exports.push({
          code: node.text,
          location: node.startPosition
        });
      }
    }
  
    // console.log(`📁 ${file}`);
    // console.log(JSON.stringify(results, null, 2));
    return results;
}

const analyzeFiles = (parsedTrees) => {
    const allResults = {};
    for(const file in parsedTrees) {
        const analysis = analyzeFile(file, parsedTrees[file]);
        allResults[file] = analysis;
    }
    return allResults;
}

export { analyzeFiles };