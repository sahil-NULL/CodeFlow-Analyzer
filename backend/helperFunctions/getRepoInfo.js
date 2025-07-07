import axios from 'axios';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime.js';
import { parseRepoURL } from './parseRepoURL.js';
dayjs.extend(relativeTime);

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const extractRepoMetadata = async (repoUrl) => {
  const { owner, repoName } = parseRepoURL(repoUrl);

  const headers = { Authorization: `Bearer ${GITHUB_TOKEN}` };

  const repoRes = await axios.get(`https://api.github.com/repos/${owner}/${repoName}`, { headers });

  const repoData = repoRes.data;
  console.log(repoData)

  const topicsRes = await axios.get(`https://api.github.com/repos/${owner}/${repoName}/topics`, {
    headers: {
      ...headers,
        Accept: 'application/vnd.github.mercy-preview+json'
    }
  });
  console.log(topicsRes.data)

  const commitRes = await axios.get(`https://api.github.com/repos/${owner}/${repoName}/commits?per_page=1`, {
    headers
  });
  console.log(commitRes.data)

  const tags = topicsRes.data.names || [];

  return {
    name: repoData.name,
    url: repoData.html_url,
    description: repoData.description,
    language: repoData.language,
    stars: repoData.stargazers_count,
    isPrivate: repoData.private,
    lastUpdated: dayjs(repoData.updated_at).fromNow(),
    commitHash: commitRes.data[0].sha,
    tags
  };
}

export { extractRepoMetadata }