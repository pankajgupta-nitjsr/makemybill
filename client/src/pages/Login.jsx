import React, { useState } from 'react';
import { Box, Button, Container, TextField, Typography, Paper, Link as MuiLink } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

export default function Login({ showNotification }) {
	const navigate = useNavigate();
	const [form, setForm] = useState({ email: '', password: '' });
	const [loading, setLoading] = useState(false);

	const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		console.log('Login attempt with:', { email: form.email, password: form.password ? '***' : 'empty' });
		
		try {
			console.log('Making login API call...');
			const res = await api.post('/auth/login', form);
			console.log('Login successful:', res.data);
			
			localStorage.setItem('token', res.data.token);
			localStorage.setItem('user', JSON.stringify(res.data.user));
			showNotification('Welcome back!', 'success');
			navigate('/app');
		} catch (error) {
			console.error('Login error:', error);
			console.error('Error response:', error.response?.data);
			console.error('Error status:', error.response?.status);
			showNotification(error.response?.data?.message || 'Login failed', 'error');
		} finally {
			setLoading(false);
		}
	};

	return (
		<Container maxWidth="sm">
			<Paper sx={{ p: 4, mt: 8, borderRadius: 3 }}>
				<Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>Sign In</Typography>
				<Typography color="text.secondary" sx={{ mb: 3 }}>
					Use your account to access the dashboard
				</Typography>
				<Box component="form" onSubmit={handleSubmit}>
					<TextField name="email" type="email" label="Email" value={form.email} onChange={handleChange} fullWidth sx={{ mb: 2 }} required />
					<TextField name="password" type="password" label="Password" value={form.password} onChange={handleChange} fullWidth sx={{ mb: 2 }} required />
					<Button type="submit" variant="contained" fullWidth disabled={loading}>
						{loading ? 'Signing in...' : 'Sign In'}
					</Button>
				</Box>
				<Typography sx={{ mt: 2 }}>
					Don't have an account? <MuiLink component={Link} to="/register">Create one</MuiLink>
				</Typography>
			</Paper>
		</Container>
	);
}