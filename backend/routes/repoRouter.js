import express from 'express';
import path from 'path';
import { cloneRepo } from '../helperFunctions/cloneRepo.js';
import { generateGraphDataFromClone } from '../helperFunctions/generateGrpahDataFromClone.js';
import { parseRepoURL } from '../helperFunctions/parseRepoURL.js';
import { userAuthentication } from '../middlewares/userAuthentication.js';
import { Repo } from '../models/repo.js';
import { extractRepoMetadata } from '../helperFunctions/getRepoInfo.js';
import { safeRemove } from '../helperFunctions/safeRemove.js';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const router = express.Router();


router.post('/', userAuthentication, async (req, res) => {
  try {
    const { repoURL } = req.body;

    const {owner, repoName, cloneUrl } = parseRepoURL(repoURL);  
    const cloneDir = path.join(process.cwd(), 'clones', repoName);

    const repoInfo = await extractRepoMetadata(repoURL)

    await cloneRepo(cloneUrl, cloneDir)

    const graph = await generateGraphDataFromClone(cloneDir);   

    const newRepo = await Repo.create({
      userId: req.user.id,
      name: repoInfo.name,
      url: repoURL,
      description: repoInfo.description,
      language: repoInfo.language,
      stars: repoInfo.stars,
      isPrivate: repoInfo.isPrivate,
      lastUpdated: repoInfo.lastUpdated,
      tags: repoInfo.tags,
      graph: graph,
      commitHash: repoInfo.commitHash,
    })


    res.status(200).json({ repo: newRepo, message: 'Graph generated successfully' });

    safeRemove(cloneDir)
      .then(() => console.log(`Cleaned up ${cloneDir}`))
      .catch((err) => console.error(`Cleanup failed: ${err.message}`));

  } catch (error) {
    res.status(500).json({ message: 'Error generating graph', error: error.message});
  }
});



router.get('/allRepos', userAuthentication, async (req, res) => {
  try {
    const repos = await Repo.find({ userId: req.user.id }).select('-graph').sort({ createdAt: -1 })
    res.status(200).json({ repos })
  } catch (error) {
    res.status(500).json({ message: 'Error reading repo names' });
  }
})


router.put('/getGraph', userAuthentication, async (req, res) => {
  try {
    const repo = await Repo.findById(req.query.repoId).select(['url', 'commitHash', 'graph'])

    const {owner, repoName, cloneUrl } = parseRepoURL(repo.url);  

    const commitRes = await axios.get(`https://api.github.com/repos/${owner}/${repoName}/commits?per_page=1`, {
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`
      }
    });

    if (commitRes.data[0].sha === repo.commitHash) {
      return res.status(200).json({ graph: repo.graph, message: 'No new commits' });
      //  implement redis caching to get graphs from cache for un updated repo
    }

    const cloneDir = path.join(process.cwd(), 'clones', repoName);

    await cloneRepo(cloneUrl, cloneDir)
    const graph = await generateGraphDataFromClone(cloneDir);

    const updatedRepo = await Repo.findByIdAndUpdate(req.query.repoId, { graph: graph }, { new: true })

    res.status(200).json({ graph: updatedRepo.graph, message: 'Graph updated successfully' });

    safeRemove(cloneDir)
      .then(() => console.log(`Cleaned up ${cloneDir}`))
      .catch((err) => console.error(`Cleanup failed: ${err.message}`));
  } catch (error) {
    res.status(500).json({ message: 'Error updating repo' });
  }
})


router.delete('/', userAuthentication, async (req, res) => {
  try {
    await Repo.findByIdAndDelete(req.query.repoId)
    res.status(200).json({ message: 'Repo deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Error deleting repo' });
  }
})

export { router };