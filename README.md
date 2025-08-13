# Make My Bill – Billing & POS System (MERN)

Production-style Billing & POS application built with the MERN stack. It provides inventory management, POS checkout, invoice PDF generation, analytics dashboard, and low stock alerts with a polished, professional UI.

## Tech Stack
- Backend: Node.js, Express.js, MongoDB (Mongoose), PDFKit
- Frontend: React (Vite), Material UI (MUI), Recharts, React Router
- Tooling: Axios, CORS, Dotenv, Nodemon

## Features
- Inventory management (CRUD for products, stock levels, low stock threshold)
- POS checkout flow with cart, payment method, and customer association
- Dynamic invoice PDF generation using PDFKit
- Analytics dashboard with charts (revenue, sales, top products)
- Low stock alerts
- Basic customer management (CRUD)

## Project Structure
```
Make My Bill/
  server/              # Express API + MongoDB + PDFKit
    src/
      models/         # Mongoose schemas
      routes/         # API routes
      utils/          # PDF generation utility
      index.js        # App entrypoint
    package.json
    .env.example
  client/             # React + MUI + Recharts (Vite)
    src/
      components/     # Shared UI components
      pages/          # Routed pages
      App.jsx
      main.jsx
      api.js          # Axios instance
    index.html
    package.json
    vite.config.js
README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB running locally or a MongoDB Atlas URI

### Backend Setup
1. Open a terminal in `server`:
```bash
cd server
npm install
# Windows PowerShell
Copy-Item .env.example .env
```
2. Edit `.env` as needed (Mongo URI, CORS).
3. Start the server:
```bash
npm run dev
```
Server runs at `http://localhost:5000`.

### Frontend Setup
1. Open a new terminal in `client`:
```bash
cd client
npm install
npm run dev
```
App runs at `http://localhost:5173`.

### Default Configuration
- Backend API base URL: `http://localhost:5000/api`
- Frontend expects the API above and will show empty lists until you create data.

## Demo Workflow
- Create a few products in Inventory (set `lowStockThreshold` to test alerts)
- Create a customer
- Use POS page to add products to cart and complete sale
- After sale, the invoice PDF opens/downloads
- Dashboard shows KPIs, charts, and low stock cards

## Notes
- This project is designed to be concise yet representative for portfolio/resume use.
- Security/auth is out of scope for brevity; add JWT/auth if needed.

## Scripts
Backend (`server/package.json`):
- `npm run dev` – start with nodemon
- `npm start` – start production server

Frontend (`client/package.json`):
- `npm run dev` – start Vite dev server
- `npm run build` – production build
- `npm run preview` – preview production build

## License
MIT