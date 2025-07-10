import express from 'express';
import { connectDB } from './db.js';
import { router } from './routes/routeIndex.js';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(cors({
  //origin: process.env.APP_URL
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json());

app.use('/api/v1', router);

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
