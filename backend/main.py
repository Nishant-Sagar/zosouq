import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database import engine, Base
from routers import categories, products, orders

Base.metadata.create_all(bind=engine)

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

EXTRAS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "Extras")
app.mount("/static", StaticFiles(directory=EXTRAS_DIR), name="static")


@app.get("/")
def root():
    return {"message": "Zosouq E-Commerce API is running!"}
