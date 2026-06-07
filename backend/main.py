import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from database import engine, Base, SessionLocal
from routers import categories, products, orders
from routers.admin import router as admin_router, ensure_default_admin
from routers.banners import router as banners_router
from routers.reviews import router as reviews_router
from routers.sitemap import router as sitemap_router

# Create all tables (safe to run every startup — skips existing tables)
Base.metadata.create_all(bind=engine)

# Seed default admin user
_db = SessionLocal()
try:
    ensure_default_admin(_db)
finally:
    _db.close()

app = FastAPI(title="Zosouq E-Commerce API", version="1.0.0")

# Allow the Vercel frontend origin + localhost for dev
ALLOWED_ORIGINS = os.environ.get(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:5176,http://localhost:5177"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # tighten to ALLOWED_ORIGINS after domain is confirmed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(categories.router, prefix="/api/categories", tags=["categories"])
app.include_router(products.router,   prefix="/api/products",   tags=["products"])
app.include_router(orders.router,     prefix="/api/orders",     tags=["orders"])
app.include_router(admin_router,      prefix="/api/admin",      tags=["admin"])
app.include_router(banners_router,    prefix="/api/banners",    tags=["banners"])
app.include_router(reviews_router,    prefix="/api/reviews",    tags=["reviews"])
app.include_router(sitemap_router,    prefix="",                tags=["sitemap"])

STATIC_DIR = Path(__file__).parent / "static"
STATIC_DIR.mkdir(exist_ok=True)
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


@app.get("/")
def root():
    return {"message": "Zosouq API is running!"}
