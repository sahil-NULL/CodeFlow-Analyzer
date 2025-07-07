import fsExtra from 'fs-extra';
import path from 'path';

const extensions = ['.js', '.ts', '.jsx', '.tsx'];
const getSourceFiles = async (dir) => {
    const files = [];
    for(const file of await fsExtra.readdir(dir)) {
      const filePath = path.join(dir, file);
      const stats = await fsExtra.stat(filePath);
      if(stats.isDirectory() && file !== 'node_modules' && !file.startsWith('.') ) {
        files.push(...await getSourceFiles(filePath));
      } else if(stats.isFile() && extensions.some(ext => file.endsWith(ext))) {
        files.push(filePath);
      }
    }
    return files;
}

export { getSourceFiles };