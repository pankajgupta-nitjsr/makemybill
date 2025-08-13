import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

router.post('/register', async (req, res, next) => {
	try {
		const { name, email, password } = req.body;
		if (!name || !email || !password) return res.status(400).json({ message: 'All fields are required' });
		const existing = await User.findOne({ email });
		if (existing) return res.status(400).json({ message: 'Email already in use' });
		const passwordHash = await bcrypt.hash(password, 10);
		const user = await User.create({ name, email, passwordHash, role: 'admin' });
		res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role });
	} catch (error) {
		next(error);
	}
});

router.post('/login', async (req, res, next) => {
	try {
		const { email, password } = req.body;
		const user = await User.findOne({ email });
		if (!user) return res.status(400).json({ message: 'Invalid credentials' });
		const valid = await bcrypt.compare(password, user.passwordHash);
		if (!valid) return res.status(400).json({ message: 'Invalid credentials' });
		const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
		res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
	} catch (error) {
		next(error);
	}
});

export default router;