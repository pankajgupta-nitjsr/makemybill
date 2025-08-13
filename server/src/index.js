import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import productsRouter from './routes/products.js';
import customersRouter from './routes/customers.js';
import salesRouter from './routes/sales.js';
import analyticsRouter from './routes/analytics.js';
import authRouter from './routes/auth.js';
import { requireAuth } from './middleware/auth.js';
import { seedData } from './utils/seed.js';

dotenv.config();

const app = express();

app.use(cors({
	origin: process.env.CORS_ORIGIN || '*',
}));
app.use(express.json());

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/make-my-bill';
mongoose
	.connect(mongoUri, {
		serverSelectionTimeoutMS: 5000,
	})
	.then(async () => {
		console.log('Connected to MongoDB');
		// Seed sample data
		await seedData();
	})
	.catch((error) => {
		console.error('MongoDB connection error:', error.message);
		process.exit(1);
	});

app.get('/api/health', (_req, res) => {
	res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);

// Protected routes
app.use('/api/products', requireAuth, productsRouter);
app.use('/api/customers', requireAuth, customersRouter);
app.use('/api/sales', requireAuth, salesRouter);
app.use('/api/analytics', requireAuth, analyticsRouter);

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
	console.error(err);
	res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
	console.log(`Server running on http://localhost:${port}`);
});