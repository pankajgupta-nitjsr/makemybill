import express from 'express';
import Sale from '../models/Sale.js';
import Product from '../models/Product.js';
import Customer from '../models/Customer.js';
import { generateInvoicePDF } from '../utils/pdf.js';

const router = express.Router();

// Create a new sale
router.post('/', async (req, res, next) => {
	try {
		const { items, customer, total, paymentMethod } = req.body;
		
		console.log('Received sale data:', { items, customer, total, paymentMethod });

		// Validate items
		if (!items || items.length === 0) {
			return res.status(400).json({ message: 'Items are required' });
		}

		// Check stock availability and update stock
		for (const item of items) {
			const product = await Product.findById(item.product);
			if (!product) {
				return res.status(400).json({ message: `Product ${item.product} not found` });
			}
			if (product.stock < item.quantity) {
				return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
			}
			
			// Update stock
			product.stock -= item.quantity;
			await product.save();
		}

		// Generate invoice number
		const lastSale = await Sale.findOne().sort({ createdAt: -1 });
		const invoiceNumber = lastSale 
			? `INV-${String(parseInt(lastSale.invoiceNumber.split('-')[1]) + 1).padStart(6, '0')}`
			: 'INV-000001';

		console.log('Creating sale with invoice number:', invoiceNumber);

		// Create sale
		const sale = await Sale.create({
			invoiceNumber,
			items: items.map(item => ({
				product: item.product,
				quantity: item.quantity,
				price: item.price
			})),
			customer,
			total,
			paymentMethod: paymentMethod || 'cash'
		});

		console.log('Sale created successfully:', sale._id);

		// Populate customer and product details
		await sale.populate('customer');
		await sale.populate('items.product');

		res.status(201).json(sale);
	} catch (error) {
		console.error('Error creating sale:', error);
		next(error);
	}
});

// Get all sales
router.get('/', async (req, res, next) => {
	try {
		const sales = await Sale.find()
			.populate('customer')
			.populate({
				path: 'items.product',
				select: 'name sku price'
			})
			.sort({ createdAt: -1 });
		res.json(sales);
	} catch (error) {
		next(error);
	}
});

// Get invoice PDF
router.get('/:id/invoice', async (req, res, next) => {
	try {
		console.log('Invoice requested for sale ID:', req.params.id);
		
		const sale = await Sale.findById(req.params.id)
			.populate('customer')
			.populate({ path: 'items.product', select: 'name sku price' });
		
		if (!sale) {
			console.log('Sale not found');
			return res.status(404).json({ message: 'Sale not found' });
		}
		
		console.log('Sale found, generating PDF for:', sale.invoiceNumber);
		console.log('Sale data:', JSON.stringify(sale, null, 2));
		
		// Set response headers
		res.setHeader('Content-Type', 'application/pdf');
		res.setHeader('Content-Disposition', `attachment; filename="invoice-${sale.invoiceNumber}.pdf"`);
		
		// Generate and pipe PDF
		const doc = generateInvoicePDF(sale);
		doc.pipe(res);
		
		console.log('PDF generation started');
		
		// Handle PDF generation completion
		doc.on('end', () => {
			console.log('PDF generation completed and sent to client');
		});
		
		doc.on('error', (err) => {
			console.error('PDF generation error:', err);
			// Don't send error response here as headers are already sent
		});
		
	} catch (error) {
		console.error('Error generating invoice PDF:', error);
		next(error);
	}
});

// Test PDF generation
router.get('/test-pdf', async (req, res, next) => {
	try {
		console.log('Testing PDF generation...');
		
		// Create a test sale object
		const testSale = {
			invoiceNumber: 'TEST-001',
			createdAt: new Date(),
			customer: {
				name: 'Test Customer',
				email: 'test@example.com',
				phone: '123-456-7890',
				address: '123 Test St, Test City'
			},
			items: [
				{
					product: {
						name: 'Test Product 1',
						sku: 'TP001',
						price: 10.99
					},
					quantity: 2,
					price: 10.99
				},
				{
					product: {
						name: 'Test Product 2',
						sku: 'TP002',
						price: 15.50
					},
					quantity: 1,
					price: 15.50
				}
			],
			total: 37.48,
			paymentMethod: 'cash'
		};

		// Set response headers
		res.setHeader('Content-Type', 'application/pdf');
		res.setHeader('Content-Disposition', 'inline; filename="test-invoice.pdf"');

		// Generate and pipe PDF
		const doc = generateInvoicePDF(testSale);
		doc.pipe(res);
		
		console.log('Test PDF generation completed');
	} catch (error) {
		console.error('Error in test PDF generation:', error);
		next(error);
	}
});

export default router;