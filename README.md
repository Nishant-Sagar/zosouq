# Zosouq — E-Commerce Store

A full-stack e-commerce website built with **React** (frontend) and **FastAPI** (backend).

## Features

- 8 product categories with 50+ products
- Product listing, filtering, and search
- Detailed product pages with related products
- Shopping cart with localStorage persistence
- Cash on delivery checkout
- Order confirmation with tracking status
- Responsive design (mobile-friendly)
- Beautiful modern UI with Tailwind CSS

---

## Setup

### Backend (FastAPI)

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate       # macOS/Linux
# venv\Scripts\activate        # Windows

# Install dependencies
pip install -r requirements.txt

# Seed the database with sample data
python seed_data.py

# Start the server
uvicorn main:app --reload --port 8080
```

Backend runs at: http://localhost:8080  
API docs: http://localhost:8080/docs

---

### Frontend (React + Vite)

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs at: http://localhost:5173

---

## Project Structure

```
Zosouq/
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── models.py            # SQLAlchemy database models
│   ├── schemas.py           # Pydantic request/response schemas
│   ├── database.py          # Database connection setup
│   ├── seed_data.py         # Sample data seeder
│   ├── requirements.txt
│   └── routers/
│       ├── categories.py    # Category endpoints
│       ├── products.py      # Product endpoints (search, filter)
│       └── orders.py        # Order placement & tracking
│
└── frontend/
    └── src/
        ├── App.jsx
        ├── api/index.js         # Axios API calls
        ├── context/
        │   └── CartContext.jsx  # Cart state + toast notifications
        ├── components/
        │   ├── Navbar.jsx
        │   ├── Footer.jsx
        │   └── ProductCard.jsx
        └── pages/
            ├── HomePage.jsx
            ├── CategoryPage.jsx
            ├── ProductPage.jsx
            ├── CartPage.jsx
            ├── CheckoutPage.jsx
            ├── OrderConfirmationPage.jsx
            ├── SearchPage.jsx
            └── NotFoundPage.jsx
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/categories/ | List all categories |
| GET | /api/categories/{slug} | Get category by slug |
| GET | /api/products/ | List products (supports: category_slug, featured, search, min_price, max_price) |
| GET | /api/products/{slug} | Get product by slug |
| POST | /api/orders/ | Create a new order |
| GET | /api/orders/{order_number} | Track an order |

## Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, React Router v6, Axios, Lucide Icons  
**Backend:** FastAPI, SQLAlchemy, SQLite, Pydantic, Uvicorn
