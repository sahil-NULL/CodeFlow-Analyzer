// const parseRepoURL = (url) => {
//     const cleanedUrl = url.replace(/\/+$/, '');
  
//     const repoName = cleanedUrl.split('/').pop();
  
//     const cloneUrl = cleanedUrl.endsWith('.git') ? cleanedUrl : `${cleanedUrl}.git`;
  
//     return { repoName, cloneUrl };
// };

const parseRepoURL = (repoUrl) => {
    const cleanedUrl = repoUrl.replace(/\/+$/, '');
    const match = repoUrl.match(/github\.com\/([\w-]+)\/([\w.-]+)/);
    if (!match) throw new Error("Invalid GitHub URL");
    const cloneUrl = cleanedUrl.endsWith('.git') ? cleanedUrl : `${cleanedUrl}.git`;
    return { owner: match[1], repoName: match[2], cloneUrl: cloneUrl };
  }

export { parseRepoURL };