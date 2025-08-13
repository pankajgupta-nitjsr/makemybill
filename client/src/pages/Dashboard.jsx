import React, { useEffect, useState } from 'react';
import { Grid, Paper, Typography, Card, CardContent, List, ListItem, ListItemText, Box, Chip, Skeleton, Alert, Button } from '@mui/material';
import { TrendingUp, ShoppingCart, AttachMoney, Inventory, Warning } from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import api from '../api';

const StatCard = ({ title, value, icon, color, loading = false }) => (
	<Card sx={{ 
		height: '100%',
		background: `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`,
		border: `1px solid ${color}20`
	}}>
		<CardContent sx={{ p: 3 }}>
			<Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
				<Box sx={{ 
					p: 1.5, 
					borderRadius: 2, 
					background: color,
					color: 'white',
					mr: 2
				}}>
					{icon}
				</Box>
				<Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600 }}>
					{title}
				</Typography>
			</Box>
			{loading ? (
				<Skeleton variant="text" width="60%" height={40} />
			) : (
				<Typography variant="h4" sx={{ fontWeight: 700, color: color }}>
					{title.includes('Revenue') ? `₹${value.toFixed(2)}` : value.toLocaleString()}
				</Typography>
			)}
		</CardContent>
	</Card>
);

export default function Dashboard({ showNotification }) {
	const [kpis, setKpis] = useState({ totalRevenue: 0, totalSales: 0, monthRevenue: 0, monthSales: 0 });
	const [series, setSeries] = useState([]);
	const [lowStock, setLowStock] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		(async () => {
			try {
				setError(null);
				const [k, s, l] = await Promise.all([
					api.get('/analytics/kpis'),
					api.get('/analytics/sales-by-day'),
					api.get('/products/low-stock'),
				]);
				setKpis(k.data);
				setSeries(s.data);
				setLowStock(l.data);
			} catch (error) {
				setError('Failed to load dashboard data. Please check your connection.');
				showNotification('Failed to load dashboard data', 'error');
			} finally {
				setLoading(false);
			}
		})();
	}, [showNotification]);

	if (error) {
		return (
			<Box sx={{ textAlign: 'center', py: 8 }}>
				<Alert severity="error" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
					{error}
				</Alert>
				<Button 
					variant="contained" 
					onClick={() => window.location.reload()}
					sx={{ mt: 2 }}
				>
					Retry
				</Button>
			</Box>
		);
	}

	return (
		<Box>
			<Typography variant="h4" sx={{ mb: 4, fontWeight: 700, color: 'text.primary' }}>
				📊 Dashboard Overview
			</Typography>
			
			<Grid container spacing={3} sx={{ mb: 4 }}>
				<Grid item xs={12} sm={6} md={3}>
					<StatCard
						title="Total Revenue"
						value={kpis.totalRevenue}
						icon={<AttachMoney />}
						color="#6366f1"
						loading={loading}
					/>
				</Grid>
				<Grid item xs={12} sm={6} md={3}>
					<StatCard
						title="Total Sales"
						value={kpis.totalSales}
						icon={<ShoppingCart />}
						color="#10b981"
						loading={loading}
					/>
				</Grid>
				<Grid item xs={12} sm={6} md={3}>
					<StatCard
						title="This Month Revenue"
						value={kpis.monthRevenue}
						icon={<TrendingUp />}
						color="#f59e0b"
						loading={loading}
					/>
				</Grid>
				<Grid item xs={12} sm={6} md={3}>
					<StatCard
						title="This Month Sales"
						value={kpis.monthSales}
						icon={<Inventory />}
						color="#ef4444"
						loading={loading}
					/>
				</Grid>
			</Grid>

			<Grid container spacing={3}>
				<Grid item xs={12} lg={8}>
					<Paper sx={{ p: 3, height: 400 }}>
						<Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
							<TrendingUp sx={{ mr: 1, color: 'primary.main' }} />
							<Typography variant="h6" sx={{ fontWeight: 600 }}>
								Revenue Trend (Last 2 Weeks)
							</Typography>
						</Box>
						{loading ? (
							<Box sx={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
								<Skeleton variant="rectangular" width="100%" height="100%" />
							</Box>
						) : series.length === 0 ? (
							<Box sx={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>
								<Box sx={{ textAlign: 'center' }}>
									<TrendingUp sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
									<Typography variant="h6" sx={{ mb: 1 }}>
										No sales data yet
									</Typography>
									<Typography variant="body2">
										Complete your first sale to see revenue trends
									</Typography>
								</Box>
							</Box>
						) : (
							<ResponsiveContainer width="100%" height="90%">
								<LineChart data={series}>
									<CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
									<XAxis 
										dataKey="date" 
										stroke="#64748b"
										fontSize={12}
									/>
									<YAxis 
										stroke="#64748b"
										fontSize={12}
										tickFormatter={(value) => `₹${value}`}
									/>
									<Tooltip 
										contentStyle={{
											background: '#fff',
											border: '1px solid #e2e8f0',
											borderRadius: 8,
											boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
										}}
										formatter={(value) => [`₹${value}`, 'Revenue']}
									/>
									<Line 
										type="monotone" 
										dataKey="revenue" 
										stroke="#6366f1" 
										strokeWidth={3}
										dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
										activeDot={{ r: 6, stroke: '#6366f1', strokeWidth: 2 }}
									/>
								</LineChart>
							</ResponsiveContainer>
						)}
					</Paper>
				</Grid>

				<Grid item xs={12} lg={4}>
					<Paper sx={{ p: 3, height: 400 }}>
						<Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
							<Warning sx={{ mr: 1, color: '#f59e0b' }} />
							<Typography variant="h6" sx={{ fontWeight: 600 }}>
								Low Stock Alerts
							</Typography>
						</Box>
						{loading ? (
							<Box sx={{ height: 320 }}>
								{[1, 2, 3].map((i) => (
									<Skeleton key={i} variant="rectangular" width="100%" height={40} sx={{ mb: 1 }} />
								))}
							</Box>
						) : (
							<Box>
								{lowStock.length === 0 ? (
									<Box sx={{ 
										textAlign: 'center', 
										py: 4,
										color: 'text.secondary'
									}}>
										<Inventory sx={{ fontSize: 48, color: '#10b981', mb: 2 }} />
										<Typography variant="body1" sx={{ fontWeight: 500 }}>
											All products are well stocked! 🎉
										</Typography>
									</Box>
								) : (
									<List dense>
										{lowStock.map((p) => (
											<ListItem 
												key={p._id}
												sx={{ 
													mb: 1,
													borderRadius: 2,
													background: '#fef3c7',
													border: '1px solid #fbbf24'
												}}
											>
												<ListItemText 
													primary={
														<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
															<Typography variant="body2" sx={{ fontWeight: 600 }}>
																{p.name}
															</Typography>
															<Chip 
																label={`Stock: ${p.stock}`} 
																size="small" 
																color="warning"
																variant="outlined"
															/>
														</Box>
													}
													secondary={
														<Box sx={{ mt: 0.5 }}>
															<Typography variant="caption" color="text.secondary">
																SKU: {p.sku} • Threshold: {p.lowStockThreshold}
															</Typography>
														</Box>
													}
												/>
											</ListItem>
										))}
									</List>
								)}
							</Box>
						)}
					</Paper>
				</Grid>
			</Grid>
		</Box>
	);
}