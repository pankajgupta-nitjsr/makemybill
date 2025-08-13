import React, { useState } from 'react';
import { Box, Button, Container, TextField, Typography, Paper, Link as MuiLink } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

export default function Register({ showNotification }) {
	const navigate = useNavigate();
	const [form, setForm] = useState({ name: '', email: '', password: '' });
	const [loading, setLoading] = useState(false);

	const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		console.log('Registration attempt with:', { name: form.name, email: form.email, password: form.password ? '***' : 'empty' });
		
		try {
			console.log('Making registration API call...');
			const registerResponse = await api.post('/auth/register', form);
			console.log('Registration successful:', registerResponse.data);
			
			console.log('Making login API call...');
			const loginResponse = await api.post('/auth/login', { email: form.email, password: form.password });
			console.log('Login successful:', loginResponse.data);
			
			localStorage.setItem('token', loginResponse.data.token);
			localStorage.setItem('user', JSON.stringify(loginResponse.data.user));
			showNotification('Account created! Welcome 🎉', 'success');
			navigate('/app');
		} catch (error) {
			console.error('Registration/Login error:', error);
			console.error('Error response:', error.response?.data);
			console.error('Error status:', error.response?.status);
			showNotification(error.response?.data?.message || 'Registration failed', 'error');
		} finally {
			setLoading(false);
		}
	};

	return (
		<Container maxWidth="sm">
			<Paper sx={{ p: 4, mt: 8, borderRadius: 3 }}>
				<Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>Create Account</Typography>
				<Typography color="text.secondary" sx={{ mb: 3 }}>
					Sign up to start managing billing and inventory
				</Typography>
				<Box component="form" onSubmit={handleSubmit}>
					<TextField name="name" label="Full Name" value={form.name} onChange={handleChange} fullWidth sx={{ mb: 2 }} required />
					<TextField name="email" type="email" label="Email" value={form.email} onChange={handleChange} fullWidth sx={{ mb: 2 }} required />
					<TextField name="password" type="password" label="Password" value={form.password} onChange={handleChange} fullWidth sx={{ mb: 2 }} required />
					<Button type="submit" variant="contained" fullWidth disabled={loading}>
						{loading ? 'Creating...' : 'Create Account'}
					</Button>
				</Box>
				<Typography sx={{ mt: 2 }}>
					Already have an account? <MuiLink component={Link} to="/login">Sign in</MuiLink>
				</Typography>
			</Paper>
		</Container>
	);
}