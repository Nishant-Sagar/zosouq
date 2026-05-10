from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
import models
import schemas

router = APIRouter()


@router.get("/", response_model=list[schemas.Category])
def get_categories(db: Session = Depends(get_db)):
    cats = db.query(models.Category).filter(models.Category.is_active == True).order_by(models.Category.sort_order, models.Category.id).all()
    # Attach product count to each category
    counts = dict(
        db.query(models.Product.category_id, func.count(models.Product.id))
        .filter(models.Product.is_active == True)
        .group_by(models.Product.category_id)
        .all()
    )
    for cat in cats:
        cat.product_count = counts.get(cat.id, 0)
    return cats


@router.get("/{slug}", response_model=schemas.Category)
def get_category(slug: str, db: Session = Depends(get_db)):
    category = db.query(models.Category).filter(models.Category.slug == slug).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category
