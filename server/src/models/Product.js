import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		sku: { type: String, required: true, unique: true },
		price: { type: Number, required: true, min: 0 },
		stock: { type: Number, required: true, min: 0, default: 0 },
		lowStockThreshold: { type: Number, required: true, min: 0, default: 5 },
	},
	{ timestamps: true }
);

export default mongoose.model('Product', productSchema);