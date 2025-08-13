import express from 'express';
import Sale from '../models/Sale.js';

const router = express.Router();

router.get('/kpis', async (_req, res, next) => {
	try {
		const now = new Date();
		const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
		const totalRevenueAgg = await Sale.aggregate([
			{ $group: { _id: null, revenue: { $sum: '$total' }, count: { $sum: 1 } } },
		]);
		const monthAgg = await Sale.aggregate([
			{ $match: { createdAt: { $gte: startOfMonth } } },
			{ $group: { _id: null, revenue: { $sum: '$total' }, count: { $sum: 1 } } },
		]);
		const totalRevenue = totalRevenueAgg[0]?.revenue || 0;
		const totalSales = totalRevenueAgg[0]?.count || 0;
		const monthRevenue = monthAgg[0]?.revenue || 0;
		const monthSales = monthAgg[0]?.count || 0;
		res.json({ totalRevenue, totalSales, monthRevenue, monthSales });
	} catch (error) {
		next(error);
	}
});

router.get('/sales-by-day', async (_req, res, next) => {
	try {
		const start = new Date();
		start.setDate(start.getDate() - 14);
		start.setHours(0, 0, 0, 0);
		const series = await Sale.aggregate([
			{ $match: { createdAt: { $gte: start } } },
			{ $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$total' } } },
			{ $sort: { _id: 1 } },
		]);
		res.json(series.map((d) => ({ date: d._id, revenue: d.revenue })));
	} catch (error) {
		next(error);
	}
});

router.get('/top-products', async (_req, res, next) => {
	try {
		const top = await Sale.aggregate([
			{ $unwind: '$items' },
			{ $group: { _id: '$items.name', qty: { $sum: '$items.quantity' }, revenue: { $sum: '$items.subtotal' } } },
			{ $sort: { qty: -1 } },
			{ $limit: 5 },
		]);
		res.json(top.map((t) => ({ name: t._id, quantity: t.qty, revenue: t.revenue })));
	} catch (error) {
		next(error);
	}
});

export default router;