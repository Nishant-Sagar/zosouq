from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from database import engine, Base, SessionLocal
from routers import categories, products, orders
from routers.admin import router as admin_router, ensure_default_admin

Base.metadata.create_all(bind=engine)

# Migrations for columns added after initial schema
with engine.connect() as _conn:
    try:
        _conn.execute(text("ALTER TABLE orders ADD COLUMN shipping_fee FLOAT DEFAULT 0.0"))
        _conn.commit()
    except Exception:
        pass
    try:
        _conn.execute(text("ALTER TABLE orders ADD COLUMN updated_at DATETIME"))
        _conn.commit()
    except Exception:
        pass

# Seed default admin user
_db = SessionLocal()
try:
    ensure_default_admin(_db)
finally:
    _db.close()

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
app.include_router(admin_router, prefix="/api/admin", tags=["admin"])


@app.get("/")
def root():
    return {"message": "Zosouq E-Commerce API is running!"}
