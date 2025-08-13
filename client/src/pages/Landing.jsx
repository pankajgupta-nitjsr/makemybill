import React from 'react';
import { Box, Button, Container, Typography, Stack, Paper } from '@mui/material';
import { Link } from 'react-router-dom';

export default function Landing() {
	return (
		<Box sx={{ textAlign: 'center', py: 8 }}>
			<Container maxWidth="md">
				<Typography variant="h2" sx={{ fontWeight: 800, mb: 2, letterSpacing: '-0.03em' }}>
					Make My Bill
				</Typography>
				<Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
					Billing & POS System – Fast checkout, smart inventory, and beautiful invoices.
				</Typography>
				<Paper sx={{ p: 4, borderRadius: 4, background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', mb: 4 }}>
					<Typography variant="h6" sx={{ mb: 1 }}>
						Features
					</Typography>
					<Typography color="text.secondary">
						- POS Checkout with invoice PDF • Inventory with low stock alerts • Analytics Dashboard
					</Typography>
				</Paper>
				<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
					<Button component={Link} to="/login" variant="contained" size="large" sx={{ px: 4 }}>
						Sign In
					</Button>
					<Button component={Link} to="/register" variant="outlined" size="large" sx={{ px: 4 }}>
						Create Account
					</Button>
				</Stack>
			</Container>
		</Box>
	);
}