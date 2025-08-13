import React, { useEffect, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Paper, TextField, Typography, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Chip, Skeleton, Avatar } from '@mui/material';
import { Edit, Delete, Add, People, Search, Person } from '@mui/icons-material';
import api from '../api';

function CustomerForm({ open, onClose, initial, onSaved, showNotification }) {
	const [form, setForm] = useState(initial || { name: '', phone: '', email: '', address: '' });
	const [loading, setLoading] = useState(false);
	
	useEffect(() => setForm(initial || { name: '', phone: '', email: '', address: '' }), [initial]);

	const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
	
	const handleSubmit = async () => {
		if (!form.name) {
			showNotification('Customer name is required', 'error');
			return;
		}
		
		setLoading(true);
		try {
			if (form._id) {
				await api.put(`/customers/${form._id}`, form);
				showNotification('Customer updated successfully!', 'success');
			} else {
				await api.post('/customers', form);
				showNotification('Customer added successfully!', 'success');
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
				{form._id ? '✏️ Edit Customer' : '➕ Add New Customer'}
			</DialogTitle>
			<DialogContent sx={{ pt: 3 }}>
				<Grid container spacing={3}>
					<Grid item xs={12} md={6}>
						<TextField 
							label="Customer Name *" 
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
							label="Phone Number" 
							name="phone" 
							value={form.phone} 
							onChange={handleChange} 
							fullWidth 
							variant="outlined"
						/>
					</Grid>
					<Grid item xs={12} md={6}>
						<TextField 
							label="Email Address" 
							name="email" 
							type="email"
							value={form.email} 
							onChange={handleChange} 
							fullWidth 
							variant="outlined"
						/>
					</Grid>
					<Grid item xs={12} md={6}>
						<TextField 
							label="Address" 
							name="address" 
							value={form.address} 
							onChange={handleChange} 
							fullWidth 
							variant="outlined"
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

export default function Customers({ showNotification }) {
	const [customers, setCustomers] = useState([]);
	const [open, setOpen] = useState(false);
	const [selected, setSelected] = useState(null);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');

	const load = async () => {
		try {
			const res = await api.get('/customers');
			setCustomers(res.data);
		} catch (error) {
			showNotification('Failed to load customers', 'error');
		} finally {
			setLoading(false);
		}
	};
	
	useEffect(() => { load(); }, []);

	const handleDelete = async (customer) => {
		if (window.confirm(`Are you sure you want to delete "${customer.name}"?`)) {
			try {
				await api.delete(`/customers/${customer._id}`);
				showNotification('Customer deleted successfully!', 'success');
				load();
			} catch (error) {
				showNotification('Failed to delete customer', 'error');
			}
		}
	};

	const filteredCustomers = customers.filter(customer =>
		customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
		(customer.phone && customer.phone.includes(searchTerm)) ||
		(customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
	);

	const getInitials = (name) => {
		return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
	};

	return (
		<Box>
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
				<Box sx={{ display: 'flex', alignItems: 'center' }}>
					<People sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
					<Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
						Customer Management
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
					Add Customer
				</Button>
			</Box>

			<Paper sx={{ p: 3, mb: 3 }}>
				<TextField
					fullWidth
					placeholder="Search customers by name, phone, or email..."
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
				) : filteredCustomers.length === 0 ? (
					<Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
						<People sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
						<Typography variant="h6" sx={{ mb: 1 }}>
							{searchTerm ? 'No customers found' : 'No customers yet'}
						</Typography>
						<Typography variant="body2">
							{searchTerm ? 'Try adjusting your search terms' : 'Add your first customer to get started!'}
						</Typography>
					</Box>
				) : (
					<Table>
						<TableHead>
							<TableRow sx={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
								<TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
								<TableCell sx={{ fontWeight: 600 }}>Contact Info</TableCell>
								<TableCell sx={{ fontWeight: 600 }}>Address</TableCell>
								<TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{filteredCustomers.map((c) => (
								<TableRow key={c._id} hover sx={{ '&:hover': { background: '#f8fafc' } }}>
									<TableCell>
										<Box sx={{ display: 'flex', alignItems: 'center' }}>
											<Avatar 
												sx={{ 
													mr: 2,
													background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
													fontWeight: 600
												}}
											>
												{getInitials(c.name)}
											</Avatar>
											<Box>
												<Typography variant="body1" sx={{ fontWeight: 600 }}>
													{c.name}
												</Typography>
												<Typography variant="caption" color="text.secondary">
													Customer ID: {c._id.slice(-6)}
												</Typography>
											</Box>
										</Box>
									</TableCell>
									<TableCell>
										<Box>
											{c.phone && (
												<Typography variant="body2" sx={{ mb: 0.5 }}>
													📞 {c.phone}
												</Typography>
											)}
											{c.email && (
												<Typography variant="body2">
													📧 {c.email}
												</Typography>
											)}
											{!c.phone && !c.email && (
												<Typography variant="body2" color="text.secondary">
													No contact info
												</Typography>
											)}
										</Box>
									</TableCell>
									<TableCell>
										{c.address ? (
											<Typography variant="body2" sx={{ maxWidth: 200 }}>
												📍 {c.address}
											</Typography>
										) : (
											<Typography variant="body2" color="text.secondary">
												No address
											</Typography>
										)}
									</TableCell>
									<TableCell align="right">
										<IconButton 
											onClick={() => { setSelected(c); setOpen(true); }}
											sx={{ color: 'primary.main', mr: 1 }}
										>
											<Edit />
										</IconButton>
										<IconButton 
											color="error" 
											onClick={() => handleDelete(c)}
										>
											<Delete />
										</IconButton>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
			</Paper>
			
			<CustomerForm 
				open={open} 
				initial={selected} 
				onClose={() => setOpen(false)} 
				onSaved={load}
				showNotification={showNotification}
			/>
		</Box>
	);
}