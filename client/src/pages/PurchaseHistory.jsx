import React, { useState, useEffect } from 'react';
import { 
	Box, 
	Typography, 
	Paper, 
	Table, 
	TableBody, 
	TableCell, 
	TableContainer, 
	TableHead, 
	TableRow,
	Button,
	Chip,
	IconButton,
	Tooltip,
	TextField,
	InputAdornment,
	Skeleton,
	Alert,
	Modal,
	Fade,
	Backdrop
} from '@mui/material';
import { 
	Download, 
	Search, 
	Visibility,
	Receipt
} from '@mui/icons-material';
import api from '../api';
import PDFViewer from '../components/PDFViewer';

export default function PurchaseHistory({ showNotification }) {
	const [sales, setSales] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [error, setError] = useState(null);
	const [pdfModalOpen, setPdfModalOpen] = useState(false);
	const [pdfUrl, setPdfUrl] = useState(null);
	const [currentSale, setCurrentSale] = useState(null);

	useEffect(() => {
		fetchSales();
	}, []);

	const fetchSales = async () => {
		try {
			setLoading(true);
			const response = await api.get('/sales');
			setSales(response.data);
			setError(null);
		} catch (error) {
			console.error('Error fetching sales:', error);
			setError('Failed to load purchase history');
			showNotification('Failed to load purchase history', 'error');
		} finally {
			setLoading(false);
		}
	};

	const downloadInvoice = async (saleId) => {
		try {
			const response = await api.get(`/sales/${saleId}/invoice`, {
				responseType: 'blob'
			});
			
			const url = window.URL.createObjectURL(new Blob([response.data]));
			const link = document.createElement('a');
			link.href = url;
			link.setAttribute('download', `invoice-${saleId}.pdf`);
			document.body.appendChild(link);
			link.click();
			link.remove();
			window.URL.revokeObjectURL(url);
			
			showNotification('Invoice downloaded successfully!', 'success');
		} catch (error) {
			console.error('Error downloading invoice:', error);
			showNotification('Failed to download invoice', 'error');
		}
	};

	const viewInvoice = async (sale) => {
		try {
			const response = await api.get(`/sales/${sale._id}/invoice`, {
				responseType: 'blob'
			});
			
			const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
			setPdfUrl(url);
			setCurrentSale(sale);
			setPdfModalOpen(true);
		} catch (error) {
			console.error('Error viewing invoice:', error);
			showNotification('Failed to view invoice', 'error');
		}
	};

	const closePdfModal = () => {
		setPdfModalOpen(false);
		if (pdfUrl) {
			window.URL.revokeObjectURL(pdfUrl);
			setPdfUrl(null);
		}
		setCurrentSale(null);
	};

	const filteredSales = sales.filter(sale => 
		sale.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
		sale.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
		sale.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	const formatCurrency = (amount) => {
		return new Intl.NumberFormat('en-IN', {
			style: 'currency',
			currency: 'INR'
		}).format(amount);
	};

	if (loading) {
		return (
			<Box>
				<Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>Purchase History</Typography>
				<Box sx={{ mb: 3 }}>
					<Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
				</Box>
				<Box sx={{ mb: 2 }}>
					<Skeleton variant="rectangular" height={400} sx={{ borderRadius: 1 }} />
				</Box>
			</Box>
		);
	}

	if (error) {
		return (
			<Box>
				<Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>Purchase History</Typography>
				<Alert severity="error" sx={{ mb: 2 }}>
					{error}
				</Alert>
				<Button variant="contained" onClick={fetchSales}>
					Retry
				</Button>
			</Box>
		);
	}

	return (
		<Box>
			<Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>Purchase History</Typography>
			
			<Box sx={{ mb: 3 }}>
				<TextField
					fullWidth
					placeholder="Search by invoice number, customer name, or email..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<Search />
							</InputAdornment>
						),
					}}
					sx={{ maxWidth: 500 }}
				/>
			</Box>

			<Paper sx={{ overflow: 'hidden' }}>
				<TableContainer>
					<Table>
						<TableHead>
							<TableRow sx={{ backgroundColor: 'grey.50' }}>
								<TableCell sx={{ fontWeight: 600 }}>Invoice #</TableCell>
								<TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
								<TableCell sx={{ fontWeight: 600 }}>Items</TableCell>
								<TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
								<TableCell sx={{ fontWeight: 600 }}>Payment</TableCell>
								<TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
								<TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{filteredSales.length === 0 ? (
								<TableRow>
									<TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
										<Typography color="text.secondary">
											{searchTerm ? 'No sales found matching your search' : 'No sales recorded yet'}
										</Typography>
									</TableCell>
								</TableRow>
							) : (
								filteredSales.map((sale) => (
									<TableRow key={sale._id} hover>
										<TableCell>
											<Typography variant="body2" sx={{ fontWeight: 600 }}>
												{sale.invoiceNumber}
											</Typography>
										</TableCell>
										<TableCell>
											<Box>
												<Typography variant="body2" sx={{ fontWeight: 600 }}>
													{sale.customer?.name || 'N/A'}
												</Typography>
												<Typography variant="caption" color="text.secondary">
													{sale.customer?.email || 'N/A'}
												</Typography>
											</Box>
										</TableCell>
										<TableCell>
											<Box>
												{sale.items?.map((item, index) => (
													<Typography key={index} variant="caption" display="block">
														{item.product?.name || 'Unknown Product'} × {item.quantity}
													</Typography>
												))}
											</Box>
										</TableCell>
										<TableCell>
											<Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
												{formatCurrency(sale.total)}
											</Typography>
										</TableCell>
										<TableCell>
											<Chip 
												label={sale.paymentMethod || 'N/A'} 
												size="small"
												variant="outlined"
											/>
										</TableCell>
										<TableCell>
											<Typography variant="body2">
												{formatDate(sale.createdAt)}
											</Typography>
										</TableCell>
										<TableCell>
											<Box sx={{ display: 'flex', gap: 1 }}>
												<Tooltip title="View Invoice">
													<IconButton 
														size="small" 
														onClick={() => viewInvoice(sale)}
														sx={{ color: 'primary.main' }}
													>
														<Visibility />
													</IconButton>
												</Tooltip>
												<Tooltip title="Download Invoice">
													<IconButton 
														size="small" 
														onClick={() => downloadInvoice(sale._id)}
														sx={{ color: 'success.main' }}
													>
														<Download />
													</IconButton>
												</Tooltip>
											</Box>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</TableContainer>
			</Paper>

			{/* PDF View Modal */}
			<Modal
				open={pdfModalOpen}
				onClose={closePdfModal}
				closeAfterTransition
				BackdropComponent={Backdrop}
				BackdropProps={{
					timeout: 500,
				}}
			>
				<Fade in={pdfModalOpen}>
					<Box sx={{
						position: 'absolute',
						top: '50%',
						left: '50%',
						transform: 'translate(-50%, -50%)',
						width: '90vw',
						height: '90vh',
						maxWidth: '90vw',
						maxHeight: '90vh',
						bgcolor: 'background.paper',
						borderRadius: 3,
						boxShadow: 24,
						p: 3,
						overflow: 'hidden'
					}}>
						<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
							<Typography variant="h6" sx={{ fontWeight: 700 }}>
								Invoice #{currentSale?.invoiceNumber}
							</Typography>
							<Button
								variant="outlined"
								onClick={closePdfModal}
								size="small"
							>
								Close
							</Button>
						</Box>
						<Box sx={{ flex: 1, border: '1px solid #e0e0e0', borderRadius: 1, overflow: 'hidden' }}>
							<PDFViewer pdfUrl={pdfUrl} />
						</Box>
					</Box>
				</Fade>
			</Modal>
		</Box>
	);
} 