from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from database import get_db
import models
import schemas
from typing import Optional

router = APIRouter()


@router.get("/", response_model=list[schemas.Product])
def get_products(
    category_slug: Optional[str] = None,
    featured: Optional[bool] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    skip: int = 0,
    limit: int = 40,
    db: Session = Depends(get_db),
):
    query = db.query(models.Product).filter(models.Product.is_active == True)

    if category_slug:
        category = db.query(models.Category).filter(models.Category.slug == category_slug).first()
        if category:
            query = query.filter(models.Product.category_id == category.id)

    if featured is not None:
        query = query.filter(models.Product.is_featured == featured)

    if search:
        query = query.filter(
            or_(
                models.Product.name.ilike(f"%{search}%"),
                models.Product.description.ilike(f"%{search}%"),
                models.Product.brand.ilike(f"%{search}%"),
            )
        )

    if min_price is not None:
        query = query.filter(models.Product.price >= min_price)

    if max_price is not None:
        query = query.filter(models.Product.price <= max_price)

    return query.offset(skip).limit(limit).all()


@router.get("/count")
def get_products_count(
    category_slug: Optional[str] = None,
    featured: Optional[bool] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.Product).filter(models.Product.is_active == True)
    if category_slug:
        category = db.query(models.Category).filter(models.Category.slug == category_slug).first()
        if category:
            query = query.filter(models.Product.category_id == category.id)
    if featured is not None:
        query = query.filter(models.Product.is_featured == featured)
    if search:
        query = query.filter(
            or_(
                models.Product.name.ilike(f"%{search}%"),
                models.Product.description.ilike(f"%{search}%"),
                models.Product.brand.ilike(f"%{search}%"),
            )
        )
    if min_price is not None:
        query = query.filter(models.Product.price >= min_price)
    if max_price is not None:
        query = query.filter(models.Product.price <= max_price)
    return {"count": query.count()}


@router.get("/{slug}", response_model=schemas.Product)
def get_product(slug: str, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(
        models.Product.slug == slug, models.Product.is_active == True
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product
