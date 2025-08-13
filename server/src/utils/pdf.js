import PDFDocument from 'pdfkit';

export function generateInvoicePDF(sale) {
	try {
		console.log('Starting PDF generation for sale:', sale.invoiceNumber);
		
		// Validate sale data
		if (!sale || !sale.invoiceNumber) {
			throw new Error('Invalid sale data: missing invoice number');
		}
		
		if (!sale.items || sale.items.length === 0) {
			throw new Error('Invalid sale data: no items found');
		}
		
		const doc = new PDFDocument({ 
			size: 'A4', 
			margin: 50,
			info: {
				Title: `Invoice ${sale.invoiceNumber}`,
				Author: 'Make My Bill',
				Subject: 'Invoice',
				Keywords: 'invoice, billing, pos'
			}
		});

		// Header
		doc
			.fontSize(24)
			.font('Helvetica-Bold')
			.fillColor('#6366f1')
			.text('Make My Bill', { align: 'center' })
			.moveDown(0.5);

		doc
			.fontSize(14)
			.font('Helvetica')
			.fillColor('#64748b')
			.text('Professional Billing & POS System', { align: 'center' })
			.moveDown(2);

		// Invoice Details
		doc
			.fontSize(16)
			.font('Helvetica-Bold')
			.fillColor('#1e293b')
			.text('INVOICE', { align: 'right' })
			.moveDown(0.5);

		doc
			.fontSize(12)
			.font('Helvetica')
			.fillColor('#64748b')
			.text(`Invoice #: ${sale.invoiceNumber}`, { align: 'right' })
			.text(`Date: ${new Date(sale.createdAt).toLocaleDateString('en-US', { 
				year: 'numeric', 
				month: 'long', 
				day: 'numeric' 
			})}`, { align: 'right' })
			.moveDown(2);

		// Customer Information
		doc
			.fontSize(14)
			.font('Helvetica-Bold')
			.fillColor('#1e293b')
			.text('Bill To:')
			.moveDown(0.5);

		if (sale.customer) {
			doc
				.fontSize(12)
				.font('Helvetica')
				.fillColor('#64748b')
				.text(sale.customer.name || 'Unknown Customer')
				.text(sale.customer.email || '')
				.text(sale.customer.phone || '')
				.text(sale.customer.address || '');
		} else {
			doc
				.fontSize(12)
				.font('Helvetica')
				.fillColor('#64748b')
				.text('Walk-in Customer');
		}

		doc.moveDown(2);

		// Items Table
		const tableTop = doc.y;
		const tableLeft = 50;
		const tableWidth = 495;
		const colWidths = [200, 80, 80, 80, 55];

		// Table Header
		doc
			.fontSize(12)
			.font('Helvetica-Bold')
			.fillColor('#ffffff')
			.rect(tableLeft, tableTop, tableWidth, 25)
			.fill()
			.fillColor('#1e293b')
			.text('Item', tableLeft + 10, tableTop + 8)
			.text('SKU', tableLeft + colWidths[0] + 10, tableTop + 8)
			.text('Qty', tableLeft + colWidths[0] + colWidths[1] + 10, tableTop + 8)
			.text('Price', tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + 10, tableTop + 8)
			.text('Total', tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 10, tableTop + 8);

		// Table Rows
		let currentY = tableTop + 25;
		console.log('Processing items:', sale.items.length);
		
		sale.items.forEach((item, index) => {
			const rowHeight = 30;
			
			// Alternate row colors
			if (index % 2 === 0) {
				doc
					.fillColor('#f8fafc')
					.rect(tableLeft, currentY, tableWidth, rowHeight)
					.fill();
			}

			doc
				.fontSize(10)
				.font('Helvetica')
				.fillColor('#1e293b');

			// Item name - handle both populated and unpopulated cases
			const productName = item.product?.name || (typeof item.product === 'string' ? 'Product' : 'Unknown Product');
			doc.text(productName, tableLeft + 10, currentY + 10);
			
			// SKU - handle both populated and unpopulated cases
			const productSku = item.product?.sku || (typeof item.product === 'string' ? 'N/A' : 'N/A');
			doc.text(productSku, tableLeft + colWidths[0] + 10, currentY + 10);
			
			// Quantity
			doc.text(item.quantity.toString(), tableLeft + colWidths[0] + colWidths[1] + 10, currentY + 10);
			
			// Price
			doc.text(`₹${item.price.toFixed(2)}`, tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + 10, currentY + 10);
			
			// Total
			doc.text(`₹${(item.price * item.quantity).toFixed(2)}`, tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 10, currentY + 10);

			currentY += rowHeight;
		});

		// Table border
		doc
			.strokeColor('#e2e8f0')
			.lineWidth(1)
			.rect(tableLeft, tableTop, tableWidth, currentY - tableTop)
			.stroke();

		doc.moveDown(1);

		// Totals
		const totalsY = currentY + 20;
		doc
			.fontSize(12)
			.font('Helvetica')
			.fillColor('#64748b');

		// Subtotal
		doc
			.text('Subtotal:', tableLeft + tableWidth - 150, totalsY)
			.text(`₹${sale.total.toFixed(2)}`, tableLeft + tableWidth - 50, totalsY);

		// Total
		doc
			.fontSize(14)
			.font('Helvetica-Bold')
			.fillColor('#1e293b')
			.text('Total:', tableLeft + tableWidth - 150, totalsY + 20)
			.text(`₹${sale.total.toFixed(2)}`, tableLeft + tableWidth - 50, totalsY + 20);

		// Payment Method
		doc.moveDown(2);
		doc
			.fontSize(12)
			.font('Helvetica-Bold')
			.fillColor('#1e293b')
			.text(`Payment Method: ${(sale.paymentMethod || 'cash').toUpperCase()}`);

		// Footer
		doc.moveDown(3);
		doc
			.fontSize(10)
			.font('Helvetica')
			.fillColor('#64748b')
			.text('Thank you for your business!', { align: 'center' })
			.moveDown(0.5)
			.text('Make My Bill - Professional Billing & POS System', { align: 'center' })
			.moveDown(0.5)
			.text(`Generated on ${new Date().toLocaleString('en-US')}`, { align: 'center' });

		// Add page numbers if multiple pages
		doc.on('pageAdded', () => {
			const pageCount = doc.bufferedPageRange().count;
			for (let i = 0; i < pageCount; i++) {
				doc.switchToPage(i);
				doc
					.fontSize(10)
					.font('Helvetica')
					.fillColor('#64748b')
					.text(`Page ${i + 1} of ${pageCount}`, 50, doc.page.height - 50, { align: 'left' });
			}
		});

		console.log('PDF generation completed successfully');
		doc.end();
		return doc;
	} catch (error) {
		console.error('Error in PDF generation:', error);
		throw error;
	}
}