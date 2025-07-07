import fsExtra from 'fs-extra';
import simpleGit from 'simple-git';

const git = simpleGit();

const cloneRepo = async (repoURL, cloneDir) => {
    try {
      console.log(cloneDir);
      if (await fsExtra.pathExists(cloneDir)) {
        console.log('Deleting existing folder...');
        await fsExtra.remove(cloneDir); // safer and retries automatically
      }
  
      console.log('Cloning...');
      await git.clone(repoURL, cloneDir, ['--depth=1']);
      console.log('Done!');
    } catch (err) {
      console.error('Error:', err.message);
    }
}

export { cloneRepo };