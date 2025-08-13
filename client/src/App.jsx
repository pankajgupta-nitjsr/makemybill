import React, { useState, useMemo } from 'react';
import { Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AppBar, Toolbar, Typography, Box, CssBaseline, Container, Button, Stack, Badge, Snackbar, Alert, IconButton } from '@mui/material';
import { Logout } from '@mui/icons-material';
import Dashboard from './pages/Dashboard.jsx';
import Inventory from './pages/Inventory.jsx';
import Customers from './pages/Customers.jsx';
import POS from './pages/POS.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import PurchaseHistory from './pages/PurchaseHistory.jsx';

const theme = createTheme({
	palette: {
		primary: { 
			main: '#6366f1',
			light: '#818cf8',
			dark: '#4f46e5'
		},
		secondary: { 
			main: '#10b981',
			light: '#34d399',
			dark: '#059669'
		},
		background: { 
			default: '#f8fafc',
			paper: '#ffffff'
		},
		text: {
			primary: '#1e293b',
			secondary: '#64748b'
		}
	},
	typography: {
		fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
		h4: {
			fontWeight: 700,
			letterSpacing: '-0.025em'
		},
		h5: {
			fontWeight: 600,
			letterSpacing: '-0.025em'
		},
		h6: {
			fontWeight: 600,
			letterSpacing: '-0.025em'
		}
	},
	shape: {
		borderRadius: 12
	},
	components: {
		MuiButton: {
			styleOverrides: {
				root: {
					textTransform: 'none',
					fontWeight: 600,
					borderRadius: 8,
					boxShadow: 'none',
					'&:hover': {
						boxShadow: '0 4px 12px rgba(99, 102, 241, 0.15)'
					}
				}
			}
		},
		MuiCard: {
			styleOverrides: {
				root: {
					borderRadius: 16,
					boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
					'&:hover': {
						boxShadow: '0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)'
					}
				}
			}
		},
		MuiPaper: {
			styleOverrides: {
				root: {
					borderRadius: 12,
					boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)'
				}
			}
		}
	}
});

function Nav() {
	const location = useLocation();
	const navigate = useNavigate();
	const path = location.pathname;
	const authed = Boolean(localStorage.getItem('token'));
	
	// Hide navbar on public pages
	if (!authed || path === '/' || path === '/login' || path === '/register') return null;
	
	const handleLogout = () => {
		localStorage.removeItem('token');
		localStorage.removeItem('user');
		navigate('/');
	};
	
	return (
		<AppBar 
			position="sticky" 
			elevation={0}
			sx={{
				background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
				borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
			}}
		>
			<Toolbar sx={{ minHeight: '70px' }}>
				<Typography 
					variant="h5" 
					sx={{ 
						flexGrow: 1, 
						fontWeight: 800,
						background: 'linear-gradient(45deg, #fff 30%, #f0f0f0 90%)',
						backgroundClip: 'text',
						WebkitBackgroundClip: 'text',
						WebkitTextFillColor: 'transparent',
						letterSpacing: '-0.025em'
					}}
				>
					Make My Bill
				</Typography>
				<Stack direction="row" spacing={2} alignItems="center">
					<Button 
						color={path === '/app' ? 'secondary' : 'inherit'} 
						component={Link} 
						to="/app"
						sx={{ color: '#fff', '&:hover': { color: '#fff' } }}
					>
						Dashboard
					</Button>
					<Button 
						color={path.startsWith('/app/inventory') ? 'secondary' : 'inherit'} 
						component={Link} 
						to="/app/inventory"
						sx={{ color: '#fff', '&:hover': { color: '#fff' } }}
					>
						Inventory
					</Button>
					<Button 
						color={path.startsWith('/app/customers') ? 'secondary' : 'inherit'} 
						component={Link} 
						to="/app/customers"
						sx={{ color: '#fff', '&:hover': { color: '#fff' } }}
					>
						Customers
					</Button>
					<Button 
						color={path.startsWith('/app/pos') ? 'secondary' : 'inherit'} 
						component={Link} 
						to="/app/pos"
						sx={{ color: '#fff', '&:hover': { color: '#fff' } }}
					>
						POS
					</Button>
					<Button 
						color={path.startsWith('/app/history') ? 'secondary' : 'inherit'} 
						component={Link} 
						to="/app/history"
						sx={{ color: '#fff', '&:hover': { color: '#fff' } }}
					>
						History
					</Button>
					<IconButton 
						onClick={handleLogout}
						sx={{ 
							color: '#fff',
							'&:hover': { 
								backgroundColor: 'rgba(255, 255, 255, 0.1)',
								color: '#fff'
							}
						}}
						title="Logout"
					>
						<Logout />
					</IconButton>
				</Stack>
			</Toolbar>
		</AppBar>
	);
}

function ProtectedRoute({ children }) {
	const authed = Boolean(localStorage.getItem('token'));
	return authed ? children : <Navigate to="/login" replace />;
}

export default function App() {
	const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

	const showNotification = (message, severity = 'success') => setNotification({ open: true, message, severity });
	const hideNotification = () => setNotification({ ...notification, open: false });

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<Nav />
			<Box sx={{ py: 4, minHeight: 'calc(100vh - 70px)', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
				<Container maxWidth="lg">
					<Routes>
						<Route path="/" element={<Landing />} />
						<Route path="/login" element={<Login showNotification={showNotification} />} />
						<Route path="/register" element={<Register showNotification={showNotification} />} />
						<Route path="/app" element={<ProtectedRoute><Dashboard showNotification={showNotification} /></ProtectedRoute>} />
						<Route path="/app/inventory" element={<ProtectedRoute><Inventory showNotification={showNotification} /></ProtectedRoute>} />
						<Route path="/app/customers" element={<ProtectedRoute><Customers showNotification={showNotification} /></ProtectedRoute>} />
						<Route path="/app/pos" element={<ProtectedRoute><POS showNotification={showNotification} /></ProtectedRoute>} />
						<Route path="/app/history" element={<ProtectedRoute><PurchaseHistory showNotification={showNotification} /></ProtectedRoute>} />
					</Routes>
				</Container>
			</Box>
			<Snackbar open={notification.open} autoHideDuration={4000} onClose={hideNotification} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
				<Alert onClose={hideNotification} severity={notification.severity} variant="filled" sx={{ width: '100%' }}>
					{notification.message}
				</Alert>
			</Snackbar>
		</ThemeProvider>
	);
}