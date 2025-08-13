import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

router.get('/', async (_req, res, next) => {
	try {
		const products = await Product.find().sort({ createdAt: -1 });
		res.json(products);
	} catch (error) {
		next(error);
	}
});

router.get('/low-stock', async (_req, res, next) => {
	try {
		const products = await Product.find({ $expr: { $lte: ['$stock', '$lowStockThreshold'] } }).sort({ stock: 1 });
		res.json(products);
	} catch (error) {
		next(error);
	}
});

router.post('/', async (req, res, next) => {
	try {
		const product = await Product.create(req.body);
		res.status(201).json(product);
	} catch (error) {
		next(error);
	}
});

router.put('/:id', async (req, res, next) => {
	try {
		const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
		res.json(updated);
	} catch (error) {
		next(error);
	}
});

router.delete('/:id', async (req, res, next) => {
	try {
		await Product.findByIdAndDelete(req.params.id);
		res.status(204).end();
	} catch (error) {
		next(error);
	}
});

export default router;