import Product from '../models/Product.js';
import Customer from '../models/Customer.js';

export async function seedData() {
	try {
		// Check if data already exists
		const productCount = await Product.countDocuments();
		const customerCount = await Customer.countDocuments();
		
		if (productCount > 0 && customerCount > 0) {
			console.log('Database already seeded, skipping...');
			return;
		}

		// Sample products
		const products = [
			{
				name: 'Laptop Dell XPS 13',
				sku: 'LAP-DELL-XPS13',
				price: 89999.00,
				stock: 15,
				lowStockThreshold: 3
			},
			{
				name: 'iPhone 15 Pro',
				sku: 'PHN-IPH-15PRO',
				price: 129999.00,
				stock: 8,
				lowStockThreshold: 2
			},
			{
				name: 'Samsung 4K TV 55"',
				sku: 'TV-SAM-4K55',
				price: 65999.00,
				stock: 12,
				lowStockThreshold: 4
			},
			{
				name: 'Wireless Headphones Sony',
				sku: 'AUD-SON-WH1000',
				price: 24999.00,
				stock: 25,
				lowStockThreshold: 5
			},
			{
				name: 'Gaming Mouse Logitech',
				sku: 'ACC-LOG-G502',
				price: 3999.00,
				stock: 2,
				lowStockThreshold: 10
			},
			{
				name: 'Mechanical Keyboard',
				sku: 'ACC-MEC-KB87',
				price: 5999.00,
				stock: 18,
				lowStockThreshold: 5
			}
		];

		// Sample customers
		const customers = [
			{
				name: 'John Smith',
				phone: '+91 98765 43210',
				email: 'john.smith@email.com',
				address: '123 Main Street, Bangalore, Karnataka 560001'
			},
			{
				name: 'Sarah Johnson',
				phone: '+91 87654 32109',
				email: 'sarah.j@email.com',
				address: '456 Park Avenue, Mumbai, Maharashtra 400001'
			},
			{
				name: 'Mike Wilson',
				phone: '+91 76543 21098',
				email: 'mike.w@email.com',
				address: '789 Oak Road, Delhi, Delhi 110001'
			},
			{
				name: 'Emily Davis',
				phone: '+91 65432 10987',
				email: 'emily.d@email.com',
				address: '321 Pine Street, Chennai, Tamil Nadu 600001'
			}
		];

		// Insert products
		if (productCount === 0) {
			await Product.insertMany(products);
			console.log('✅ Sample products seeded successfully');
		}

		// Insert customers
		if (customerCount === 0) {
			await Customer.insertMany(customers);
			console.log('✅ Sample customers seeded successfully');
		}

		console.log('🎉 Database seeding completed!');
	} catch (error) {
		console.error('❌ Error seeding database:', error.message);
	}
} 