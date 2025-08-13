import mongoose from 'mongoose';

const saleItemSchema = new mongoose.Schema(
	{
		product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
		quantity: { type: Number, required: true, min: 1 },
		price: { type: Number, required: true, min: 0 },
	},
	{ _id: false }
);

const saleSchema = new mongoose.Schema(
	{
		invoiceNumber: { type: String, required: true, unique: true },
		items: { type: [saleItemSchema], required: true },
		customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
		total: { type: Number, required: true, min: 0 },
		paymentMethod: { 
			type: String, 
			enum: ['cash', 'card', 'upi', 'bank_transfer'], 
			default: 'cash' 
		},
	},
	{ timestamps: true }
);

export default mongoose.model('Sale', saleSchema);