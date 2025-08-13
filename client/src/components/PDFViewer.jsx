import React, { useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, Typography, Button } from '@mui/material';

const PDFViewer = ({ pdfUrl, onLoad, onError }) => {
	const canvasRef = useRef(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(0);
	const [scale, setScale] = useState(1.0);
	const [pdfDoc, setPdfDoc] = useState(null);
	const [pdfjsLib, setPdfjsLib] = useState(null);

	useEffect(() => {
		loadPDFJS();
	}, []);

	useEffect(() => {
		if (pdfjsLib && pdfUrl) {
			loadPDF();
		}
	}, [pdfjsLib, pdfUrl]);

	const loadPDFJS = async () => {
		try {
			// Check if PDF.js is already loaded
			if (window.pdfjsLib) {
				setPdfjsLib(window.pdfjsLib);
				return;
			}

			// Load PDF.js from CDN
			const script = document.createElement('script');
			script.src = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.min.js';
			script.onload = () => {
				// Set worker path
				window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
				setPdfjsLib(window.pdfjsLib);
			};
			script.onerror = () => {
				// Try alternative CDN
				const altScript = document.createElement('script');
				altScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
				altScript.onload = () => {
					window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
					setPdfjsLib(window.pdfjsLib);
				};
				altScript.onerror = () => {
					setError('Failed to load PDF.js library. Please try refreshing the page.');
					setLoading(false);
				};
				document.head.appendChild(altScript);
			};
			document.head.appendChild(script);
		} catch (err) {
			console.error('Error loading PDF.js:', err);
			setError('Failed to load PDF.js library');
			setLoading(false);
		}
	};

	const loadPDF = async () => {
		if (!pdfjsLib || !pdfUrl) {
			console.log('PDF.js lib or URL not ready:', { pdfjsLib: !!pdfjsLib, pdfUrl: !!pdfUrl });
			return;
		}

		try {
			setLoading(true);
			setError(null);
			console.log('Loading PDF from URL:', pdfUrl);
			console.log('PDF.js library loaded:', !!pdfjsLib);

			// Fetch the PDF
			const response = await fetch(pdfUrl);
			console.log('Fetch response status:', response.status, response.statusText);
			
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			
			const arrayBuffer = await response.arrayBuffer();
			console.log('PDF fetched, size:', arrayBuffer.byteLength, 'bytes');
			
			if (arrayBuffer.byteLength === 0) {
				throw new Error('PDF data is empty');
			}

			// Load the PDF document
			console.log('Attempting to load PDF with PDF.js...');
			const pdf = await pdfjsLib.getDocument({ 
				data: arrayBuffer,
				verbosity: 0 // Reduce console output
			}).promise;
			
			console.log('PDF loaded successfully, pages:', pdf.numPages);
			setPdfDoc(pdf);
			setTotalPages(pdf.numPages);

			// Render the first page
			await renderPage(pdf, 1);
			setLoading(false);
			if (onLoad) onLoad();
		} catch (err) {
			console.error('Error loading PDF:', err);
			console.error('Error details:', {
				name: err.name,
				message: err.message,
				stack: err.stack
			});
			setError(`Failed to load PDF: ${err.message}`);
			setLoading(false);
			if (onError) onError(err);
		}
	};

	const renderPage = async (pdf, pageNumber) => {
		if (!pdf || !canvasRef.current) return;

		try {
			console.log('Rendering page:', pageNumber);
			const page = await pdf.getPage(pageNumber);
			const canvas = canvasRef.current;
			const context = canvas.getContext('2d');

			// Calculate viewport
			const viewport = page.getViewport({ scale });
			canvas.height = viewport.height;
			canvas.width = viewport.width;

			// Clear canvas
			context.clearRect(0, 0, canvas.width, canvas.height);

			// Render the page
			const renderContext = {
				canvasContext: context,
				viewport: viewport
			};

			await page.render(renderContext).promise;
			console.log('Page rendered successfully');
			setCurrentPage(pageNumber);
		} catch (err) {
			console.error('Error rendering page:', err);
			setError(`Failed to render page ${pageNumber}: ${err.message}`);
		}
	};

	const changePage = async (delta) => {
		const newPage = currentPage + delta;
		if (newPage >= 1 && newPage <= totalPages && pdfDoc) {
			await renderPage(pdfDoc, newPage);
		}
	};

	const zoomIn = () => {
		setScale(prev => {
			const newScale = Math.min(prev + 0.2, 3.0);
			if (pdfDoc) {
				renderPage(pdfDoc, currentPage);
			}
			return newScale;
		});
	};

	const zoomOut = () => {
		setScale(prev => {
			const newScale = Math.max(prev - 0.2, 0.5);
			if (pdfDoc) {
				renderPage(pdfDoc, currentPage);
			}
			return newScale;
		});
	};

	const retry = () => {
		setError(null);
		setLoading(true);
		loadPDF();
	};

	const openInNewTab = () => {
		if (pdfUrl) {
			window.open(pdfUrl, '_blank');
		}
	};

	const downloadPDF = () => {
		if (pdfUrl) {
			const link = document.createElement('a');
			link.href = pdfUrl;
			link.setAttribute('download', 'invoice.pdf');
			document.body.appendChild(link);
			link.click();
			link.remove();
		}
	};

	if (loading) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column' }}>
				<CircularProgress size={40} />
				<Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
					Loading PDF...
				</Typography>
			</Box>
		);
	}

	if (error) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column' }}>
				<Typography color="error" variant="h6" sx={{ mb: 2 }}>{error}</Typography>
				<Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
					Please try again or download the invoice instead.
				</Typography>
				<Button variant="contained" onClick={retry} sx={{ mb: 1 }}>
					Retry
				</Button>
				<Button variant="outlined" onClick={openInNewTab}>
					Open in New Tab
				</Button>
				<Button variant="outlined" onClick={downloadPDF}>
					Download PDF
				</Button>
			</Box>
		);
	}

	if (!pdfDoc) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
				<Typography color="text.secondary">No PDF loaded</Typography>
			</Box>
		);
	}

	return (
		<Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
			{/* PDF Controls */}
			<Box sx={{ 
				display: 'flex', 
				justifyContent: 'space-between', 
				alignItems: 'center', 
				p: 1, 
				borderBottom: '1px solid #e0e0e0',
				bgcolor: 'grey.50'
			}}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<Button 
						variant="outlined"
						size="small"
						onClick={() => changePage(-1)} 
						disabled={currentPage <= 1}
					>
						← Previous
					</Button>
					<Typography variant="body2" sx={{ minWidth: '80px', textAlign: 'center' }}>
						Page {currentPage} of {totalPages}
					</Typography>
					<Button 
						variant="outlined"
						size="small"
						onClick={() => changePage(1)} 
						disabled={currentPage >= totalPages}
					>
						Next →
					</Button>
				</Box>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<Button 
						variant="outlined"
						size="small"
						onClick={zoomOut}
					>
						Zoom Out
					</Button>
					<Typography variant="body2" sx={{ minWidth: '60px', textAlign: 'center' }}>
						{Math.round(scale * 100)}%
					</Typography>
					<Button 
						variant="outlined"
						size="small"
						onClick={zoomIn}
					>
						Zoom In
					</Button>
				</Box>
			</Box>

			{/* PDF Canvas */}
			<Box sx={{ flex: 1, overflow: 'auto', p: 2, display: 'flex', justifyContent: 'center' }}>
				<canvas 
					ref={canvasRef} 
					style={{ 
						border: '1px solid #e0e0e0',
						boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
						maxWidth: '100%',
						height: 'auto'
					}}
				/>
			</Box>
		</Box>
	);
};

export default PDFViewer; 