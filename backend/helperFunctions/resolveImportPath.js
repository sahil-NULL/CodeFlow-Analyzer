import fs from 'fs';
import path from 'path';

const resolveImportPath = (file, importPath) => {
    if (!importPath.startsWith('.')) return null;
  
    const full = path.resolve(path.dirname(file), importPath);
    const extensions = ['.js', '.ts', '.jsx', '.tsx', '.json'];
  
    for (const ext of extensions) {
      if (fs.existsSync(full + ext)) return full + ext;
    }
  
    for (const ext of extensions) {
      const indexPath = path.join(full, 'index' + ext);
      if (fs.existsSync(indexPath)) return indexPath;
    }
  
    if (fs.existsSync(full)) return full;
  
    return null;
}

export { resolveImportPath };