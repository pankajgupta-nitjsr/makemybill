import express from 'express';
import Customer from '../models/Customer.js';

const router = express.Router();

router.get('/', async (_req, res, next) => {
	try {
		const customers = await Customer.find().sort({ createdAt: -1 });
		res.json(customers);
	} catch (error) {
		next(error);
	}
});

router.post('/', async (req, res, next) => {
	try {
		const customer = await Customer.create(req.body);
		res.status(201).json(customer);
	} catch (error) {
		next(error);
	}
});

router.put('/:id', async (req, res, next) => {
	try {
		const updated = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
		res.json(updated);
	} catch (error) {
		next(error);
	}
});

router.delete('/:id', async (req, res, next) => {
	try {
		await Customer.findByIdAndDelete(req.params.id);
		res.status(204).end();
	} catch (error) {
		next(error);
	}
});

export default router;