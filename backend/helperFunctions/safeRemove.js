import fs from 'fs-extra';
import dotenv from 'dotenv';

dotenv.config();

const MAX_RETRIES = process.env.MAX_RETRIES || 5;
const DELAY = process.env.DELAY || 500;

const safeRemove = async (dirPath, retries = MAX_RETRIES, delay = DELAY) => {
  for (let i = 0; i < retries; i++) {
    try {
      await fs.remove(dirPath);
      return;
    } catch (err) {
      if (err.code === 'EBUSY' || err.code === 'ENOTEMPTY' || err.code === 'EPERM') {
        await new Promise(res => setTimeout(res, delay));
      } else {
        throw err;
      }
    }
  }
  throw new Error(`Failed to remove ${dirPath} after ${retries} retries`);
};

export { safeRemove };