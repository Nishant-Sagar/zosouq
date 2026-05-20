from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from database import engine, Base
from routers import categories, products, orders

Base.metadata.create_all(bind=engine)

# Add shipping_fee column to existing orders tables that predate it
with engine.connect() as _conn:
    try:
        _conn.execute(text("ALTER TABLE orders ADD COLUMN shipping_fee FLOAT DEFAULT 0.0"))
        _conn.commit()
    except Exception:
        pass  # column already exists

app = FastAPI(title="Zosouq E-Commerce API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(categories.router, prefix="/api/categories", tags=["categories"])
app.include_router(products.router, prefix="/api/products", tags=["products"])
app.include_router(orders.router, prefix="/api/orders", tags=["orders"])


@app.get("/")
def root():
    return {"message": "Zosouq E-Commerce API is running!"}
