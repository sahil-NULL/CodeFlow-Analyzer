import express from 'express';
import { router as userRouter } from './userRouter.js';
import { router as repoRouter } from './repoRouter.js';

const router = express.Router();

router.use('/user', userRouter);
router.use('/repo', repoRouter);

export { router }