import React, { useState, useEffect } from 'react';
import {
	Box,
	Typography,
	Grid,
	Card,
	CardContent,
	Button,
	TextField,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	IconButton,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Alert,
	Divider,
	Stack,
	Chip,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	Modal,
	Fade,
	Backdrop
} from '@mui/material';
import {
	Add,
	Remove,
	Delete,
	ShoppingCart,
	CheckCircle,
	Receipt,
	Print
} from '@mui/icons-material';
import api from '../api';
import PDFViewer from '../components/PDFViewer';

function CheckoutSuccessModal({ open, onClose, saleData, showNotification }) {
	const [pdfUrl, setPdfUrl] = useState(null);
	const [showPdf, setShowPdf] = useState(false);

	const handleViewInvoice = async () => {
		try {
			const response = await api.get(`/sales/${saleData?._id}/invoice`, {
				responseType: 'blob'
			});
			const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
			setPdfUrl(url);
			setShowPdf(true);
		} catch (error) {
			console.error('Error viewing invoice:', error);
			showNotification('Failed to view invoice', 'error');
		}
	};

	const handleClosePdf = () => {
		setShowPdf(false);
		if (pdfUrl) {
			window.URL.revokeObjectURL(pdfUrl);
			setPdfUrl(null);
		}
	};

	return (
		<Modal
			open={open}
			onClose={onClose}
			closeAfterTransition
			BackdropComponent={Backdrop}
			BackdropProps={{
				timeout: 500,
			}}
		>
			<Fade in={open}>
				<Box sx={{
					position: 'absolute',
					top: '50%',
					left: '50%',
					transform: 'translate(-50%, -50%)',
					width: showPdf ? '90vw' : 400,
					height: showPdf ? '90vh' : 'auto',
					maxWidth: showPdf ? '90vw' : 400,
					maxHeight: showPdf ? '90vh' : 'auto',
					bgcolor: 'background.paper',
					borderRadius: 3,
					boxShadow: 24,
					p: 4,
					overflow: 'hidden'
				}}>
					{!showPdf ? (
						<>
							<Box sx={{ textAlign: 'center', mb: 3 }}>
								<CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
								<Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
									Checkout Successful!
								</Typography>
								<Typography variant="body1" color="text.secondary">
									Invoice #{saleData?.invoiceNumber} has been generated
								</Typography>
							</Box>

							<Alert severity="info" sx={{ mb: 3 }}>
								<strong>Invoice Details:</strong><br />
								Total: ₹{saleData?.total?.toFixed(2)}<br />
								Items: {saleData?.items?.length || 0}<br />
								Customer: {saleData?.customer?.name || 'Walk-in Customer'}
							</Alert>

							<Stack direction="row" spacing={2}>
								<Button
									fullWidth
									variant="contained"
									startIcon={<Receipt />}
									onClick={handleViewInvoice}
								>
									View Invoice
								</Button>
								<Button
									fullWidth
									variant="outlined"
									startIcon={<Print />}
									onClick={async () => {
										try {
											const response = await api.get(`/sales/${saleData?._id}/invoice`, {
												responseType: 'blob'
											});
											const url = window.URL.createObjectURL(new Blob([response.data]));
											const link = document.createElement('a');
											link.href = url;
											link.setAttribute('download', `invoice-${saleData?.invoiceNumber}.pdf`);
											document.body.appendChild(link);
											link.click();
											link.remove();
											window.URL.revokeObjectURL(url);
										} catch (error) {
											console.error('Error downloading invoice:', error);
											showNotification('Failed to download invoice', 'error');
										}
									}}
								>
									Download
								</Button>
							</Stack>

							<Button
								fullWidth
								variant="text"
								onClick={onClose}
								sx={{ mt: 2 }}
							>
								Continue Shopping
							</Button>
						</>
					) : (
						<Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
							<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
								<Typography variant="h6" sx={{ fontWeight: 700 }}>
									Invoice #{saleData?.invoiceNumber}
								</Typography>
								<Button
									variant="outlined"
									onClick={handleClosePdf}
									size="small"
								>
									Close
								</Button>
							</Box>
							<Box sx={{ flex: 1, border: '1px solid #e0e0e0', borderRadius: 1, overflow: 'hidden' }}>
								<PDFViewer pdfUrl={pdfUrl} />
							</Box>
						</Box>
					)}
				</Box>
			</Fade>
		</Modal>
	);
}

export default function POS({ showNotification }) {
	const [products, setProducts] = useState([]);
	const [customers, setCustomers] = useState([]);
	const [cart, setCart] = useState([]);
	const [selectedCustomer, setSelectedCustomer] = useState('');
	const [paymentMethod, setPaymentMethod] = useState('cash');
	const [loading, setLoading] = useState(true);
	const [checkoutLoading, setCheckoutLoading] = useState(false);
	const [successModalOpen, setSuccessModalOpen] = useState(false);
	const [saleData, setSaleData] = useState(null);

	useEffect(() => {
		fetchData();
	}, []);

	const fetchData = async () => {
		try {
			setLoading(true);
			const [productsRes, customersRes] = await Promise.all([
				api.get('/products'),
				api.get('/customers')
			]);
			setProducts(productsRes.data);
			setCustomers(customersRes.data);
		} catch (error) {
			console.error('Error fetching data:', error);
			showNotification('Failed to load data', 'error');
		} finally {
			setLoading(false);
		}
	};

	const addToCart = (product) => {
		if (product.stock <= 0) {
			showNotification('Product is out of stock', 'error');
			return;
		}

		const existingItem = cart.find(item => item.product._id === product._id);
		if (existingItem) {
			if (existingItem.quantity >= product.stock) {
				showNotification('Cannot add more items than available stock', 'error');
				return;
			}
			setCart(cart.map(item =>
				item.product._id === product._id
					? { ...item, quantity: item.quantity + 1 }
					: item
			));
		} else {
			setCart([...cart, { product, quantity: 1 }]);
		}
		showNotification(`${product.name} added to cart`, 'success');
	};

	const removeFromCart = (productId) => {
		setCart(cart.filter(item => item.product._id !== productId));
		showNotification('Item removed from cart', 'success');
	};

	const updateQuantity = (productId, newQuantity) => {
		if (newQuantity <= 0) {
			removeFromCart(productId);
			return;
		}

		const product = products.find(p => p._id === productId);
		if (newQuantity > product.stock) {
			showNotification('Cannot add more items than available stock', 'error');
			return;
		}

		setCart(cart.map(item =>
			item.product._id === productId
				? { ...item, quantity: newQuantity }
				: item
		));
	};

	const getTotal = () => {
		return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
	};

	const handleCheckout = async () => {
		if (cart.length === 0) {
			showNotification('Cart is empty', 'error');
			return;
		}

		setCheckoutLoading(true);
		try {
			const saleData = {
				items: cart.map(item => ({
					product: item.product._id,
					quantity: item.quantity,
					price: item.product.price
				})),
				customer: selectedCustomer || undefined,
				total: getTotal(),
				paymentMethod
			};

			const response = await api.post('/sales', saleData);
			setSaleData(response.data);
			setSuccessModalOpen(true);
			setCart([]);
			setSelectedCustomer('');
			setPaymentMethod('cash');
			showNotification('Sale completed successfully!', 'success');
			fetchData(); // Refresh products to update stock
		} catch (error) {
			console.error('Checkout error:', error);
			showNotification(error.response?.data?.message || 'Checkout failed', 'error');
		} finally {
			setCheckoutLoading(false);
		}
	};

	const getStockStatus = (stock) => {
		if (stock <= 0) return { label: 'Out of Stock', color: 'error' };
		if (stock <= 5) return { label: 'Low Stock', color: 'warning' };
		return { label: 'In Stock', color: 'success' };
	};

	if (loading) {
		return (
			<Box>
				<Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>Point of Sale</Typography>
				<Grid container spacing={3}>
					<Grid item xs={12} md={8}>
						<Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2 }}>
							{[...Array(8)].map((_, i) => (
								<Box key={i} sx={{ height: 200, bgcolor: 'grey.200', borderRadius: 2 }} />
							))}
						</Box>
					</Grid>
					<Grid item xs={12} md={4}>
						<Box sx={{ height: 400, bgcolor: 'grey.200', borderRadius: 2 }} />
					</Grid>
				</Grid>
			</Box>
		);
	}

	return (
		<Box>
			<Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>Point of Sale</Typography>
			
			{/* Test PDF Button - Remove this after testing */}
			<Box sx={{ mb: 3 }}>
				<Button 
					variant="outlined" 
					onClick={async () => {
						try {
							console.log('Testing PDF generation...');
							const response = await api.get('/sales/test-pdf', { responseType: 'blob' });
							console.log('Test PDF response:', response);
							const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
							window.open(url, '_blank');
						} catch (error) {
							console.error('Test PDF error:', error);
							showNotification('Test PDF failed', 'error');
						}
					}}
					sx={{ mr: 2 }}
				>
					Test PDF Generation
				</Button>
			</Box>

			<Grid container spacing={3}>
				{/* Products Grid */}
				<Grid item xs={12} md={8}>
					<Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Products</Typography>
					<Box sx={{ 
						display: 'grid', 
						gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
						gap: 2,
						maxHeight: '70vh',
						overflowY: 'auto'
					}}>
						{products.map((product) => {
							const stockStatus = getStockStatus(product.stock);
							return (
								<Card 
									key={product._id} 
									sx={{ 
										cursor: 'pointer',
										'&:hover': { transform: 'translateY(-2px)', transition: 'transform 0.2s' }
									}}
									onClick={() => addToCart(product)}
								>
									<CardContent sx={{ textAlign: 'center', p: 2 }}>
										<Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
											{product.name}
										</Typography>
										<Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
											SKU: {product.sku}
										</Typography>
										<Typography variant="h6" color="primary" sx={{ fontWeight: 700, mb: 1 }}>
											₹{product.price}
										</Typography>
										<Chip 
											label={stockStatus.label} 
											color={stockStatus.color} 
											size="small"
											variant="outlined"
										/>
									</CardContent>
								</Card>
							);
						})}
					</Box>
				</Grid>

									{/* Shopping Cart */}
					<Grid item xs={12} md={4}>
						<Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
							Shopping Cart <ShoppingCart sx={{ ml: 1, verticalAlign: 'middle' }} />
						</Typography>
						
						<Paper sx={{ p: 2, mb: 2 }}>
							<FormControl fullWidth sx={{ mb: 2 }}>
								<InputLabel>Customer</InputLabel>
								<Select
									value={selectedCustomer}
									label="Customer"
									onChange={(e) => setSelectedCustomer(e.target.value)}
								>
									<MenuItem value="">Walk-in Customer</MenuItem>
									{customers.map((customer) => (
										<MenuItem key={customer._id} value={customer._id}>
											{customer.name}
										</MenuItem>
									))}
								</Select>
							</FormControl>

							<FormControl fullWidth sx={{ mb: 2 }}>
								<InputLabel>Payment Method</InputLabel>
								<Select
									value={paymentMethod}
									label="Payment Method"
									onChange={(e) => setPaymentMethod(e.target.value)}
								>
									<MenuItem value="cash">Cash</MenuItem>
									<MenuItem value="card">Card</MenuItem>
									<MenuItem value="upi">UPI</MenuItem>
									<MenuItem value="bank_transfer">Bank Transfer</MenuItem>
								</Select>
							</FormControl>
						</Paper>

						<Paper sx={{ p: 2, mb: 2, height: '60vh', display: 'flex', flexDirection: 'column' }}>
							{cart.length === 0 ? (
								<Box sx={{ textAlign: 'center', py: 4, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
									<Typography color="text.secondary">
										Cart is empty
									</Typography>
									<Typography variant="body2" color="text.secondary">
										Add products to get started
									</Typography>
								</Box>
							) : (
								<Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
									<TableContainer sx={{ flex: 1 }}>
										<Table size="small" stickyHeader>
											<TableHead>
												<TableRow>
													<TableCell sx={{ fontWeight: 600, minWidth: 120 }}>Item</TableCell>
													<TableCell sx={{ fontWeight: 600, width: 80 }}>Qty</TableCell>
													<TableCell sx={{ fontWeight: 600, width: 70 }}>Price</TableCell>
													<TableCell sx={{ fontWeight: 600, width: 70 }}>Total</TableCell>
													<TableCell sx={{ fontWeight: 600, width: 50 }}></TableCell>
												</TableRow>
											</TableHead>
											<TableBody>
												{cart.map((item) => (
													<TableRow key={item.product._id}>
														<TableCell sx={{ minWidth: 120 }}>
															<Box>
																<Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
																	{item.product.name}
																</Typography>
																<Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
																	SKU: {item.product.sku}
																</Typography>
															</Box>
														</TableCell>
														<TableCell sx={{ width: 80 }}>
															<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
																<IconButton 
																	size="small" 
																	onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
																>
																	<Remove fontSize="small" />
																</IconButton>
																<TextField
																	size="small"
																	value={item.quantity}
																	onChange={(e) => updateQuantity(item.product._id, parseInt(e.target.value) || 0)}
																	sx={{ width: 50, '& .MuiInputBase-input': { textAlign: 'center', fontSize: '0.875rem' } }}
																/>
																<IconButton 
																	size="small" 
																	onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
																>
																	<Add fontSize="small" />
																</IconButton>
															</Box>
														</TableCell>
														<TableCell sx={{ width: 70, fontSize: '0.875rem' }}>₹{item.product.price}</TableCell>
														<TableCell sx={{ width: 70, fontSize: '0.875rem' }}>₹{(item.product.price * item.quantity).toFixed(2)}</TableCell>
														<TableCell sx={{ width: 50 }}>
															<IconButton 
																size="small" 
																onClick={() => removeFromCart(item.product._id)}
																color="error"
															>
																<Delete fontSize="small" />
															</IconButton>
														</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</TableContainer>
								</Box>
							)}
						</Paper>

					{cart.length > 0 && (
						<Paper sx={{ p: 2, mb: 2 }}>
							<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
								<Typography variant="h6" sx={{ fontWeight: 600 }}>Total:</Typography>
															<Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
								₹{getTotal().toFixed(2)}
							</Typography>
							</Box>
							<Button
								fullWidth
								variant="contained"
								size="large"
								onClick={handleCheckout}
								disabled={checkoutLoading}
								sx={{ 
									py: 1.5,
									fontWeight: 700,
									background: 'linear-gradient(45deg, #10b981 30%, #34d399 90%)',
									'&:hover': {
										background: 'linear-gradient(45deg, #059669 30%, #10b981 90%)'
									}
								}}
							>
								{checkoutLoading ? 'Processing...' : 'Checkout'}
							</Button>
						</Paper>
					)}
				</Grid>
			</Grid>

			<CheckoutSuccessModal
				open={successModalOpen}
				onClose={() => setSuccessModalOpen(false)}
				saleData={saleData}
				showNotification={showNotification}
			/>
		</Box>
	);
}