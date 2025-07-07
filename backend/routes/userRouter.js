import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User } from '../models/user.js';
import { userAuthentication } from '../middlewares/userAuthentication.js';  
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS) || 10;

const router = express.Router();


router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

  if(!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const user = await User.findOne({ email });
  if(user) {
    return res.status(400).json({ message: 'Email already taken' });
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const newUser = await User.create({ username, email, password: hashedPassword });
  const token = jwt.sign({ userId: newUser._id }, JWT_SECRET);

  res.status(201).json({ 
      message: 'User created successfully', 
      user: newUser, 
      token: token
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
  
});


router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

  if(!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if(!isPasswordValid) {
    return res.status(401).json({ message: 'Incorrect password' });
  }

  const token = jwt.sign({ userId: user._id }, JWT_SECRET);

  res.status(200).json({ 
    message: 'User signed in successfully', 
    user: user, 
    token: token 
  });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});


router.get('/me', userAuthentication, async (req, res) => {
  res.status(200).json({ user: req.user });
});

export { router };  