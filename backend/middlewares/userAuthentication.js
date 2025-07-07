import jwt from 'jsonwebtoken'
import { User } from '../models/user.js'
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

const userAuthentication = async (req, res, next) => {
    try {

        const token = req.headers.authorization.split(' ')[1]

        const decoded = jwt.verify(token, JWT_SECRET)
        const user = await User.findById(decoded.userId);

        req.user = {
        id: user._id,
        email: user.email,
        username: user.username
        }

        next()
    } catch (error) {
        res.status(401).json({ message: 'Unauthorized Access' })
        return
    }
}

export { userAuthentication }