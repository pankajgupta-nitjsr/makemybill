import React, { useEffect, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Paper, TextField, Typography, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Chip, Skeleton, Alert } from '@mui/material';
import { Edit, Delete, Add, Search, Inventory as InventoryIcon } from '@mui/icons-material';
import api from '../api';

function ProductForm({ open, onClose, initial, onSaved, showNotification }) {
	const [form, setForm] = useState(initial || { name: '', sku: '', price: 0, stock: 0, lowStockThreshold: 5 });
	const [loading, setLoading] = useState(false);
	
	useEffect(() => setForm(initial || { name: '', sku: '', price: 0, stock: 0, lowStockThreshold: 5 }), [initial]);

	const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
	
	const handleSubmit = async () => {
		if (!form.name || !form.sku || form.price <= 0) {
			showNotification('Please fill all required fields correctly', 'error');
			return;
		}
		
		setLoading(true);
		try {
			if (form._id) {
				await api.put(`/products/${form._id}`, { 
					...form, 
					price: Number(form.price), 
					stock: Number(form.stock), 
					lowStockThreshold: Number(form.lowStockThreshold) 
				});
				showNotification('Product updated successfully!', 'success');
			} else {
				await api.post('/products', { 
					...form, 
					price: Number(form.price), 
					stock: Number(form.stock), 
					lowStockThreshold: Number(form.lowStockThreshold) 
				});
				showNotification('Product added successfully!', 'success');
			}
			onSaved();
			onClose();
		} catch (error) {
			showNotification(error.response?.data?.message || 'Operation failed', 'error');
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
			<DialogTitle sx={{ 
				background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
				color: 'white',
				fontWeight: 600
			}}>
				{form._id ? '✏️ Edit Product' : '➕ Add New Product'}
			</DialogTitle>
			<DialogContent sx={{ pt: 3 }}>
				<Grid container spacing={3}>
					<Grid item xs={12} md={6}>
						<TextField 
							label="Product Name *" 
							name="name" 
							value={form.name} 
							onChange={handleChange} 
							fullWidth 
							required
							variant="outlined"
						/>
					</Grid>
					<Grid item xs={12} md={6}>
						<TextField 
							label="SKU *" 
							name="sku" 
							value={form.sku} 
							onChange={handleChange} 
							fullWidth 
							required
							variant="outlined"
						/>
					</Grid>
					<Grid item xs={12} md={4}>
						<TextField 
							type="number" 
							label="Price (₹) *" 
							name="price" 
							value={form.price} 
							onChange={handleChange} 
							fullWidth 
							required
							variant="outlined"
							inputProps={{ min: 0, step: 0.01 }}
						/>
					</Grid>
					<Grid item xs={12} md={4}>
						<TextField 
							type="number" 
							label="Stock *" 
							name="stock" 
							value={form.stock} 
							onChange={handleChange} 
							fullWidth 
							required
							variant="outlined"
							inputProps={{ min: 0 }}
						/>
					</Grid>
					<Grid item xs={12} md={4}>
						<TextField 
							type="number" 
							label="Low Stock Threshold *" 
							name="lowStockThreshold" 
							value={form.lowStockThreshold} 
							onChange={handleChange} 
							fullWidth 
							required
							variant="outlined"
							inputProps={{ min: 0 }}
						/>
					</Grid>
				</Grid>
			</DialogContent>
			<DialogActions sx={{ p: 3, pt: 1 }}>
				<Button onClick={onClose} disabled={loading}>
					Cancel
				</Button>
				<Button 
					onClick={handleSubmit} 
					variant="contained" 
					disabled={loading}
					sx={{
						background: 'linear-gradient(45deg, #10b981 30%, #34d399 90%)',
						'&:hover': {
							background: 'linear-gradient(45deg, #059669 30%, #10b981 90%)'
						}
					}}
				>
					{loading ? 'Saving...' : (form._id ? 'Update' : 'Add')}
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export default function Inventory({ showNotification }) {
	const [products, setProducts] = useState([]);
	const [open, setOpen] = useState(false);
	const [selected, setSelected] = useState(null);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');

	const load = async () => {
		try {
			const res = await api.get('/products');
			setProducts(res.data);
		} catch (error) {
			showNotification('Failed to load products', 'error');
		} finally {
			setLoading(false);
		}
	};
	
	useEffect(() => { load(); }, []);

	const handleDelete = async (product) => {
		if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
			try {
				await api.delete(`/products/${product._id}`);
				showNotification('Product deleted successfully!', 'success');
				load();
			} catch (error) {
				showNotification('Failed to delete product', 'error');
			}
		}
	};

	const filteredProducts = products.filter(product =>
		product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
		product.sku.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const getStockStatus = (stock, threshold) => {
		if (stock === 0) return { label: 'Out of Stock', color: 'error' };
		if (stock <= threshold) return { label: 'Low Stock', color: 'warning' };
		return { label: 'In Stock', color: 'success' };
	};

	return (
		<Box>
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
				<Box sx={{ display: 'flex', alignItems: 'center' }}>
					<InventoryIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
					<Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
						Inventory Management
					</Typography>
				</Box>
				<Button 
					variant="contained" 
					onClick={() => { setSelected(null); setOpen(true); }}
					startIcon={<Add />}
					sx={{
						background: 'linear-gradient(45deg, #10b981 30%, #34d399 90%)',
						'&:hover': {
							background: 'linear-gradient(45deg, #059669 30%, #10b981 90%)'
						}
					}}
				>
					Add Product
				</Button>
			</Box>

			<Paper sx={{ p: 3, mb: 3 }}>
				<TextField
					fullWidth
					placeholder="Search products by name or SKU..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					InputProps={{
						startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
					}}
					variant="outlined"
					sx={{ mb: 2 }}
				/>

				{loading ? (
					<Box>
						{[1, 2, 3].map((i) => (
							<Skeleton key={i} variant="rectangular" width="100%" height={60} sx={{ mb: 1 }} />
						))}
					</Box>
				) : filteredProducts.length === 0 ? (
					<Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
						<InventoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
						<Typography variant="h6" sx={{ mb: 1 }}>
							{searchTerm ? 'No products found' : 'No products yet'}
						</Typography>
						<Typography variant="body2">
							{searchTerm ? 'Try adjusting your search terms' : 'Add your first product to get started!'}
						</Typography>
					</Box>
				) : (
					<Table>
						<TableHead>
							<TableRow sx={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
								<TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
								<TableCell sx={{ fontWeight: 600 }}>SKU</TableCell>
								<TableCell align="right" sx={{ fontWeight: 600 }}>Price</TableCell>
								<TableCell align="center" sx={{ fontWeight: 600 }}>Stock Status</TableCell>
								<TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{filteredProducts.map((p) => {
								const stockStatus = getStockStatus(p.stock, p.lowStockThreshold);
								return (
									<TableRow key={p._id} hover sx={{ '&:hover': { background: '#f8fafc' } }}>
										<TableCell>
											<Box>
												<Typography variant="body1" sx={{ fontWeight: 600 }}>
													{p.name}
												</Typography>
												<Typography variant="caption" color="text.secondary">
													Stock: {p.stock} • Threshold: {p.lowStockThreshold}
												</Typography>
											</Box>
										</TableCell>
										<TableCell>
											<Chip label={p.sku} size="small" variant="outlined" />
										</TableCell>
										<TableCell align="right">
											<Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>
												₹{p.price.toFixed(2)}
											</Typography>
										</TableCell>
										<TableCell align="center">
											<Chip 
												label={stockStatus.label} 
												color={stockStatus.color} 
												size="small"
												variant="filled"
											/>
										</TableCell>
										<TableCell align="right">
											<IconButton 
												onClick={() => { setSelected(p); setOpen(true); }}
												sx={{ color: 'primary.main', mr: 1 }}
											>
												<Edit />
											</IconButton>
											<IconButton 
												color="error" 
												onClick={() => handleDelete(p)}
											>
												<Delete />
											</IconButton>
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				)}
			</Paper>
			
			<ProductForm 
				open={open} 
				initial={selected} 
				onClose={() => setOpen(false)} 
				onSaved={load}
				showNotification={showNotification}
			/>
		</Box>
	);
}